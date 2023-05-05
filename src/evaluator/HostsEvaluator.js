import validator from "validator";
import { getDomain } from "tldjs";

export default function(mParser) {
  let parser = new mParser();

  const urlOptions = {
    protocols: ["http", "https"],
    require_protocol: true,
  };

  return {

    parser: () => parser,

    isLabeled: (params) => {
      let target = getDomain(new URL(params.url).hostname)
      let source;
      
      if (!validator.isURL(new String(params.initiator), urlOptions)) {
        source = undefined;
      } else {
        source = getDomain(new URL(params.initiator).hostname);
      }

      /* NOTE: this is up to debate
      if (target !== source) {
        return {
          isLabeled: false,
          rule: undefined,
          type: undefined,
        };        
      }
      */

      let res = parser.rules()[target];
        
      // TODO: unify response format with adblock
      return {
        isLabeled: (res) ? true : false,
        rule: (res) ? target : null,
        type: "hostname",
      };
    }

  };
};