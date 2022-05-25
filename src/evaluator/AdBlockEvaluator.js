import { Request } from '@cliqz/adblocker';

export default function(mParser) {
  let parser = new mParser();

  return {
    parser: () => parser,

    isLabeled(params) {
      const result = parser.engine().match(Request.fromRawDetails({
        type: params.type,
        url: params.url,
        sourceUrl: params.domain
      }));

      return {
        isLabeled: result.match,
        rule: (result.filter) ? Object.entries(result.filter) : undefined,
        type: undefined
      };
    }
  }
}