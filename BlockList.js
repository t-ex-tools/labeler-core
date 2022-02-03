var BlockList = function(mName, rawList, mEvaluator) {
  let name = mName;
  let evaluator = mEvaluator;
  evaluator.parser().parse(rawList);

  return {
    isLabeled: (r) => Object.assign(evaluator.isLabeled(r), { blocklist: name }),
  };
};

export default BlockList;