import validator from "validator";
import psl from "psl";
export default function() {
  
  const urlOptions = {
    protocols: ["http", "https"],
    require_protocol: true,
  };

  let options = {
    "type": (params, isNegated, option, attrs) => {
      let type = (params.type === "subdocument")
        ? "sub_frame"
        : params.type;

      return attrs
        .map((t) => {
          return (type.startsWith("~")) ?
            type != t :
            type == t
        })
        .reduce(
          (acc, val) => acc || val,
          false
        );
    },
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
    "document": () => false,
    "elemhide": () => true,
    "generichide": () => true,
    "genericblock": () => true,
    "popup": () => true,
    "match-case": () => true,
  };

  let testOptions = (params, rule) => {
    return Object
      .keys(rule.options)
      .map((o) => {
        let isNegated = o.startsWith("~");
        let option = (isNegated) ? o.slice(1) : o;

        return options[option]
          .call(
            this,
            params,
            isNegated,
            option,
            rule.options[o]
          );
      })
      .reduce((acc, val) =>
        acc && val,
        true
      );
  };

  let testRule = (params, rule) => {
    let opts = (rule.options)
      ? testOptions(params, rule)
      : true;

    if (typeof rule.parsed.test === "function") {
      return rule.parsed.test(params.url) && opts;
    } else {
      console.debug(rule.raw + " could not be tested");
      return false;
    }
  }

  let testPart = (params, rule) => {
    let partToCheck = (rule.raw.includes("*")) ?
      rule.raw.split("*")[0] :
      rule.raw;

    if (!params.url.includes(partToCheck)) {
      return false;
    }

    if (testRule(params, rule)) {
      return true;
    } else {
      return false;
    }
  }

  return {
    rule: testRule,
    part: testPart
  }

}