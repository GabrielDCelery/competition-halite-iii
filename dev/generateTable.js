'usse strict';

const _= require('lodash');
const Table = require('../utils/Table');
const CollectionRateAtCellAnalyzer = require('../analysis/CollectionRateAtCellAnalyzer');

const createRecommendorTable = function createRecommendorTable (_maxLeaveCost, _maxCargoAmountWasted, _minCargoIncreaseRate) {
    const table = new Table(100, 100);
    const collectionRateAtCellAnalyzer = new CollectionRateAtCellAnalyzer().setThresholdSuggestions(_maxLeaveCost, _maxCargoAmountWasted, _minCargoIncreaseRate);

    _.times(100, _i => {
        _.times(100, _j => {
            const _amountInCargo = _i * 10;
            const _amountOnCell = _j * 10;
            const _result = collectionRateAtCellAnalyzer.calculateSuggestedNumberOfTurns(_amountInCargo, _amountOnCell);
    
            return table.setCellValue(_i, _j, _result);
        });
    });

    return table;
}

const getRecommendation = function getRecommendation (_recommendorTable, _amountInCargo, _amountOnCell) {
    return _recommendorTable.getCellValueByIndex(Math.round(_amountInCargo / 10), Math.round(_amountOnCell / 10));
}

//console.log(createRecommendorTable(10, 3, 5));

const _result = getRecommendation(createRecommendorTable(20, 5, 3), 0, 100);

console.log(_result);