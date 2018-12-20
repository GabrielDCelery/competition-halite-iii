'use strict';

const _ = require('lodash');
const CollectionRateAtCellAnalyzer = require('./CollectionRateAtCellAnalyzer');

class TurnsToSpendAtCellSuggestor {
    setCollectionRateTable (_collectionRateTable) {
        this._collectionRateTable = _collectionRateTable;

        return this;
    }

    setThresholds (_thresholds) {
        this._thresholds = _thresholds;

        return this;
    }

    _getMaxRecommendedTurns (_columnLabel, _threshold) {
        const _numOfTurns = this._collectionRateTable.getTable().length;

        for (let _i = 0, _iMax = _numOfTurns; _i < _iMax; _i++) {
            if (_i + 1 === _iMax) {
                continue;
            }

            const _cellValue = this._collectionRateTable.getCellValue(_i, _columnLabel);
            const _nextCellValue = this._collectionRateTable.getCellValue(_i + 1, _columnLabel);

            if (_threshold <= _cellValue && _threshold > _nextCellValue) {
                return _i;
            }
        }

        return 0;
    }

    _getMinRequiredTurns (_columnLabel, _threshold) {
        const _numOfTurns = this._collectionRateTable.getTable().length;

        for (let _i = 0, _iMax = _numOfTurns; _i <= _iMax; _i++) {
            const _cellValue = this._collectionRateTable.getCellValue(_i, _columnLabel);

            if (_cellValue <= _threshold) {
                return _i;
            }
        }

        return _numOfTurns;
    }

    calculate () {
        const _minValues = this._thresholds.min.map(_minConfig => {
            return this._getMinRequiredTurns(_minConfig.label, _minConfig.threshold);
        });

        const _maxValues = this._thresholds.max.map(_maxConfig => {
            return this._getMaxRecommendedTurns(_maxConfig.label, _maxConfig.threshold);
        });

        const _minTurns = _minValues.length === 0 ? 0 : Math.max(..._minValues);
        const _maxTurns = _maxValues.length === 0 ? 0 : Math.min(..._maxValues);

        const _recommendedTurns = _minTurns <= _maxTurns ? _maxTurns : _minTurns;

        return {
            recommended: _maxTurns !== 0 && _minTurns <= _maxTurns,
            turns: _recommendedTurns
        }
    }
}

module.exports = TurnsToSpendAtCellSuggestor;
