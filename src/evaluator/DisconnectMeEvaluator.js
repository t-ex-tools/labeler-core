import validator from "validator";
import psl from "psl";

export default function(mParser) {
  let parser = new mParser();

  const urlOptions = {
    protocols: ["http", "https"],
    require_protocol: true,
  };

  return {
    parser: () => parser,

    isLabeled: (params) => {
      let target = psl.get(new URL(params.url).hostname)
      let source;
      if (!validator.isURL(new String(params.domain), urlOptions)) {
        source = undefined;
      } else {
        source = psl.get(new URL(params.domain).hostname);
      }

      if (target !== source) {
        return {
          isLabeled: false,
          rule: undefined,
          type: undefined,
        };        
      }

      let res = parser.rule(target);
      return {
        isLabeled: res.length > 0,
        rule: (res.length > 0) ? target : undefined,
        type: res,
      };
    }
  };

};