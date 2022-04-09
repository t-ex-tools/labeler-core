var EasyListEvaluator = function(mParser) {
  let parser = new mParser();
  let cache = {};

  let checkType = (r, isNegated, option) => {
    let type = (option === "subdocument") ? "sub_frame" : option;
    return (isNegated) ? 
      r.type !== type 
      : r.type === type;  
  }

  let options = {
    "script": checkType,
    "image": checkType,
    "stylesheet": checkType,
    "object": checkType,
    "xmlhttprequest": checkType,
    "subdocument": checkType,
    "ping": checkType,
    "websocket": checkType,
    "font": checkType,
    "media": checkType,
    "other": checkType,
    "domain": (r, isNegated, option, attrs) => {
      try {
        let hostname = new URL(r.source).hostname;
        return attrs
          // TODO: check!
          .map((domain) => (domain.startsWith("~")) ?
            hostname.indexOf(domain.slice(1)) === -1 :
            hostname.indexOf(domain) > -1)
          .reduce((acc, val) => acc || val, false);
      } catch (err) {
        return false;
      }
    },
    "third-party": (r, isNegated, option, attrs) => {
      if (r.type === "main_frame") {
        return isNegated;
      }
      try {
        let source = new URL(r.source);
        let target = new URL(r.url);
        return (isNegated) ? 
          source.hostname === target.hostname
          : source.hostname !== target.hostname;
      } catch (err) {
        return false;
      }
    },    

    // NOTE:  following options are neglected
    "csp": () => true,
    "webrtc": () => false,
    "document": () => false,
    "elemhide": () => true,
    "generichide": () => true,
    "genericblock": () => true,
    "popup": () => true, // NOTE: rules that block third-party requests in popups
    "match-case": () => true,
  };  

  let testOptions = (r, rule) => Object
    .keys(rule.options)
    .map((o) => {
      if (o.length === 0) {
        return true;
      }
      let isNegated = o.startsWith("~");
      let option = (isNegated) ? o.slice(1) : o;
      return options[option](r, isNegated, option, rule.options[o])
    })
    .reduce((acc, val) => acc && val, true);

  return {
    parser: () => parser,
    
    isLabeled: function(r) {
      let host;
      try {
        host = new URL(r.url).hostname;
      } catch(err) {
        console.debug(r.url + " invalid. Data point skipped.");
        return {
          isLabeled: false,
          rule: null,
          type: null
        };
      }

      for (let isException of [true, false]) {
        let indexes = parser.index(host, isException); // covers byException() & byDomain() -> super fast
        for (let i of indexes) {
          let rule = parser.rule(i);
          let optionsResult = (rule.options) ? testOptions(r, rule) : true;
          if (rule.parsedRule.test(r.url) && optionsResult) {
            return {
              isLabeled: !isException,
              rule: rule.rule,
              type: (isException) ? "byException" : "byDomain",
            };
          }
        }
      }

      for (let rule of parser.byExactDomain()) { // covers byExactDomain() -> slow but neglectable 
        let optionsResult = (rule.options) ? testOptions(r, rule) : true;
        if (rule.parsedRule.test(r.url) && optionsResult) {
          return {
            isLabeled: true,
            rule: rule.rule,
            type: "byExactDomain"
          };
        } 
      }      

      for (let addrPartRule of parser.byAddressPart()) { // covers byAddressPart() -> super slow
        let partToCheck = (addrPartRule.rule.includes("*")) ?
          addrPartRule.rule.split("*")[0] :
          addrPartRule.rule;
        
        let optionsResult = (addrPartRule.options) ? testOptions(r, addrPartRule) : true;
        if (r.url.includes(partToCheck)) {
          if (addrPartRule.parsedRule.test(r.url) && optionsResult) {
            return {
              isLabeled: true,
              rule: addrPartRule.rule,
              type: "byAddressPart"
            };
          }
        }        
      }

      return {
        isLabeled: false,
        rule: null,
        type: null,
      };
    },
  };
};