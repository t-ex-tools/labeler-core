import { FiltersEngine } from '@cliqz/adblocker';

export default function() {
  let engine;
  
  return {
    parse: async (list) => {
      engine = await FiltersEngine.fromLists(fetch, [ list ]);
    },

    // NOTE:  applications must call init() on BlockList() instance
    //        to ensure engine is fetched, parsed, and ready-to-go
    engine: () => engine
  };
};