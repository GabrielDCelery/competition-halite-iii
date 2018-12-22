'use strict';

const _ = require('lodash');
const TableWrapper = require('../utils/TableWrapper');
const CellHarvestSimulator = require('../analysis/CellHarvestSimulator');
const CollectionRateAtCellAnalyzer = require('../analysis/CollectionRateAtCellAnalyzer');
const TurnsToSpendAtCellSuggestor = require('../analysis/TurnsToSpendAtCellSuggestor');

const NUM_OF_TURNS_TO_ANALYZE = 25;
const CARGO_MAXIMUM_AMOUNT = 1000;
const CELL_MAXIMUM_AMOUNT = 1000;
const NEAREST_NTH = 10;

const cellHarvestSimulator = new CellHarvestSimulator();

const createRoundedCollectionRatesTables = function createRoundedCollectionRatesTables (_numOfTurns, _cargoMaximumAmount, _cellMaximumAmount, _nearestNth) {
    const _tableWrapper = new TableWrapper(TableWrapper.generateEmptyTable(_cargoMaximumAmount / _nearestNth + 1, _cellMaximumAmount / _nearestNth + 1));
    
    _.times((_cargoMaximumAmount / _nearestNth) + 1, _i => {
        _.times((_cellMaximumAmount / _nearestNth) + 1, _j => {
            const _roundedAmountInCargo = _i * _nearestNth;
            const _roundedAmountOnCell = _j * _nearestNth;

            const _turnByTurnAnalysis = new CollectionRateAtCellAnalyzer(_numOfTurns).generateTurnByTurnAnalysis(_roundedAmountInCargo, _roundedAmountOnCell);

            return _tableWrapper.setCellValue(_i, _j, _turnByTurnAnalysis);
        });
    });

    return _tableWrapper;
}

const runHarvest = function runHarves (_cells, _roundedCollectionRatesTables, _turnsToSpendAtCellSuggestor) {
    const _result = {
        totalHarvestedAmount: 0,
        numOfTurns: 0,
        halitePerTurn: 0
    }

    for (let _i = 0, _iMax = _cells.length; _i < _iMax; _i++) {
        const _collectionRatesTable = _roundedCollectionRatesTables.getCellValueByIndex(
            Math.round(_result.totalHarvestedAmount / NEAREST_NTH),
            Math.round(_cells[_i] / NEAREST_NTH)
        );

        _turnsToSpendAtCellSuggestor.setCollectionRateTable(_collectionRatesTable);
        
        const _suggestion = _turnsToSpendAtCellSuggestor.suggest();

        if (_suggestion.recommended === false) {
            return _result;
        }

        const _harvestResults = cellHarvestSimulator.harvestCell(_suggestion.turns, _result.totalHarvestedAmount, _cells[_i]);

        _result.numOfTurns += _suggestion.turns;
        _result.totalHarvestedAmount = _harvestResults.amountInCargo;
        _result.halitePerTurn = parseFloat((_result.totalHarvestedAmount / _result.numOfTurns).toFixed(1))
    }

    return _result;
}

const roundedCollectionRatesTables = createRoundedCollectionRatesTables(NUM_OF_TURNS_TO_ANALYZE, CARGO_MAXIMUM_AMOUNT, CELL_MAXIMUM_AMOUNT, NEAREST_NTH);
const turnsToSpendAtCellSuggestor = new TurnsToSpendAtCellSuggestor();


let _lastHarvest = { 
    totalHarvestedAmount: 0,
    numOfTurns: 0,
    halitePerTurn: 0
};
let _configTracker = {
    numOfConfigsThatAreAPass: 0,
    sumMaxLeaveCost: 0,
    sumMaxWasteRate: 0,
    sumMinCargoIncreaseRate: 0,
    sumHalitePerTurn: 0
}

_.times(80, _maxLeaveCost => {
    _.times(10, _maxWasteRate => {
        _.times(10, _minCargoIncreaseRate => {
            turnsToSpendAtCellSuggestor.setThresholds([{
                label: CollectionRateAtCellAnalyzer.COLUMN_LABELS.CAN_LEAVE,
                minThreshold: true
            }, {
                label: CollectionRateAtCellAnalyzer.COLUMN_LABELS.CARGO_INCREASE_RATE,
                minThreshold: _minCargoIncreaseRate
            }, {
                label: CollectionRateAtCellAnalyzer.COLUMN_LABELS.LEAVE_COST,
                maxThreshold: _maxLeaveCost
            }, {
                label: CollectionRateAtCellAnalyzer.COLUMN_LABELS.CARGO_AMOUNT_WASTED,
                maxThreshold: _maxWasteRate
            }]);

            const _result = runHarvest([100, 200, 400, 800], roundedCollectionRatesTables, turnsToSpendAtCellSuggestor);
/*
            if (_result.halitePerTurn > 0) {
                _configTracker.numOfConfigsThatAreAPass++;
                _configTracker.sumMaxLeaveCost += _maxLeaveCost;
                _configTracker.sumMaxWasteRate += _maxWasteRate;
                _configTracker.sumMinCargoIncreaseRate += _minCargoIncreaseRate;
                _configTracker.sumHalitePerTurn += _result.halitePerTurn;
            }
            */

            if (_result.halitePerTurn > _lastHarvest.halitePerTurn) {
                _lastHarvest = _result;

                console.log(_lastHarvest)
/*
                console.log(_lastHarvest)
                console.log([_maxLeaveCost, _maxWasteRate, _minCargoIncreaseRate])
                */
            }
            
        })
    })
});
/*
console.log(_configTracker.sumMaxLeaveCost / _configTracker.numOfConfigsThatAreAPass)
console.log(_configTracker.sumMaxWasteRate / _configTracker.numOfConfigsThatAreAPass)
console.log(_configTracker.sumMinCargoIncreaseRate / _configTracker.numOfConfigsThatAreAPass)
console.log(_configTracker.sumHalitePerTurn / _configTracker.numOfConfigsThatAreAPass)
*/