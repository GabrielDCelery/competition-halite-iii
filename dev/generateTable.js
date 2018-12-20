'usse strict';

const _= require('lodash');
const Table = require('../utils/Table');
const CollectionRateAtCellAnalyzer = require('../analysis/CollectionRateAtCellAnalyzer');

const createRecommendorTable = function createRecommendorTable (_maxLeaveCost, _maxCargoAmountWasted, _minCargoIncreaseRate) {
    const table = new Table(50, 50);
    const collectionRateAtCellAnalyzer = new CollectionRateAtCellAnalyzer().setThresholdSuggestions(_maxLeaveCost, _maxCargoAmountWasted, _minCargoIncreaseRate);

    _.times(50, _i => {
        _.times(50, _j => {
            const _amountInCargo = _i * 20;
            const _amountOnCell = _j * 20;
            const _result = collectionRateAtCellAnalyzer.calculateSuggestedNumberOfTurns(_amountInCargo, _amountOnCell);
    
            return table.setCellValue(_i, _j, _result);
        });
    });

    return table;
}

const getRecommendation = function getRecommendation (_recommendorTable, _amountInCargo, _amountOnCell) {
    return _recommendorTable.getCellValueByIndex(Math.round(_amountInCargo / 20), Math.round(_amountOnCell / 20));
}

//console.log(createRecommendorTable(10, 3, 5));

//const _result = getRecommendation(createRecommendorTable(20, 5, 3), 0, 100);

//console.log(_result);

const harvestCell = function harvestCell (_turns, _amountInCargo, _amountOnCell) {
    let _currentAmountInCargo = _amountInCargo;
    let _currentAmountOnCell = _amountOnCell;

    _.times(_turns, () => {
        const _collected = Math.ceil(_currentAmountOnCell * 0.25);

        _currentAmountInCargo += _collected;
        _currentAmountOnCell -= _collected;
    });

    _currentAmountInCargo -= Math.ceil(_currentAmountOnCell * 0.1);

    return {
        amountInCargo: _currentAmountInCargo,
        amountOnCell: _currentAmountOnCell
    }
}

const runHarvest = function runHarves (_cells, _recommendorTable) {
    const _result = {
        totalHarvestedAmount: 0,
        numOfTurns: 0,
        halitePerTurn: 0
    }

    for (let _i = 0, _iMax = _cells.length; _i < _iMax; _i++) {
        const _recommendation = getRecommendation(_recommendorTable, _result.totalHarvestedAmount, _cells[_i]);

        if (_recommendation.recommended === false) {
            return _result;
        }

        const _harvestResults = harvestCell(_recommendation.recommendedTurns, _result.totalHarvestedAmount, _cells[_i]);

        _result.numOfTurns += _recommendation.recommendedTurns;
        _result.totalHarvestedAmount = _harvestResults.amountInCargo;
        _result.halitePerTurn = parseFloat((_result.totalHarvestedAmount / _result.numOfTurns).toFixed(1))
    }

    return _result;
}
/*
const _recommendorTable = createRecommendorTable(1, 3, 3);

const _result = runHarvest([100, 200, 400, 800], _recommendorTable);

console.log(_result)
*/

let _finalHarvest = { 
    totalHarvestedAmount: 0,
    numOfTurns: 0,
    halitePerTurn: 0
};

let _configuration = null;

_.times(80, _leaveCost => {
    _.times(10, _wasteRate => {
        _.times(10, _minCargoIncreaseRate => {
            const _recommendorTable = createRecommendorTable(_leaveCost, _wasteRate, _minCargoIncreaseRate);

            const _result = runHarvest([100, 200, 400, 800], _recommendorTable);

            if (_result.halitePerTurn > _finalHarvest.halitePerTurn) {
                _finalHarvest = _result;
                _configuration = [_leaveCost, _wasteRate, _minCargoIncreaseRate];

                console.log(_finalHarvest)
                console.log(_configuration)
            }
        })
    })
});

console.log('done')