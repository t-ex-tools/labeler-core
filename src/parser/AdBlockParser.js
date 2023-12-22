import { FiltersEngine } from '@cliqz/adblocker';
// import fs from 'fs';

export default function() {
  let engine;
  
  return {
    parse: async (url) => {

      if (url.startsWith('https://')) {
        engine = await FiltersEngine.fromLists(fetch, [ url ]);

      /*
      } else if (url.startsWith('file://')) {
        let path = url.split('file://').pop();
        let list = fs.readFileSync(path, 'utf-8');
        engine = FiltersEngine.parse(list);
      */
     
      } else {
        console.error('Could not resolve URL: ' + url);

      }
      
    },

    // NOTE:  applications must call init() on BlockList() instance
    //        to ensure engine is fetched, parsed, and ready-to-go
    engine: () => engine
  };
};