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
                return {
                    pass: true,
                    turns: _i
                };
            }
        }

        return {
            pass: false,
            turns: null
        };
    }

    _getMaxAllowedTurnsInDecreasingArray (_cellValues, _minThreshold) {
        if (_cellValues[0] < _minThreshold) {
            return {
                pass: false,
                turns: null
            };
        }

        for (let _i = 1, _iMax = _cellValues.length; _i < _iMax; _i++) {
            if (_cellValues[_i] < _minThreshold) {
                return {
                    pass: true,
                    turns: _i - 1
                };
            }
        }

        return {
            pass: false,
            turns: _cellValues.length - 1
        };
    }

    _getMinRequiredTurnsInIncreasingArray (_cellValues, _minThreshold) {
        for (let _i = 0, _iMax = _cellValues.length; _i < _iMax; _i++) {
            if (_minThreshold <= _cellValues[_i]) {
                return {
                    pass: true,
                    turns: _i
                };
            }
        }

        return {
            pass: false,
            turns: null
        };
    }

    _getMaxAllowedTurnsInIncreasingArray (_cellValues, _maxThreshold) {
        if (_maxThreshold < _cellValues[0]) {
            return {
                pass: false,
                turns: null
            };
        }

        for (let _i = 0, _iMax = _cellValues.length; _i < _iMax; _i++) {
            if (_maxThreshold < _cellValues[_i]) {
                return {
                    pass: true,
                    turns: _i - 1
                };
            }
        }

        return {
            pass: true,
            turns: _cellValues.length - 1
        };
    }

    suggest () {
        const _minRecommendedTurns = [];
        const _maxAllowedTurns = [];

        for (let _i = 0, _iMax = this._thresholdConfigs.length; _i < _iMax; _i++) {
            const _config = this._thresholdConfigs[_i];
            const _cellValues = this._collectionRateTable[_config.label];
            const _bIsArrayLevel = _cellValues[0] === _cellValues[_cellValues.length - 1];

            if (_bIsArrayLevel) {
                if (_config.minThreshold) {
                    const _bIsPass = _config.minThreshold <= _cellValues[0];

                    if (!_bIsPass) {
                        return {
                            recommended: false,
                            turns: null
                        } 
                    }

                    _minRecommendedTurns.push(0);
                }

                if (_config.maxThreshold) {
                    const _bIsPass = _cellValues[0] <= _config.maxThreshold;

                    if (!_bIsPass) {
                        return {
                            recommended: false,
                            turns: null
                        } 
                    }

                    _maxAllowedTurns.push(_cellValues.length - 1);
                }
            }

            const _bIsArrayIncreasing = _cellValues[0] < _cellValues[_cellValues.length - 1];

            if (_bIsArrayIncreasing) {
                if (_config.minThreshold) {
                    const _suggestion = this._getMinRequiredTurnsInIncreasingArray(_cellValues, _config.minThreshold);

                    if (!_suggestion.pass) {
                        return {
                            recommended: false,
                            turns: null
                        }
                    }

                    _minRecommendedTurns.push(_suggestion.turns);
                }

                if (_config.maxThreshold) {
                    const _suggestion = this._getMaxAllowedTurnsInIncreasingArray(_cellValues, _config.maxThreshold);

                    if (!_suggestion.pass) {
                        return {
                            recommended: false,
                            turns: null
                        }
                    }

                    _maxAllowedTurns.push(_suggestion.turns);
                }
            } 

            const _bIsArrayDecreasing = _cellValues[_cellValues.length - 1] < _cellValues[0];
            
            if (_bIsArrayDecreasing) {
                if (_config.minThreshold) {
                    const _suggestion = this._getMaxAllowedTurnsInDecreasingArray(_cellValues, _config.minThreshold);

                    if (!_suggestion.pass) {
                        return {
                            recommended: false,
                            turns: null
                        }
                    }

                    _maxAllowedTurns.push(_suggestion.turns);
                }

                if (_config.maxThreshold) {
                    const _suggestion = this._getMinRequiredTurnsInDecreasingArray(_cellValues, _config.maxThreshold);

                    if (!_suggestion.pass) {
                        return {
                            recommended: false,
                            turns: null
                        }
                    }

                    _minRecommendedTurns.push(_suggestion.turns);
                }
            }
        }

        if (_minRecommendedTurns.length === 0 || _maxAllowedTurns.length === 0) {
            return {
                recommended: false,
                turns: null
            }
        }

        const _chosenMinRecommendedTurns = Math.max(..._minRecommendedTurns);
        const _chosenMaxAllowedTurns = Math.min(..._maxAllowedTurns);

        return {
            recommended: _chosenMinRecommendedTurns <= _chosenMaxAllowedTurns,
            turns: _chosenMinRecommendedTurns <= _chosenMaxAllowedTurns ? _chosenMaxAllowedTurns + 1 : _chosenMinRecommendedTurns + 1
        }
    }
}

module.exports = TurnsToSpendAtCellSuggestor;
