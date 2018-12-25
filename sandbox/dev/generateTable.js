'usse strict';

const _= require('lodash');
const TableWrapper = require('../utils/TableWrapper');
const CollectionRateAtCellAnalyzer = require('../analysis/CollectionRateAtCellAnalyzer');

const turnByTurnAnalysis = require('../analysis/json/turnByTurnAnalysis.json');

const createRecommendorTable = function createRecommendorTable (_thresholdSuggestions) {
    const table = new TableWrapper(TableWrapper.generateEmptyTable(50, 50));
    const collectionRateAtCellAnalyzer = new CollectionRateAtCellAnalyzer(30).setThresholdSuggestions(_thresholdSuggestions);

    _.times(50, _i => {
        _.times(50, _j => {
            const _amountInCargo = _i * 20;
            const _amountOnCell = _j * 20;

            const turnByTurnAnalysisTableWrapper = new TableWrapper(turnByTurnAnalysis);

            const _result = collectionRateAtCellAnalyzer.calculateSuggestedNumberOfTurns(_amountInCargo, _amountOnCell);
    
            return table.setCellValue(_i, _j, _result);
        });
    });

    return table;
}

const getRecommendation = function getRecommendation (_recommendorTable, _amountInCargo, _amountOnCell) {
    return _recommendorTable.getCellValueByIndex(Math.round(_amountInCargo / 20), Math.round(_amountOnCell / 20));
}

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

let _finalHarvest = { 
    totalHarvestedAmount: 0,
    numOfTurns: 0,
    halitePerTurn: 0
};

let _configuration = null;

_.times(80, _maxLeaveCost => {
    _.times(10, _maxWasteRate => {
        _.times(10, _minCargoIncreaseRate => {
            const _recommendorTable = createRecommendorTable({
                min: [{
                    label: 'leaveCost',
                    threshold: _maxLeaveCost
                }, {
                    label: 'cargoAmountWasted',
                    threshold: _maxWasteRate
                }],
                max: [{
                    label: 'cargoIncreaseRate',
                    threshold: _minCargoIncreaseRate
                }]
            });

            const _result = runHarvest([100, 200, 400, 800], _recommendorTable);

            if (_result.halitePerTurn > _finalHarvest.halitePerTurn) {
                _finalHarvest = _result;
                _configuration = [_maxLeaveCost, _maxWasteRate, _minCargoIncreaseRate];

                console.log(_finalHarvest)
                console.log(_configuration)
            }
        })
    })
});

console.log('done')