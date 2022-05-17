export default function() {

  let cache = { noMatch: {} };

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

  return {
    from: fromCache,

    to: toCache,

    hadNoMatch: (url) => (cache.noMatch[url])
      ? true
      : false,

    foundNoMatch: (url) =>
      cache.noMatch[url] = true
  }

}