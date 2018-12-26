'use strict';

class TurnsToSpendAtCellSuggestor {
    constructor () {
        this._collectionRateTable = null;
        this._thresholds = null;
    }

    setCollectionRateTable (_collectionRateTable) {
        this._collectionRateTable = _collectionRateTable;

        return this;
    }

    setThresholds (_thresholdConfigs) {
        this._thresholdConfigs = _thresholdConfigs;

        return this;
    }

    _getMinRequiredTurnsInDecreasingArray (_cellValues, _maxThreshold) {
        for (let _i = 0, _iMax = _cellValues.length; _i < _iMax; _i++) {
            if (_cellValues[_i] <= _maxThreshold) {
                return _i;
            }
        }

        return _cellValues.length - 1;
    }

    _getMaxAllowedTurnsInDecreasingArray (_cellValues, _minThreshold) {
        if (_cellValues[0] >= 0 && _cellValues[0] < _minThreshold) {
            return 0;
        }

        for (let _i = 1, _iMax = _cellValues.length; _i < _iMax; _i++) {
            if (_cellValues[_i] < _minThreshold) {
                return _i - 1;
            }
        }
    }

    _getMinRequiredTurnsInIncreasingArray (_cellValues, _minThreshold) {
        for (let _i = 0, _iMax = _cellValues.length; _i < _iMax; _i++) {
            if (_minThreshold <= _cellValues[_i]) {
                return _i;
            }
        }

        return _cellValues.length - 1;
    }

    _getMaxAllowedTurnsInIncreasingArray (_cellValues, _maxThreshold) {
        if (_maxThreshold[0] <= _cellValues[0]) {
            return 0;
        }

        for (let _i = 1, _iMax = _cellValues.length; _i < _iMax; _i++) {
            if (_cellValues[_i] <= _maxThreshold) {
                return _i - 1;
            }
        }

        return _cellValues.length - 1;
    }

    suggest () {
        const _minRecommendedTurns = [];
        const _maxAllowedTurns = [];

        this._thresholdConfigs.forEach((_config, _index) => {
            if (_index === 0) {
                return;
            }

            const _cellValues = this._collectionRateTable.getColumnByLabel(_config.label);
            const _firstElem = _cellValues[0] < 0 ? _cellValues[1] : _cellValues[0];
            const _bIsArrayIncreasing = _firstElem <= _cellValues[_cellValues.length - 1];

            if (_bIsArrayIncreasing) {
                if (_config.minThreshold) {
                    _minRecommendedTurns.push(this._getMinRequiredTurnsInIncreasingArray(_cellValues, _config.minThreshold));
                }

                if (_config.maxThreshold) {
                    _maxAllowedTurns.push(this._getMaxAllowedTurnsInIncreasingArray(_cellValues, _config.maxThreshold));
                }
            } else {
                if (_config.minThreshold) {
                    _maxAllowedTurns.push(this._getMaxAllowedTurnsInDecreasingArray(_cellValues, _config.minThreshold));
                }

                if (_config.maxThreshold) {
                    _minRecommendedTurns.push(this._getMinRequiredTurnsInDecreasingArray(_cellValues, _config.maxThreshold));
                }
            }
        });

        const _chosenMinRecommendedTurns = _minRecommendedTurns.length === 0 ? _cellValues.length - 1 : Math.max(..._minRecommendedTurns);
        const _chosenMaxAllowedTurns = _maxAllowedTurns.length === 0 ? 0 : Math.min(..._maxAllowedTurns);

        return {
            recommended: _chosenMaxAllowedTurns !== 0 && _chosenMinRecommendedTurns <= _chosenMaxAllowedTurns,
            turns: _chosenMinRecommendedTurns <= _chosenMaxAllowedTurns ? _chosenMaxAllowedTurns : _chosenMinRecommendedTurns
        }
    }
}

module.exports = TurnsToSpendAtCellSuggestor;
