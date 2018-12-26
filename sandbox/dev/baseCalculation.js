'use strict';

const CollectionRateAtCellAnalyzer = require('../analysis/CollectionRateAtCellAnalyzer_NEW');
const TurnsToSpendAtCellSuggestor = require('../analysis/TurnsToSpendAtCellSuggestor_NEW');

const NUM_OF_TURNS = 10;

const collectionRateAtCellAnalyzer = new CollectionRateAtCellAnalyzer(NUM_OF_TURNS);

const _collectionRatesAtCell = collectionRateAtCellAnalyzer.generateTurnByTurnAnalysis(700, 300);

const turnsToSpendAtCellSuggestor = new TurnsToSpendAtCellSuggestor()
    .setCollectionRateTable(_collectionRatesAtCell)
    .setThresholds([{
        label: 'OVERFLOW_AMOUNT',
        maxThreshold: 30
    }, {
        label: 'CARGO_INCREASE_RATE',
        minThreshold: 4
    }, {
        label: 'TOTAL_LEAVE_COST',
        maxThreshold: 50
    }, {
        label: 'CARGO_WASTE_RATE',
        maxThreshold: 5
    }]);

console.log(_collectionRatesAtCell)
console.log(turnsToSpendAtCellSuggestor.suggest())