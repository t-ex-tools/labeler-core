export default function(mName, rawList, mEvaluator) {
  let evaluator = mEvaluator;

  return {
    name: mName,

    init: async () => {
      return await evaluator.parser().parse(rawList);
    },

    evaluator: () => {
      return evaluator;
    },

    isLabeled: (r) => 
      Object.assign(
        evaluator.isLabeled(r), 
        { blocklist: mName }
      ),

    
  };
};