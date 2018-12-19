'use strict';

const _ = require('lodash');

const CARGO_MAXIMUM_AMOUNT = 1000;

const NUM_OF_TURNS_TO_CALCULATE = 30;
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

const Table = require('../utils/Table');

class CollectionRateAtCellTableGenerator {
    constructor () {
        this.table = new Table(NUM_OF_TURNS_TO_CALCULATE, COLUMN_LABELS.length).setColumnLookup(COLUMN_LABELS);
        this._getMaxRecommendedTurns = this._getMaxRecommendedTurns.bind(this);
        this._getMinRequiredTurns = this._getMinRequiredTurns.bind(this);
    }

    setThresholdSuggestions (_maxLeaveCost, _maxCargoAmountWasted, _minCargoIncreaseRate) {
        this.thresholdSuggestions = {
            min: [{
                label: 'leaveCost',
                threshold: _maxLeaveCost
            }, {
                label: 'cargoAmountWasted',
                threshold: _maxCargoAmountWasted
            }],
            max: [{
                label: 'cargoIncreaseRate',
                threshold: _minCargoIncreaseRate
            }]
        };

        return this;
    }

    _calculateMaximumCollectableAmount (_amountOnCell) {
        return Math.ceil(_amountOnCell * 0.25);
    }

    _calculateLeaveCost (_amountOnCell) {
        return Math.ceil(_amountOnCell * 0.1);
    }

    _calculateCollectedAmount (_amountOnCell, _amountInCargo) {
        const _remainingInCargo = CARGO_MAXIMUM_AMOUNT - _amountInCargo;
        const _maximumCollectableAmount = this._calculateMaximumCollectableAmount(_amountOnCell);

        return _remainingInCargo < _maximumCollectableAmount ? _remainingInCargo : _maximumCollectableAmount;
    }

    _calculateCouldCollectMaximumAmount (_amountOnCell, _amountInCargo) {
        const _maximumCollectableAmount = this._calculateMaximumCollectableAmount(_amountOnCell);
        const _collectedAmount = this._calculateCollectedAmount(_amountOnCell, _amountInCargo);

        return _maximumCollectableAmount === _collectedAmount;
    }

    _amountInCargoAtTurnEnd (_amountInCargoAtTurnStart, _collectedAmount) {
        return _amountInCargoAtTurnStart + _collectedAmount;
    }

    _amountOnCellAtTurnEnd (_amountOnCellAtTurnStart, _collectedAmount) {
        return _amountOnCellAtTurnStart - _collectedAmount;
    }

    _amountInCargoAfterLeave (_amountInCargoAtTurnEnd,  _leaveCost) {
        return _amountInCargoAtTurnEnd - _leaveCost;
    }

    _bCanLeave (_amountInCargoAtTurnStart, _amountOnCellAtTurnStart) {
        return this._calculateLeaveCost(_amountOnCellAtTurnStart) <= _amountInCargoAtTurnStart;
    }

    _cargoAmountWasted (_leaveCost, _amountInCargoAtTurnEnd) {
        return _amountInCargoAtTurnEnd === 0 ? 0 : parseFloat((_leaveCost / _amountInCargoAtTurnEnd * 100).toFixed(1));
    }

    _cargoTotalFillRateAfterLeave (_amountInCargoAfterLeave) {
        return parseFloat((_amountInCargoAfterLeave / CARGO_MAXIMUM_AMOUNT * 100).toFixed(1));
    }

    _cargoIncreaseRate (_amountInCargoAfterLeave, _amountInCargoAtTurnStart) {
        return _amountInCargoAtTurnStart === 0 ? 0 : parseFloat(((_amountInCargoAfterLeave - _amountInCargoAtTurnStart) / _amountInCargoAtTurnStart * 100).toFixed(1));
    }

