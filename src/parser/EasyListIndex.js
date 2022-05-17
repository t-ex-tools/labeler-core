import symbols from "../static/easylist/symbols.js";
import keywords from "../static/easylist/keywords.json";

export default function() {

  let index = {
    "domain": { err: [] },
    "exception": { err: [] },
    "keyword": { err: [] },
    "other": { general: [], xdomain: [] }
  };

  let url = (rule, pos, symbol, target) => {
    try {
      let url = new URL(encodeURI(rule
        .replace(symbol, "https://")
        .replace("^", "")
      ));

      (index[target][url.hostname])
        ? index[target][url.hostname].push(pos)
        : index[target][url.hostname] = [pos];

    } catch (err) {
      index[target].err.push(pos);
    }
  };

  let keyword = (rule, pos) => {
    let included = false;
    keywords
      .forEach((k, i) => {
        if (rule.includes(k)) {
          included = true;

          (index.keyword[k])
            ? index.keyword[k].push(pos)
            : index.keyword[k] = [pos];
        }

        if (i === keywords.length - 1 &&
          !included) {
          index.keyword.err.push(pos);
        }
      });
  };

  let idx = (rule, pos) => {
    if (symbols.xdomain.test(rule)) {
      index.other.xdomain.push(pos);
    } else if (rule.startsWith(symbols.domain)) {
      url(rule, pos, symbols.domain, "domain");
    } else if (rule.startsWith(symbols.exception)) {
      url(rule, pos, symbols.exception, "exception");
    } else {
      keyword(rule, pos);
    }
  };

  return {
    from: (key, target) => 
      index[target][key] || [],

    to: (rule, pos) => idx(rule, pos),

    general: (pos) => 
      index.other.general.push(pos)
  };
};