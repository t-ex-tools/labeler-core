export default function () {
  let rules = {};

  let parseList = (list) => {
    list = JSON.parse(list);
    Object
      .keys(list.categories)
      .forEach((category) => {
        rules[category] = {};
        list.categories[category]
          .forEach((entity) => {
            Object.keys(entity)
              .forEach((service) => {
                let url = Object.keys(entity[service])[0];
                entity[service][url]
                  .forEach((host) => {
                    (!rules[category][host]) 
                      ? rules[category][host] = true
                      : rules[category][host] = false;
                  });
              });
          });
      });    
  }

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