    _generateRow (_turnNum) {
        const _previousTurnNum = _turnNum - 1;
        const _amountInCargoAtTurnStart = this.table.getCellValue(_previousTurnNum, 'amountInCargoAtTurnEnd');
        const _amountOnCellAtTurnStart = this.table.getCellValue(_previousTurnNum, 'amountOnCellAtTurnStart') - this.table.getCellValue(_previousTurnNum, 'collectedAmount');
        const _maximumCollectableAmount = this._calculateMaximumCollectableAmount(_amountOnCellAtTurnStart);
        const _collectedAmount = this._calculateCollectedAmount(_amountOnCellAtTurnStart, _amountInCargoAtTurnStart);
        const _bCouldCollectMaximumAmount = this._calculateCouldCollectMaximumAmount (_amountOnCellAtTurnStart, _amountInCargoAtTurnStart);
        const _totalCollectedAmount = this.table.getCellValue(_previousTurnNum, 'totalCollectedAmount') + _collectedAmount;
        const _amountInCargoAtTurnEnd = this._amountInCargoAtTurnEnd (_amountInCargoAtTurnStart, _collectedAmount);
        const _amountOnCellAtTurnEnd = this._amountOnCellAtTurnEnd (_amountOnCellAtTurnStart, _collectedAmount);
        const _leaveCost = this._calculateLeaveCost(_amountOnCellAtTurnEnd);
        const _amountInCargoAfterLeave = this._amountInCargoAfterLeave (_amountInCargoAtTurnEnd,  _leaveCost);

        this.table.setCellValue(_turnNum, 'amountInCargoAtTurnStart', _amountInCargoAtTurnStart);
        this.table.setCellValue(_turnNum, 'amountOnCellAtTurnStart', _amountOnCellAtTurnStart);
        this.table.setCellValue(_turnNum, 'maximumCollectableAmount', _maximumCollectableAmount);
        this.table.setCellValue(_turnNum, 'collectedAmount', _collectedAmount);
        this.table.setCellValue(_turnNum, 'couldCollectMaximumAmount', _bCouldCollectMaximumAmount);
        this.table.setCellValue(_turnNum, 'totalCollectedAmount', _totalCollectedAmount);
        this.table.setCellValue(_turnNum, 'amountInCargoAtTurnEnd', _amountInCargoAtTurnEnd);
        this.table.setCellValue(_turnNum, 'amountOnCellAtTurnEnd', _amountOnCellAtTurnEnd);
        this.table.setCellValue(_turnNum, 'leaveCost', _leaveCost);
        this.table.setCellValue(_turnNum, 'amountInCargoAfterLeave', _amountInCargoAfterLeave);
        this.table.setCellValue(_turnNum, 'canLeave', this._bCanLeave(_amountInCargoAtTurnStart, _amountOnCellAtTurnStart));
        this.table.setCellValue(_turnNum, 'cargoAmountWasted', this._cargoAmountWasted(_leaveCost, _amountInCargoAtTurnEnd));
        this.table.setCellValue(_turnNum, 'cargoTotalFillRateAfterLeave', this._cargoTotalFillRateAfterLeave (_amountInCargoAfterLeave));
        this.table.setCellValue(_turnNum, 'cargoIncreaseRate', this._cargoIncreaseRate(_amountInCargoAfterLeave, _amountInCargoAtTurnStart));
    }

