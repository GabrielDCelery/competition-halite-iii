'use strict';

const _ = require('lodash');
const Table = require('./Table');

describe('Table.js', () => {
    describe('_createTable ()', () => {
        test('creates a 2D array', () => {
            const NUM_OF_ROWS = 5;
            const NUM_OF_COLUMNS = 7;

            const table = new Table(NUM_OF_ROWS, NUM_OF_COLUMNS);

            expect(table._tableCellsMatrix).toHaveLength(NUM_OF_ROWS);

            _.times(NUM_OF_ROWS, _index => {
                expect(table._tableCellsMatrix[_index]).toHaveLength(NUM_OF_COLUMNS);
            });
        });
    });

    describe('setCellValueByIndex (_rowIndex, _colIndex, _value)', () => {
        test('sets the value of a cell', () => {
            const table = new Table(5, 7);

            table.setCellValueByIndex(3, 2, 'foo');

            expect(table._tableCellsMatrix[3][2]).toEqual('foo');
        });

        test('does not change the value of other cells', () => {
            const NUM_OF_ROWS = 5;
            const NUM_OF_COLUMNS = 7;

            const table = new Table(NUM_OF_ROWS, NUM_OF_COLUMNS);

            const ROW_INDEX_FOR_INSERT = 3;
            const COL_INDEX_FOR_INSERT = 2;

            table.setCellValueByIndex(ROW_INDEX_FOR_INSERT, COL_INDEX_FOR_INSERT, 'foo');

            for (let _i = 0, _iMax = NUM_OF_ROWS - 1; _i < _iMax; _i++) {
                for (let _j = 0, _jMax = NUM_OF_COLUMNS - 1; _j < _jMax; _j++) {
                    const _cellValue = table._tableCellsMatrix[_i][_j];

                    if (_i === ROW_INDEX_FOR_INSERT && _j === COL_INDEX_FOR_INSERT) {
                        expect(_cellValue).toEqual('foo');
                    } else {
                        expect(_cellValue).toEqual(null);
                    }
                }
            }
        });
    });

    describe('getCellValueByIndex (_rowIndex, _colIndex)', () => {
        test('gets value of a cell', () => {
            const table = new Table(5, 7);

            const ROW_INDEX_FOR_INSERT = 3;
            const COL_INDEX_FOR_INSERT = 2;

            table.setCellValueByIndex(ROW_INDEX_FOR_INSERT, COL_INDEX_FOR_INSERT, 'foo');

            expect(table.getCellValueByIndex(ROW_INDEX_FOR_INSERT, COL_INDEX_FOR_INSERT)).toEqual('foo');
        });
    });

    describe('setColumnLookup (_columnLabels)', () => {
        test('throws an error if _columnLabels is not an array', () => {
            const table = new Table(2, 3);

            expect(() => {
                table.setColumnLookup('foo');
            }).toThrow('Expected a list of labels, instead received -> foo');
        });

        test('throws an error if _columnLabels length does not match the number of columns in the table', () => {
            const table = new Table(2, 3);

            expect(() => {
                table.setColumnLookup(['foo', 'bar']);
            }).toThrow('Number of labels does not match number of columns, expected 3, but received 2');
        });

        test('creates labels for columns', () => {
            const table = new Table(2, 3);

            table.setColumnLookup(['foo', 'bar', 'foobar']);

            expect(table._columnLookup).toEqual({
                foo: 0,
                bar: 1,
                foobar: 2
            });
        });
    });

    describe('setRowLookup (_rowLabels)', () => {
        test('throws an error if _columnLabels is not an array', () => {
            const table = new Table(3, 4);

            expect(() => {
                table.setRowLookup('foo');
            }).toThrow('Expected a list of labels, instead received -> foo');
        });

        test('throws an error if _rowLabels length does not match the number of rows in the table', () => {
            const table = new Table(3, 4);

            expect(() => {
                table.setRowLookup(['foo', 'bar']);
            }).toThrow('Number of labels does not match number of rows, expected 3, but received 2');
        });

        test('creates labels for rows', () => {
            const table = new Table(3, 4);

            table.setRowLookup(['foo', 'bar', 'foobar']);

            expect(table._rowLookup).toEqual({
                foo: 0,
                bar: 1,
                foobar: 2
            });
        });
    });
});