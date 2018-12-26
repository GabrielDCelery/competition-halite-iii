'use strict';

const _ = require('lodash');
const CollectionRateAtCellAnalyzer = require('../analysis/CollectionRateAtCellAnalyzer_NEW');
const TurnsToSpendAtCellSuggestor = require('../analysis/TurnsToSpendAtCellSuggestor_NEW');

const NUM_OF_TURNS = 10;

const collectionRateAtCellAnalyzer = new CollectionRateAtCellAnalyzer(NUM_OF_TURNS);

const _collectionRatesAtCell = collectionRateAtCellAnalyzer.generateTurnByTurnAnalysis(0, 800);

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
/*
const _results = {};
_.times(100, _i => {
    _.times(100, _j => {
        const _collectionRatesAtCell = collectionRateAtCellAnalyzer.generateTurnByTurnAnalysis(_i * 10, _j * 10);

        turnsToSpendAtCellSuggestor.setCollectionRateTable(_collectionRatesAtCell);

        _.set(_results, [`a${_i * 10}`,`b${_j * 10}`], turnsToSpendAtCellSuggestor.suggest());
    });
})

console.log(JSON.stringify(_results))
*/