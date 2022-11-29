import { FiltersEngine } from '@cliqz/adblocker';

export default function() {
  let engine;
  
  return {
    parse: async (list) => {
      engine = await FiltersEngine.fromLists(fetch, [ list]);
    },

    engine: () => engine // TODO: what if parse() hasn't been completed yet?
  };
};