'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const TableWrapper = require('../utils/TableWrapper');
const CollectionRateAtCellAnalyzer = require('../analysis/CollectionRateAtCellAnalyzer');

const tableWrapper = new TableWrapper(TableWrapper.generateEmptyTable(100, 100));

//const _result = new CollectionRateAtCellAnalyzer(25).generateTurnByTurnAnalysis(0, 1000)

_.times(100, _i => {
    _.times(100, _j => {
        const _amountInCargo = _i * 10;
        const _amountOnCell = _j * 10;

        const _turnByTurnAnalysis = new CollectionRateAtCellAnalyzer(25).generateTurnByTurnAnalysis(_amountInCargo, _amountOnCell);

        return tableWrapper.setCellValue(_i, _j, _turnByTurnAnalysis);
    });
});

fs.writeFileSync(path.join(__dirname, '../analysis/json', 'turnByTurnAnalysis.json'), JSON.stringify(tableWrapper.getTable()));
