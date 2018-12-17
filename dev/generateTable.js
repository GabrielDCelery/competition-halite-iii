'usse strict';

const CollectionRateAtCellAnalyzer = require('../analysis/CollectionRateAtCellAnalyzer');

const collectionRateAtCellAnalyzer = new CollectionRateAtCellAnalyzer();

const _result = collectionRateAtCellAnalyzer.setThresholdSuggestions(20, 5, 3).calculateSuggestedNumberOfTurns(600, 300);

console.log(_result);