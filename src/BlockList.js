export default function(mName, rawList, mEvaluator) {
  let evaluator = mEvaluator;
  evaluator.parser().parse(rawList);

  return {
    name: mName,
    isLabeled: (r) => 
      Object.assign(
        evaluator.isLabeled(r), 
        { blocklist: mName }
      ),
  };
};