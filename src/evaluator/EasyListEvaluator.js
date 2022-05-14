import validator from "validator";
import psl from "psl";

export default function (mParser) {
  let parser = new mParser();

  const urlOptions = { 
    protocols: ["http", "https"], 
    require_protocol: true,
  };

  let checkType = (params, isNegated, option) => {
    let type = (option === "subdocument") 
      ? "sub_frame" 
      : option;

    return (isNegated) 
      ? params.type != type
      : params.type == type;
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
    "domain": (params, isNegated, option, attrs) => {
      let source;
      if (!validator.isURL(new String(params.domain), urlOptions)) {       
        source = undefined;
      } else {
        source = psl.get(new URL(params.domain).hostname);
      }

      return attrs
        .map((domain) => {
          return (domain.startsWith("~")) ?
            source != domain :
            source == domain
        })
        .reduce(
          (acc, val) => acc || val, 
          false
        );
    },
    "third-party": (params, isNegated, option, attrs) => {
      let target = psl.get(new URL(params.url).hostname)
      let source;
      if (!validator.isURL(new String(params.domain), urlOptions)) {       
        source = undefined;
      } else {
        source = psl.get(new URL(params.domain).hostname);
      }

      return (isNegated) 
        ? source == target
        : source != target;
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

  let testOptions = (params, rule) => Object
    .keys(rule.options)
    .map((o) => {
      if (o.length === 0) {
        return true;
      }
      let isNegated = o.startsWith("~");
      let option = (isNegated) ? o.slice(1) : o;
      return options[option](params, isNegated, option, rule.options[o])
    })
    .reduce((acc, val) => acc && val, true);

  let cache = { noMatch: {}};

  let toCache = (url, param) => {
    if (!cache[url]) {
      cache[url] = [];
    }
    cache[url].push(param);
    return param.result;
  }

  let fromCache = (url) => {
    if (cache[url]) {
      return cache[url];
    } else {
      return [];
    }
  };

  const noMatch = {
    isLabeled: false,
    rule: undefined,
    type: "404: No matching rule",
  };

  return {
    parser: () => parser,

    isLabeled: function (params) {

      if (cache.noMatch[params.url]) {
        return noMatch;
      }

      // cached rules
      for (let item of fromCache(params.url)) {
        let optionsResult = (item.rule.options) 
          ? testOptions(params, item.rule) 
          : true;

        if (item.rule.parsedRule.test(params.url) && optionsResult) {
          return item.result;
        }
      }
      
      // covers byException() & byDomain() -> super fast
      let domain = psl.get(new URL(params.url).hostname);
      for (let isException of [true, false]) {
        let indexes = parser.index(domain, isException);
        for (let i of indexes) {
          let rule = parser.rule(i);
          let optionsResult = (rule.options) 
            ? testOptions(params, rule) 
            : true;

          if (rule.parsedRule.test(params.url) && optionsResult) {
            return toCache(params.url, { 
              rule: rule, 
              result: {
                isLabeled: !isException,
                rule: rule.rule,
                type: (isException) 
                  ? "200: Exception rule" 
                  : "201: Domain rule",
              }
            });
          }
        }
      }

      // covers byExactDomain() -> slow but neglectable 
      for (let rule of parser.byExactDomain()) {
        let optionsResult = (rule.options) 
          ? testOptions(params, rule) 
          : true;

        if (rule.parsedRule.test(params.url) && optionsResult) {
          return toCache(params.url, {
            rule: rule,
            result: {
              isLabeled: true,
              rule: rule.rule,
              type: "202: Exact domain rule"
            }
          });
        }
      }

      // covers byAddressPart() -> super slow
      for (let addrPartRule of parser.byAddressPart()) {
        let partToCheck = (addrPartRule.rule.includes("*")) ?
          addrPartRule.rule.split("*")[0] :
          addrPartRule.rule;

        let optionsResult = (addrPartRule.options) 
          ? testOptions(params, addrPartRule) 
          : true;

        if (params.url.includes(partToCheck)) {
          if (addrPartRule.parsedRule.test(params.url) && optionsResult) {
            return toCache(params.url, {
              rule: addrPartRule,
              result: {
                isLabeled: true,
                rule: addrPartRule.rule,
                type: "203: Address part"
              }
            });
          }
        }
      }

      cache.noMatch[params.url] = true;
      return noMatch;
    },
  };
};