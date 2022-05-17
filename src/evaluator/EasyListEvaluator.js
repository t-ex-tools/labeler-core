import psl from "psl";
import keywords from "../static/easylist/keywords.json";
import EasyListCache from "./EasyListCache";
import EasyListTester from "./EasyListTester";

export default function (mParser) {
  let Tester = new EasyListTester();
  let Cacher = new EasyListCache();
  let parser = new mParser();

  const noMatch = {
    isLabeled: false,
    rule: undefined,
    type: "404: No matching rule",
  };

  let indexes = (domain) => {
    let idxs = [{
      result: true,
      type: "200: Domain rule",
      test: Tester.rule,
      indexes: parser.index(domain, "domain"),
    }, {
      result: false,
      type: "201: Exception rule",
      test: Tester.rule,
      indexes: parser.index(domain, "exception"),
    }, {
      result: true,
      type: "202: Exact domain rule",
      test: Tester.rule,
      indexes: parser.index("xdomain", "other"),
    }, {
      result: true,
      type: "203: General rule",
      test: Tester.rule,
      indexes: parser.index("general", "other"),
    }];

    for (let keyword of keywords) {
      idxs.push({
        result: true,
        type: "204: Indexed address part",
        test: Tester.part,
        indexes: parser.index(keyword, "keyword"),
      });
    }

    idxs.push({
      result: true,
      type: "205: Not indexed address part",
      test: Tester.part,
      indexes: parser.index("err", "keyword"),
    });

    return idxs;
  }

  return {
    parser: () => parser,

    isLabeled: function (params) {
      let domain = psl.get(new URL(params.url).hostname);

      if (Cacher.hadNoMatch(params.url)) {
        return noMatch;
      }

      for (let item of Cacher.from(params.url)) {
        if (Tester.rule(params, item.rule)) {
          return item.result;
        }
      }

      let queue = indexes(domain);
      for (let item of queue) {
        for (let i of item.indexes) {
          let rule = parser.rule(i);
          if (item.test(params, rule)) {
            return Cacher.to(params.url, {
              rule: rule,
              result: {
                isLabeled: item.result,
                rule: rule.raw,
                type: item.type
              }
            });
          }
        }
      }

      Cacher.foundNoMatch(params.url);
      return noMatch;
    },
  };
};