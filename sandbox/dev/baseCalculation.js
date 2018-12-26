const _ = require('lodash');
const TableWrapper = require('../../utils/TableWrapper');
const CellHarvestSimulator = require('../analysis/CellHarvestSimulator');
const CollectionRateAtCellAnalyzer = require('../analysis/CollectionRateAtCellAnalyzer');
const TurnsToSpendAtCellSuggestor = require('../analysis/TurnsToSpendAtCellSuggestor');

const NUM_OF_TURNS_TO_ANALYZE = 25;
const CARGO_MAXIMUM_AMOUNT = 1000;
const CELL_MAXIMUM_AMOUNT = 1000;
const NEAREST_NTH = 10;

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

const roundedCollectionRatesTables = createRoundedCollectionRatesTables(NUM_OF_TURNS_TO_ANALYZE, CARGO_MAXIMUM_AMOUNT, CELL_MAXIMUM_AMOUNT, NEAREST_NTH);

const _collectionRateTable = roundedCollectionRatesTables.getCellValue(100, 100);

const turnsToSpendAtCellSuggestor = new TurnsToSpendAtCellSuggestor().setThresholds([{
    label: CollectionRateAtCellAnalyzer.COLUMN_LABELS.CAN_LEAVE,
    minThreshold: true
}, {
    label: CollectionRateAtCellAnalyzer.COLUMN_LABELS.CARGO_INCREASE_RATE,
    minThreshold: 5
}, {
    label: CollectionRateAtCellAnalyzer.COLUMN_LABELS.LEAVE_COST,
    maxThreshold: 30
}, {
    label: CollectionRateAtCellAnalyzer.COLUMN_LABELS.CARGO_AMOUNT_WASTED,
    maxThreshold: 5
}]);

turnsToSpendAtCellSuggestor.setCollectionRateTable(_collectionRateTable);

console.log(turnsToSpendAtCellSuggestor.suggest())