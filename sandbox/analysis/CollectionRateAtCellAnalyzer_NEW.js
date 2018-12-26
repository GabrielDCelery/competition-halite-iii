'use strict';

const CARGO_MAXIMUM_AMOUNT = 1000;

class CollectionRateAtCellAnalyzer {
    constructor (_numOfTurnsToAnalyze) {
        this.COLUMN_LABELS = {
            AMOUNT_IN_CARGO_AT_TURN_START: 0,
            AMOUNT_ON_CELL_AT_TURN_START: 1,
            MAXIMUM_COLLECTABLE_AMOUNT: 2,
            COLLECTED_AMOUNT: 3,
            OVERFLOW_AMOUNT: 4,
            AMOUNT_IN_CARGO_AT_TURN_END: 5,
            AMOUNT_ON_CELL_AT_TURN_END: 6,
            TOTAL_LEAVE_COST: 7,
            AMOUNT_IN_CARGO_AFTER_LEAVE: 8,
            CARGO_WASTE_RATE: 9,
            CARGO_INCREASE_RATE: 10,
            HALITE_PER_TURN: 11
        };
        this._numOfTurnsToAnalyze = _numOfTurnsToAnalyze;
        
        const _height = this._numOfTurnsToAnalyze;
        const _width = Object.keys(this.COLUMN_LABELS).length;

        this._table = this._initTable (_height, _width);
    }

    _initTable (_height, _width) {
        const _map = new Array(_height);

        for (let _y = 0, _yMax = _height; _y < _yMax; _y++)  {
            _map[_y] = new Array(_width);

            for (let _x = 0, _xMax = _width; _x < _xMax; _x++) {
                _map[_y][_x] = null;
            }
        }

        return _map;
    }

    _calculateMaximumCollectableAmount (_amountOnCell) {
        return Math.ceil(_amountOnCell * 0.25);
    }

    _calculateCollectedAmount (_amountInCargo, _maximumCollectableAmount) {
        const _remainingInCargo = CARGO_MAXIMUM_AMOUNT - _amountInCargo;

        return _remainingInCargo < _maximumCollectableAmount ? _remainingInCargo : _maximumCollectableAmount;
    }

    _calculateOverflowAmount (_maximumCollectableAmount, _collectedAmount) {
        return _maximumCollectableAmount - _collectedAmount;
    }

    _calculateAmountInCargoAtTurnEnd (_amountInCargoAtTurnStart, _collectedAmount) {
        return _amountInCargoAtTurnStart + _collectedAmount;
    }

    _calculateAmountOnCellAtTurnEnd (_amountOnCellAtTurnStart, _collectedAmount) {
        return _amountOnCellAtTurnStart - _collectedAmount;
    }

    _calculateTotalLeaveCost (_amountOnCell) {
        return Math.ceil(_amountOnCell * 0.1);
    }

    _calculateAmountInCargoAfterLeave (_amountInCargoAtTurnEnd,  _totalLeaveCost) {
        return _amountInCargoAtTurnEnd - _totalLeaveCost;
    }

    _calculateCargoWasteRate (_totalLeaveCost, _amountInCargoAtTurnEnd) {
        return parseFloat((_totalLeaveCost / _amountInCargoAtTurnEnd * 100).toFixed(1));
    }

    _calculateCargoIncreaseRate (_amountInCargoAfterLeave, _amountInCargoAtTurnStart) {
        if (_amountInCargoAfterLeave < _amountInCargoAtTurnStart) {
            return 0;
        }

        return parseFloat(((_amountInCargoAfterLeave - _amountInCargoAtTurnStart) / _amountInCargoAtTurnStart * 100).toFixed(1));
    }

    _calculateHalitePerTurn (_amountInCargoAtFirstTurnStart, _amountInCargoAfterLeave, _turn) {
        return parseFloat(((_amountInCargoAfterLeave - _amountInCargoAtFirstTurnStart) / (_turn + 1)).toFixed(1));
    }

