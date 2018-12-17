'usse strict';

const CollectionRateAtCellAnalyzer = require('../analysis/CollectionRateAtCellAnalyzer');

const collectionRateAtCellAnalyzer = new CollectionRateAtCellAnalyzer();

const _result = collectionRateAtCellAnalyzer.generateTurnByTurnAnalysis(400, 100);

//console.log(_result);

collectionRateAtCellAnalyzer.setThresholdSuggestions(10, 5, 5);