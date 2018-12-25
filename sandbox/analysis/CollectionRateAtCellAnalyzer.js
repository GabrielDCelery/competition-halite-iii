'use strict';

const TableWrapper = require('../../utils/TableWrapper');

const CARGO_MAXIMUM_AMOUNT = 1000;

class CollectionRateAtCellAnalyzer {
    static get COLUMN_LABELS() {
        return {
            AMOUNT_IN_CARGO_AT_TURN_START: 'AMOUNT_IN_CARGO_AT_TURN_START',
            AMOUNT_ON_CELL_AT_TURN_START: 'AMOUNT_ON_CELL_AT_TURN_START',
            MAXIMUM_COLLECTABLE_AMOUNT: 'MAXIMUM_COLLECTABLE_AMOUNT',
            COLLECTED_AMOUNT: 'COLLECTED_AMOUNT',
            COULD_COLLECT_MAXIMUM_AMOUNT: 'COULD_COLLECT_MAXIMUM_AMOUNT',
            TOTAL_COLLECTED_AMOUNT: 'TOTAL_COLLECTED_AMOUNT',
            AMOUNT_IN_CARGO_AT_TURN_END: 'AMOUNT_IN_CARGO_AT_TURN_END',
            AMOUNT_ON_CELL_AT_TURN_END: 'AMOUNT_ON_CELL_AT_TURN_END',
            LEAVE_COST: 'LEAVE_COST',
            AMOUNT_IN_CARGO_AFTER_LEAVE: 'AMOUNT_IN_CARGO_AFTER_LEAVE',
            CAN_LEAVE: 'CAN_LEAVE',
            CARGO_AMOUNT_WASTED: 'CARGO_AMOUNT_WASTED',
            CARGO_TOTAL_FILL_RATE_AFTER_LEAVE: 'CARGO_TOTAL_FILL_RATE_AFTER_LEAVE',
            CARGO_INCREASE_RATE: 'CARGO_INCREASE_RATE'
        }
    }

