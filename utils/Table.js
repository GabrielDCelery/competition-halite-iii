'use strict';

class Table {
    constructor (_numOfRows, _numOfColumns) {
        this._numOfRows = _numOfRows;
        this._numOfColumns = _numOfColumns;
        this._tableCellsMatrix = null;
        this._columnLookup = {};
        this._rowLookup = {};
        this._createTable();
    }

    _createTable () {
        this._tableCellsMatrix = new Array(this._numOfRows).fill(null);

        for (let _i = 0, _iMax = this._numOfRows; _i < _iMax; _i++) {
            this._tableCellsMatrix[_i] = new Array(this._numOfColumns).fill(null);
        }
    }

    setColumnLookup (_columnLabels) {
        if (!Array.isArray(_columnLabels)) {
            throw new Error(`Expected a list of labels, instead received -> ${_columnLabels}`);
        }

        if (_columnLabels.length !== this._numOfColumns) {
            throw new Error(`Number of labels does not match number of columns, expected ${this._numOfColumns}, but received ${_columnLabels.length}`);
        }

        this._columnLookup = {};

        _columnLabels.forEach((_label, _index) => {
            this._columnLookup[_label] = _index;
        });

        return this;
    }

    setRowLookup (_rowLabels) {
        if (!Array.isArray(_rowLabels)) {
            throw new Error(`Expected a list of labels, instead received -> ${_rowLabels}`);
        }

        if (_rowLabels.length !== this._numOfRows) {
            throw new Error(`Number of labels does not match number of rows, expected ${this._numOfRows}, but received ${_rowLabels.length}`);
        }

        this._rowLookup = {};

        _rowLabels.forEach((_label, _index) => {
            this._rowLookup[_label] = _index;
        });

        return this;
    }

    setCellValue (_rowLabel, _colLabel, _value) {
        const _rowIndex = this._rowLookup.hasOwnProperty(_rowLabel) ? this._rowLookup[_rowLabel] : _rowLabel;
        const _colIndex = this._columnLookup.hasOwnProperty(_colLabel) ? this._columnLookup[_colLabel] : _colLabel;

        this._tableCellsMatrix[_rowIndex][_colIndex] = _value;

        return _value;
    }

    getCellValue (_rowLabel, _colLabel) {
        const _rowIndex = this._rowLookup.hasOwnProperty(_rowLabel) ? this._rowLookup[_rowLabel] : _rowLabel;
        const _colIndex = this._columnLookup.hasOwnProperty(_colLabel) ? this._columnLookup[_colLabel] : _colLabel;

        return this._tableCellsMatrix[_rowIndex][_colIndex];
    }

    setCellValueByIndex (_rowIndex, _colIndex, _value) {
        this._tableCellsMatrix[_rowIndex][_colIndex] = _value;

        return _value;
    }

    getCellValueByIndex (_rowIndex, _colIndex) {
        return this._tableCellsMatrix[_rowIndex][_colIndex];
    }

    getTable () {
        return this._tableCellsMatrix;
    }
}

module.exports = Table;