'use strict';

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
    'cargoTotalFillAfterLeave',
    'cargoIncreaseRate'
];

const Table = require('../utils/Table');

class ShipAtCellCollectionTableGenerator {
    constructor () {
        this.table = new Table(NUM_OF_TURNS_TO_CALCULATE, COLUMN_LABELS.length).setColumnLookup(COLUMN_LABELS);
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
        return parseFloat((_leaveCost / _amountInCargoAtTurnEnd * 100).toFixed(1));
    }

    _cargoTotalFillAfterLeave (_amountInCargoAfterLeave) {
        return parseFloat((_amountInCargoAfterLeave / CARGO_MAXIMUM_AMOUNT * 100).toFixed(1));
    }

    _cargoIncreaseRate (_amountInCargoAfterLeave, _amountInCargoAtTurnStart) {
        return parseFloat(((_amountInCargoAfterLeave - _amountInCargoAtTurnStart) / _amountInCargoAtTurnStart * 100).toFixed(1));
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
        this.table.setCellValue(_turnNum, 'cargoTotalFillAfterLeave', this._cargoTotalFillAfterLeave (_amountInCargoAfterLeave));
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
        this.table.setCellValue(0, 'cargoTotalFillAfterLeave', this._cargoTotalFillAfterLeave (_amountInCargoAtTurnEnd));
        this.table.setCellValue(0, 'cargoIncreaseRate', this._cargoIncreaseRate(_amountInCargoAfterLeave, _amountInCargoAtTurnStart));
    }

    generateTable (_amountInCargoAtTurnStart, _amountOnCellAtTurnStart) {
        this._generateFirstRow(_amountInCargoAtTurnStart, _amountOnCellAtTurnStart);

        for (let _i = 1, _iMax = NUM_OF_TURNS_TO_CALCULATE; _i < _iMax; _i++) {
            this._generateRow(_i);
        }

        console.log(this.table.getTable());
    }
}

module.exports = ShipAtCellCollectionTableGenerator;
