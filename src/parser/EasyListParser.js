import symbols from "../static/easylist/symbols.js";
import types from "../static/easylist/types.json";
import EasyListIndex from "./EasyListIndex.js";

export default function () {
  let Indexer = new EasyListIndex();
  let rules = [];

  // NOTE:  taken from Takano et al.
  //        doi: 10.13052/jsn2445-9739.2017.006
  let toRegExp = (rule, matchCase) => {
    return new RegExp(rule
      .replace("@@", "")
      .replace("||", "")
      .replace(/\*+/g, "*")
      .replace(/\^\|$/, "^")
      .replace(/\W/g, "\\$&")
      .replace(/\\\*/g, ".*")
      .replace(/\\\^/g, "(?:[\\x00-\\x24\\x26-\\x2C\\x2F\\x3A-\\x40\\x5B-\\x5E\\x60\\x7B-\\x7F]|$)")
      .replace(/^\\\|\\\|/, "^[\\w\\-]+:\\/+(?!\\/)(?:[^\\/]+\\.)?")
      .replace(/^\\\|/, "^")
      .replace(/\\\|$/, "$")
      .replace(/^(\.\*)/, "")
      .replace(/(\.\*)$/, ""),
      (matchCase) ? "" : "i"
    );
  };

  let isType = (o) =>
    (o.startsWith("~"))
      ? types.includes(o.slice(1))
      : types.includes(o);

  let options = (str) => {
    let attrs = str.split(",");
    let typeOpts = attrs.filter(isType);
    let t = (typeOpts.length > 0)
      ? "type=" + typeOpts.join("|")
      : undefined;

    let result = attrs
      .filter((o) => !isType(o))
      .concat((t) ? [t] : [])
      .map((option) => {
        let kv = option.split("=");
        let result = {};
        result[kv[0]] = (kv[1]) ? kv[1].split("|") : [];
        return result;
      })
      .reduce((acc, val) => {
        let key = Object.keys(val)[0];
        acc[key] = val[key];
        return acc;
      }, {});

    return result;
  };  

  let parse = (list) => {
    rules = list
      .split("\n")
      .slice(1)
      .filter((line) => !(
        line.startsWith(symbols.comment) ||
        line.includes(symbols.element) ||
        line.includes(symbols.xelement) ||
        line.includes(symbols.yelement) ||
        line.includes(symbols.zelement) ||
        line === ""
      ))
      .map((line, i, arr) => {
        let optIdx = line.lastIndexOf("$");
        let rule = (optIdx > -1)
          ? [line.slice(0, optIdx), line.slice(optIdx + 1)]
          : [line, undefined];

        let opt = (rule[1])
          ? options(rule[1])
          : undefined;

        let regExp = (symbols.regexp.test(rule[0]))
          ? new RegExp(rule[0])
          : toRegExp(rule[0], (opt && opt["match-case"]));

        if (!rule[0]) {
          Indexer.general(i);
        } else {
          Indexer.to(rule[0], i);
        }
        
        return {
          raw: line,
          parsed: regExp,
          options: opt,
        };
      });
  };
  
  return {
    parse: (list) => parse(list),

    rule: (index) => rules[index],

    index: Indexer.from,
  };

};