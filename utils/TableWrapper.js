'use strict';

const _ = require('lodash');

class TableWrapper {
    constructor (_2DMatrix) {
        this._table = TableWrapper._clone2DMatrix(_2DMatrix);
        this._transposedTable = _.zip(this._table);
        this._numOfRows = this._table.length;
        this._numOfColumns = this._table[0].length;
        this._rowLabels = {};
        this._columnLabels = {};
    }

    setRowLabel (_label, _index) {
        this._rowLabels[_label] = _index;

        return this;
    }

    setColumnLabel (_label, _index) {
        this._columnLabels[_label] = _index;

        return this;
    }

    setCellValue (_rowLabel, _colLabel, _value) {
        const _rowIndex = this._rowLabels.hasOwnProperty(_rowLabel) ? this._rowLabels[_rowLabel] : _rowLabel;
        const _colIndex = this._columnLabels.hasOwnProperty(_colLabel) ? this._columnLabels[_colLabel] : _colLabel;

        this._table[_rowIndex][_colIndex] = _value;
        this._transposedTable[_colIndex][_rowIndex] = _value;
    }

    getCellValue (_rowLabel, _colLabel) {
        const _rowIndex = this._rowLabels.hasOwnProperty(_rowLabel) ? this._rowLabels[_rowLabel] : _rowLabel;
        const _colIndex = this._columnLabels.hasOwnProperty(_colLabel) ? this._columnLabels[_colLabel] : _colLabel;

        return this._table[_rowIndex][_colIndex];
    }

    setCellValueByIndex (_rowIndex, _colIndex, _value) {
        this._table[_rowIndex][_colIndex] = _value;
        this._transposedTable[_colIndex][_rowIndex] = _value;

        return _value;
    }

    getCellValueByIndex (_rowIndex, _colIndex) {
        return this._table[_rowIndex][_colIndex];
    }

    getRowByIndex (_rowIndex) {
        return this._table[_rowIndex];
    }

    getColumnByIndex (_colIndex) {
        return this._transposedTable[_colIndex];
    }

    getColumnByLabel (_colLabel) {
        const _colIndex = this._columnLabels.hasOwnProperty(_colLabel) ? this._columnLabels[_colLabel] : _colLabel;

        return this._transposedTable[_colIndex];
    }

    getTable () {
        return this._table;
    }

    static _clone2DMatrix (_2DMatrix) {
        const _length = _2DMatrix.length;
        const _copy = new Array(_length);

        for (let _i = 0, _iMax = _length; _i < _iMax; _i++) {
            _copy[_i] = _2DMatrix[_i].slice();
        }

        return _copy;
    }

    static generateEmptyTable (_numOfRows, _numOfColumns) {
        const _table = new Array(_numOfRows);

        for (let _i = 0, _iMax = _numOfRows; _i < _iMax; _i++) {
            _table[_i] = new Array(_numOfColumns).fill(null);
        }

        return _table;
    }
}

module.exports = TableWrapper;