    constructor (_numOfTurnsToAnalyze) {
        this._numOfTurnsToAnalyze = _numOfTurnsToAnalyze;
        this._tableWrapper = new TableWrapper(
                TableWrapper.generateEmptyTable(
                    this._numOfTurnsToAnalyze + 1, 
                    Object.keys(CollectionRateAtCellAnalyzer.COLUMN_LABELS).length
                )
            )
            .setColumnLabel(CollectionRateAtCellAnalyzer.COLUMN_LABELS.AMOUNT_IN_CARGO_AT_TURN_START, 0)
            .setColumnLabel(CollectionRateAtCellAnalyzer.COLUMN_LABELS.AMOUNT_ON_CELL_AT_TURN_START, 1)
            .setColumnLabel(CollectionRateAtCellAnalyzer.COLUMN_LABELS.MAXIMUM_COLLECTABLE_AMOUNT, 2)
            .setColumnLabel(CollectionRateAtCellAnalyzer.COLUMN_LABELS.COLLECTED_AMOUNT, 3)
            .setColumnLabel(CollectionRateAtCellAnalyzer.COLUMN_LABELS.COULD_COLLECT_MAXIMUM_AMOUNT, 4)
            .setColumnLabel(CollectionRateAtCellAnalyzer.COLUMN_LABELS.TOTAL_COLLECTED_AMOUNT, 5)
            .setColumnLabel(CollectionRateAtCellAnalyzer.COLUMN_LABELS.AMOUNT_IN_CARGO_AT_TURN_END, 6)
            .setColumnLabel(CollectionRateAtCellAnalyzer.COLUMN_LABELS.AMOUNT_ON_CELL_AT_TURN_END, 7)
            .setColumnLabel(CollectionRateAtCellAnalyzer.COLUMN_LABELS.LEAVE_COST, 8)
            .setColumnLabel(CollectionRateAtCellAnalyzer.COLUMN_LABELS.AMOUNT_IN_CARGO_AFTER_LEAVE, 9)
            .setColumnLabel(CollectionRateAtCellAnalyzer.COLUMN_LABELS.CAN_LEAVE, 10)
            .setColumnLabel(CollectionRateAtCellAnalyzer.COLUMN_LABELS.CARGO_AMOUNT_WASTED, 11)
            .setColumnLabel(CollectionRateAtCellAnalyzer.COLUMN_LABELS.CARGO_TOTAL_FILL_RATE_AFTER_LEAVE, 12)
            .setColumnLabel(CollectionRateAtCellAnalyzer.COLUMN_LABELS.CARGO_INCREASE_RATE, 13);
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
        const _amountInCargoAtTurnStart = this._tableWrapper.getCellValue(_previousTurnNum, CollectionRateAtCellAnalyzer.COLUMN_LABELS.AMOUNT_IN_CARGO_AT_TURN_END);
        const _amountOnCellAtTurnStart = this._tableWrapper.getCellValue(_previousTurnNum, CollectionRateAtCellAnalyzer.COLUMN_LABELS.AMOUNT_ON_CELL_AT_TURN_START) - this._tableWrapper.getCellValue(_previousTurnNum, CollectionRateAtCellAnalyzer.COLUMN_LABELS.COLLECTED_AMOUNT);
        const _maximumCollectableAmount = this._calculateMaximumCollectableAmount(_amountOnCellAtTurnStart);
        const _collectedAmount = this._calculateCollectedAmount(_amountOnCellAtTurnStart, _amountInCargoAtTurnStart);
        const _bCouldCollectMaximumAmount = this._calculateCouldCollectMaximumAmount (_amountOnCellAtTurnStart, _amountInCargoAtTurnStart);
        const _totalCollectedAmount = this._tableWrapper.getCellValue(_previousTurnNum, CollectionRateAtCellAnalyzer.COLUMN_LABELS.TOTAL_COLLECTED_AMOUNT) + _collectedAmount;
        const _amountInCargoAtTurnEnd = this._amountInCargoAtTurnEnd (_amountInCargoAtTurnStart, _collectedAmount);
        const _amountOnCellAtTurnEnd = this._amountOnCellAtTurnEnd (_amountOnCellAtTurnStart, _collectedAmount);
        const _leaveCost = this._calculateLeaveCost(_amountOnCellAtTurnEnd);
        const _amountInCargoAfterLeave = this._amountInCargoAfterLeave (_amountInCargoAtTurnEnd,  _leaveCost);

        this._tableWrapper.setCellValue(_turnNum, CollectionRateAtCellAnalyzer.COLUMN_LABELS.AMOUNT_IN_CARGO_AT_TURN_START, _amountInCargoAtTurnStart);
        this._tableWrapper.setCellValue(_turnNum, CollectionRateAtCellAnalyzer.COLUMN_LABELS.AMOUNT_ON_CELL_AT_TURN_START, _amountOnCellAtTurnStart);
        this._tableWrapper.setCellValue(_turnNum, CollectionRateAtCellAnalyzer.COLUMN_LABELS.MAXIMUM_COLLECTABLE_AMOUNT, _maximumCollectableAmount);
        this._tableWrapper.setCellValue(_turnNum, CollectionRateAtCellAnalyzer.COLUMN_LABELS.COLLECTED_AMOUNT, _collectedAmount);
        this._tableWrapper.setCellValue(_turnNum, CollectionRateAtCellAnalyzer.COLUMN_LABELS.COULD_COLLECT_MAXIMUM_AMOUNT, _bCouldCollectMaximumAmount);
        this._tableWrapper.setCellValue(_turnNum, CollectionRateAtCellAnalyzer.COLUMN_LABELS.TOTAL_COLLECTED_AMOUNT, _totalCollectedAmount);
        this._tableWrapper.setCellValue(_turnNum, CollectionRateAtCellAnalyzer.COLUMN_LABELS.AMOUNT_IN_CARGO_AT_TURN_END, _amountInCargoAtTurnEnd);
        this._tableWrapper.setCellValue(_turnNum, CollectionRateAtCellAnalyzer.COLUMN_LABELS.AMOUNT_ON_CELL_AT_TURN_END, _amountOnCellAtTurnEnd);
        this._tableWrapper.setCellValue(_turnNum, CollectionRateAtCellAnalyzer.COLUMN_LABELS.LEAVE_COST, _leaveCost);
        this._tableWrapper.setCellValue(_turnNum, CollectionRateAtCellAnalyzer.COLUMN_LABELS.AMOUNT_IN_CARGO_AFTER_LEAVE, _amountInCargoAfterLeave);
        this._tableWrapper.setCellValue(_turnNum, CollectionRateAtCellAnalyzer.COLUMN_LABELS.CAN_LEAVE, this._bCanLeave(_amountInCargoAtTurnStart, _amountOnCellAtTurnStart));
        this._tableWrapper.setCellValue(_turnNum, CollectionRateAtCellAnalyzer.COLUMN_LABELS.CARGO_AMOUNT_WASTED, this._cargoAmountWasted(_leaveCost, _amountInCargoAtTurnEnd));
        this._tableWrapper.setCellValue(_turnNum, CollectionRateAtCellAnalyzer.COLUMN_LABELS.CARGO_TOTAL_FILL_RATE_AFTER_LEAVE, this._cargoTotalFillRateAfterLeave (_amountInCargoAfterLeave));
        this._tableWrapper.setCellValue(_turnNum, CollectionRateAtCellAnalyzer.COLUMN_LABELS.CARGO_INCREASE_RATE, this._cargoIncreaseRate(_amountInCargoAfterLeave, _amountInCargoAtTurnStart));
    }

