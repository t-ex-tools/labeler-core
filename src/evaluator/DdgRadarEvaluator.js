export default function(mParser) {
  let parser = new mParser();

  let isThirdParty = (r) => {
    try {
      let source = new URL(r.source);
      let target = new URL(r.url);
      return source.hostname !== target.hostname;
    } catch (err) {
      return false;
    }    
  }

  return {
    parser: () => parser,

    isLabeled: (r) => {
      if (!isThirdParty(r)) {
        return {
          isLabeled: false,
          rule: undefined,
          type: undefined,
        };        
      }

      let entry = parser.rule(new URL(r.url).hostname); 
      for (source of entry) {
        for (resource of source.resources) {
          try {
            if (new RegExp(resource.rule).test(r.url)) {
              return {
                isLabeled: true,
                rule: resource.rule,
              };
            }
          } catch (err) {
          }
        }
      }
      return {
        isLabeled: false,
        rule: undefined,
        type: undefined
      };
    }
  };

};