'use strict';

const _ = require('lodash');
const CollectionRateAtCellTableGenerator = require('./CollectionRateAtCellTableGenerator');

const COLUMN_LABELS = [
    'amountInCargoAtTurnStart',
    'amountOnCellAtTurnStart',
    'maximumCollectableAmount',
    'collectedAmount',
    'couldCollectMaximumAmount',
    'totalCollectedAmount',
    'amountInCargoAtTurnEnd',
    'amountOnCellAtTurnEnd',
    'leaveCost',
    'amountInCargoAfterLeave',
    'canLeave',
    'cargoAmountWasted',
    'cargoTotalFillRateAfterLeave',
    'cargoIncreaseRate'
];

const DEFAULT_CONFIG = {
    maxLeaveCost: 10,
    maxCargoAmountWasted: 5,
    minCargoIncreaseRate: 5
}

class TimeToSpendAtCellSuggestor {
    constructor () {
        this.collectionRateAtCellTableGenerator = new CollectionRateAtCellTableGenerator();
    }

    setConfig (_config) {
        this.config = _.defaultsDeep({}, _config, DEFAULT_CONFIG);
    }

    _getMinTurnsToMinimizeLeaveCost (_table) {
        const _numOfTurns = _table.length;

        for (let _i = 0, _iMax = _numOfTurns; _i < _iMax; _i++) {
            const _leaveCost = _table.getCellValue(_i, 'leaveCost');

            if (_leaveCost < this.maxLeaveCost) {
                return _i;
            }
        }

        return _numOfTurns;
    }

    calculate (_amountInCargoAtTurnStart, _amountOnCellAtTurnStart) {
        const _table = this.collectionRateAtCellTableGenerator.generateTable(_amountInCargoAtTurnStart, _amountOnCellAtTurnStart);

        const _minTurns1 = this._getMinTurnsToMinimizeLeaveCost(_table);
    }
}

module.exports = TimeToSpendAtCellSuggestor;