    _generateFirstRow (_amountInCargoAtTurnStart, _amountOnCellAtTurnStart) {
        const _maximumCollectableAmount = this._calculateMaximumCollectableAmount(_amountOnCellAtTurnStart);
        const _collectedAmount = 0;
        const _totalCollectedAmount = 0;
        const _amountInCargoAtTurnEnd = this._amountInCargoAtTurnEnd (_amountInCargoAtTurnStart, _collectedAmount);
        const _amountOnCellAtTurnEnd = this._amountOnCellAtTurnEnd (_amountOnCellAtTurnStart, _collectedAmount);
        const _leaveCost = this._calculateLeaveCost(_amountOnCellAtTurnEnd);
        const _amountInCargoAfterLeave = this._amountInCargoAfterLeave (_amountInCargoAtTurnEnd,  _leaveCost);

        this._tableWrapper.setCellValue(0, CollectionRateAtCellAnalyzer.COLUMN_LABELS.AMOUNT_IN_CARGO_AT_TURN_START, _amountInCargoAtTurnStart);
        this._tableWrapper.setCellValue(0, CollectionRateAtCellAnalyzer.COLUMN_LABELS.AMOUNT_ON_CELL_AT_TURN_START, _amountOnCellAtTurnStart);
        this._tableWrapper.setCellValue(0, CollectionRateAtCellAnalyzer.COLUMN_LABELS.MAXIMUM_COLLECTABLE_AMOUNT, _maximumCollectableAmount);
        this._tableWrapper.setCellValue(0, CollectionRateAtCellAnalyzer.COLUMN_LABELS.COLLECTED_AMOUNT, 0);
        this._tableWrapper.setCellValue(0, CollectionRateAtCellAnalyzer.COLUMN_LABELS.COULD_COLLECT_MAXIMUM_AMOUNT, true);
        this._tableWrapper.setCellValue(0, CollectionRateAtCellAnalyzer.COLUMN_LABELS.TOTAL_COLLECTED_AMOUNT, _totalCollectedAmount);
        this._tableWrapper.setCellValue(0, CollectionRateAtCellAnalyzer.COLUMN_LABELS.AMOUNT_IN_CARGO_AT_TURN_END, _amountInCargoAtTurnEnd);
        this._tableWrapper.setCellValue(0, CollectionRateAtCellAnalyzer.COLUMN_LABELS.AMOUNT_ON_CELL_AT_TURN_END, _amountOnCellAtTurnEnd);
        this._tableWrapper.setCellValue(0, CollectionRateAtCellAnalyzer.COLUMN_LABELS.LEAVE_COST, _leaveCost);
        this._tableWrapper.setCellValue(0, CollectionRateAtCellAnalyzer.COLUMN_LABELS.AMOUNT_IN_CARGO_AFTER_LEAVE, _amountInCargoAfterLeave);
        this._tableWrapper.setCellValue(0, CollectionRateAtCellAnalyzer.COLUMN_LABELS.CAN_LEAVE, this._bCanLeave(_amountInCargoAtTurnStart, _amountOnCellAtTurnStart));
        this._tableWrapper.setCellValue(0, CollectionRateAtCellAnalyzer.COLUMN_LABELS.CARGO_AMOUNT_WASTED, this._cargoAmountWasted(_leaveCost, _amountInCargoAtTurnEnd));
        this._tableWrapper.setCellValue(0, CollectionRateAtCellAnalyzer.COLUMN_LABELS.CARGO_TOTAL_FILL_RATE_AFTER_LEAVE, this._cargoTotalFillRateAfterLeave (_amountInCargoAtTurnEnd));
        this._tableWrapper.setCellValue(0, CollectionRateAtCellAnalyzer.COLUMN_LABELS.CARGO_INCREASE_RATE, this._cargoIncreaseRate(_amountInCargoAfterLeave, _amountInCargoAtTurnStart));
    }

    generateTurnByTurnAnalysis (_amountInCargoAtTurnStart, _amountOnCellAtTurnStart) {
        this._generateFirstRow(_amountInCargoAtTurnStart, _amountOnCellAtTurnStart);

        for (let _i = 1, _iMax = this._numOfTurnsToAnalyze + 1; _i < _iMax; _i++) {
            this._generateRow(_i);
        }

        return this._tableWrapper;
    }
}

module.exports = CollectionRateAtCellAnalyzer;
