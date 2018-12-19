'usse strict';

const _= require('lodash');

const Table = require('../utils/Table');
const CollectionRateAtCellAnalyzer = require('../analysis/CollectionRateAtCellAnalyzer');

const table = new Table(100, 100);
const collectionRateAtCellAnalyzer = new CollectionRateAtCellAnalyzer();

collectionRateAtCellAnalyzer.setThresholdSuggestions(10, 3, 5);

let _total = 0;
let _recommended = 0;

_.times(100, _i => {
    _.times(100, _j => {
        _total++;

        const _amountInCargo = _i * 10;
        const _amountOnCell = _j * 10;

        const _result = collectionRateAtCellAnalyzer.calculateSuggestedNumberOfTurns(_amountInCargo, _amountOnCell);

        if (_result.recommended) {
            _recommended++;
        }

        return table.setCellValue(_i, _j, _result);
    });
});

console.log(`${_recommended} recommended for ${_total} suggestions`);
