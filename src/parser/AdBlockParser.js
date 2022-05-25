import { FiltersEngine } from '@cliqz/adblocker';

export default function() {
  let engine;
  
  return {
    parse: async (list) => {
      engine = await FiltersEngine.fromLists(fetch, [ list]);
    },

    engine: () => engine
  };
};