    _generateRow (_turn, _amountInCargoAtFirstTurnStart, _amountOnCellAtFirstTurnStart) {
        const _previousTurn = _turn - 1;

        const _amountInCargoAtTurnStart = _turn === 0 ? _amountInCargoAtFirstTurnStart : this._table[_previousTurn][this.COLUMN_LABELS.AMOUNT_IN_CARGO_AT_TURN_END];
        const _amountOnCellAtTurnStart = _turn === 0 ? _amountOnCellAtFirstTurnStart : this._table[_previousTurn][this.COLUMN_LABELS.AMOUNT_ON_CELL_AT_TURN_END];
        const _maximumCollectableAmount = this._calculateMaximumCollectableAmount(_amountOnCellAtTurnStart);
        const _collectedAmount = this._calculateCollectedAmount(_amountInCargoAtTurnStart, _maximumCollectableAmount);
        const _overFlowAmount = this._calculateOverflowAmount(_maximumCollectableAmount, _collectedAmount);
        const _amountInCargoAtTurnEnd = this._calculateAmountInCargoAtTurnEnd(_amountInCargoAtTurnStart, _collectedAmount);
        const _amountOnCellAtTurnEnd = this._calculateAmountOnCellAtTurnEnd (_amountOnCellAtTurnStart, _collectedAmount);
        const _totalLeaveCost = this._calculateTotalLeaveCost(_amountOnCellAtTurnEnd);
        const _amountInCargoAfterLeave = this._calculateAmountInCargoAfterLeave (_amountInCargoAtTurnEnd,  _totalLeaveCost);
        const _cargoWasteRate = this._calculateCargoWasteRate (_totalLeaveCost, _amountInCargoAtTurnEnd);
        const _cargoIncreaseRate = this._calculateCargoIncreaseRate (_amountInCargoAfterLeave, _amountInCargoAtTurnStart);
        const _halitePerTurn = this._calculateHalitePerTurn (_amountInCargoAtFirstTurnStart, _amountInCargoAfterLeave, _turn);

        this._table[_turn][this.COLUMN_LABELS.AMOUNT_IN_CARGO_AT_TURN_START] = _amountInCargoAtTurnStart;
        this._table[_turn][this.COLUMN_LABELS.AMOUNT_ON_CELL_AT_TURN_START] = _amountOnCellAtTurnStart;
        this._table[_turn][this.COLUMN_LABELS.MAXIMUM_COLLECTABLE_AMOUNT] = _maximumCollectableAmount;
        this._table[_turn][this.COLUMN_LABELS.COLLECTED_AMOUNT] = _collectedAmount;
        this._table[_turn][this.COLUMN_LABELS.OVERFLOW_AMOUNT] = _overFlowAmount;
        this._table[_turn][this.COLUMN_LABELS.AMOUNT_IN_CARGO_AT_TURN_END] = _amountInCargoAtTurnEnd;
        this._table[_turn][this.COLUMN_LABELS.AMOUNT_ON_CELL_AT_TURN_END] = _amountOnCellAtTurnEnd;
        this._table[_turn][this.COLUMN_LABELS.TOTAL_LEAVE_COST] = _totalLeaveCost;
        this._table[_turn][this.COLUMN_LABELS.AMOUNT_IN_CARGO_AFTER_LEAVE] = _amountInCargoAfterLeave;
        this._table[_turn][this.COLUMN_LABELS.CARGO_WASTE_RATE] = _cargoWasteRate;
        this._table[_turn][this.COLUMN_LABELS.CARGO_INCREASE_RATE] = _cargoIncreaseRate;
        this._table[_turn][this.COLUMN_LABELS.HALITE_PER_TURN] = _halitePerTurn;
    }

    generateTurnByTurnAnalysis (_amountInCargoAtTurnStart, _amountOnCellAtTurnStart) {
        for (let _i = 0, _iMax = this._table.length; _i < _iMax; _i++) {
            this._generateRow(_i, _amountInCargoAtTurnStart, _amountOnCellAtTurnStart);
        }

        const _transposedTable = this._table[0].map((col, i) => this._table.map(row => row[i]));

        return {
            AMOUNT_IN_CARGO_AT_TURN_START: _transposedTable[this.COLUMN_LABELS.AMOUNT_IN_CARGO_AT_TURN_START],
            AMOUNT_ON_CELL_AT_TURN_START: _transposedTable[this.COLUMN_LABELS.AMOUNT_ON_CELL_AT_TURN_START],
            AMOUNT_IN_CARGO_AFTER_LEAVE: _transposedTable[this.COLUMN_LABELS.AMOUNT_IN_CARGO_AFTER_LEAVE],
            OVERFLOW_AMOUNT: _transposedTable[this.COLUMN_LABELS.OVERFLOW_AMOUNT],
            TOTAL_LEAVE_COST: _transposedTable[this.COLUMN_LABELS.TOTAL_LEAVE_COST],
            CARGO_WASTE_RATE: _transposedTable[this.COLUMN_LABELS.CARGO_WASTE_RATE],
            CARGO_INCREASE_RATE: _transposedTable[this.COLUMN_LABELS.CARGO_INCREASE_RATE],
            HALITE_PER_TURN: _transposedTable[this.COLUMN_LABELS.HALITE_PER_TURN]
        };
    }
}

module.exports = CollectionRateAtCellAnalyzer;