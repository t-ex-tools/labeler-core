export default function () {
  let rules = {};

  let parseList = (list) => {
    rules = list
      .split('\n')
      .filter((e) => e.startsWith('0.0.0.0 '))
      .map((e) => e.split('0.0.0.0 ').pop())
      .reduce((acc, val) => Object.assign(acc, { [val]: true }));
  };

  return {
    
    // TODO: url might reference a local resource?
    parse: (url) => {
      fetch(url)
        .then((res) => res.text())
        .then((text) => parseList(text))
        .catch((err) => console.error(err));
    },

    rules: () => rules,

  };

};