    _generateFirstRow (_amountInCargoAtTurnStart, _amountOnCellAtTurnStart) {
        const _maximumCollectableAmount = this._calculateMaximumCollectableAmount(_amountOnCellAtTurnStart);
        const _collectedAmount = 0;
        const _totalCollectedAmount = 0;
        const _amountInCargoAtTurnEnd = this._amountInCargoAtTurnEnd (_amountInCargoAtTurnStart, _collectedAmount);
        const _amountOnCellAtTurnEnd = this._amountOnCellAtTurnEnd (_amountOnCellAtTurnStart, _collectedAmount);
        const _leaveCost = this._calculateLeaveCost(_amountOnCellAtTurnEnd);
        const _amountInCargoAfterLeave = this._amountInCargoAfterLeave (_amountInCargoAtTurnEnd,  _leaveCost);

        this.table.setCellValue(0, 'amountInCargoAtTurnStart', _amountInCargoAtTurnStart);
        this.table.setCellValue(0, 'amountOnCellAtTurnStart', _amountOnCellAtTurnStart);
        this.table.setCellValue(0, 'maximumCollectableAmount', _maximumCollectableAmount);
        this.table.setCellValue(0, 'collectedAmount', 0);
        this.table.setCellValue(0, 'couldCollectMaximumAmount', true);
        this.table.setCellValue(0, 'totalCollectedAmount', _totalCollectedAmount);
        this.table.setCellValue(0, 'amountInCargoAtTurnEnd', _amountInCargoAtTurnEnd);
        this.table.setCellValue(0, 'amountOnCellAtTurnEnd', _amountOnCellAtTurnEnd);
        this.table.setCellValue(0, 'leaveCost', _leaveCost);
        this.table.setCellValue(0, 'amountInCargoAfterLeave', _amountInCargoAfterLeave);
        this.table.setCellValue(0, 'canLeave', this._bCanLeave(_amountInCargoAtTurnStart, _amountOnCellAtTurnStart));
        this.table.setCellValue(0, 'cargoAmountWasted', this._cargoAmountWasted(_leaveCost, _amountInCargoAtTurnEnd));
        this.table.setCellValue(0, 'cargoTotalFillRateAfterLeave', this._cargoTotalFillRateAfterLeave (_amountInCargoAtTurnEnd));
        this.table.setCellValue(0, 'cargoIncreaseRate', this._cargoIncreaseRate(_amountInCargoAfterLeave, _amountInCargoAtTurnStart));
    }

    _getMaxRecommendedTurns (_columnLabel, _threshold) {
        const _numOfTurns = this.table.getTable().length;

        for (let _i = 0, _iMax = _numOfTurns; _i < _iMax; _i++) {
            if (_i + 1 === _iMax) {
                continue;
            }

            const _cellValue = this.table.getCellValue(_i, _columnLabel);
            const _nextCellValue = this.table.getCellValue(_i + 1, _columnLabel);

            if (_threshold <= _cellValue && _threshold > _nextCellValue) {
                return _i;
            }
        }

        return 0;
    }

    _getMinRequiredTurns (_columnLabel, _threshold) {
        const _numOfTurns = this.table.getTable().length - 1;

        for (let _i = 0, _iMax = _numOfTurns; _i <= _iMax; _i++) {
            const _cellValue = this.table.getCellValue(_i, _columnLabel);

            if (_cellValue <= _threshold) {
                return _i;
            }
        }

        return _numOfTurns;
    }

    generateTurnByTurnAnalysis (_amountInCargoAtTurnStart, _amountOnCellAtTurnStart) {
        this._generateFirstRow(_amountInCargoAtTurnStart, _amountOnCellAtTurnStart);

        for (let _i = 1, _iMax = NUM_OF_TURNS_TO_CALCULATE; _i < _iMax; _i++) {
            this._generateRow(_i);
        }

        return this.table.getTable();
    }

    calculateSuggestedNumberOfTurns (_amountInCargoAtTurnStart, _amountOnCellAtTurnStart) {
        this.generateTurnByTurnAnalysis(_amountInCargoAtTurnStart, _amountOnCellAtTurnStart);

        const _thresholdSuggestions = _.cloneDeep(this.thresholdSuggestions);

        const _minValues = _thresholdSuggestions.min.map(_minConfig => {
            return this._getMinRequiredTurns(_minConfig.label, _minConfig.threshold);
        });

        const _maxValues = _thresholdSuggestions.max.map(_maxConfig => {
            return this._getMaxRecommendedTurns(_maxConfig.label, _maxConfig.threshold);
        });

        const _minTurns = Math.max(..._minValues);
        const _maxTurns = Math.min(..._maxValues);
        const _recommendedTurns = _minTurns <= _maxTurns ? _maxTurns : _minTurns;

        return {
            recommended: _maxTurns !== 0 && _minTurns <= _maxTurns,
            recommededTurns: _recommendedTurns,
            cargoTotalFillRateAtTurnStart: parseFloat((_amountInCargoAtTurnStart / 1000 * 100).toFixed(1)),
            cargoTotalFillRateAfterLeave: this.table.getCellValue(_recommendedTurns, 'cargoTotalFillRateAfterLeave')
        }
    }
}

module.exports = CollectionRateAtCellTableGenerator;
