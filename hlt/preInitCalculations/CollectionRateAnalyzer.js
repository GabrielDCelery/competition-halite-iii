'use strict';

const constants = require('../settings/constants');
const commonTransformations = require('../utils/commonTransformations');

class CollectionRateAnalyzer {
    _createCollectionRateForTurn (_haliteInCargo, _haliteOnTile, _numOfTurnsToProjectForward, _bInspired, _currentTurnNumber = 1) {
        const _cargoRemainingSpace = /*constants.MAX_HALITE*/ 1000 - _haliteInCargo;
        const _maximumCollectable = Math.ceil(_haliteOnTile * 0.25 /*constants.EXTRACT_RATIO*/);
        const _actualCollected = _cargoRemainingSpace <= _maximumCollectable ? _cargoRemainingSpace : _maximumCollectable;
        const _amountRemainingOnTile = _haliteOnTile - _actualCollected;
        const _amountInCargoAfterCollection = _haliteInCargo + _actualCollected;
        const _bonus = _bInspired === true ? _maximumCollectable * 2 : 0;
        const _amountInCargoAfterBonus = (_amountInCargoAfterCollection + _bonus) <= 1000 ? (_amountInCargoAfterCollection + _bonus) : 1000;

        if (_numOfTurnsToProjectForward === _currentTurnNumber) {
            return {
                haliteInCargo: _amountInCargoAfterBonus,
                haliteOnTile: _amountRemainingOnTile
            };
        }

        const _nextTurnNumber = _currentTurnNumber + 1;

        return this._createCollectionRateForTurn(
            _amountInCargoAfterBonus, 
            _amountRemainingOnTile, 
            _numOfTurnsToProjectForward, 
            _bInspired, 
            _nextTurnNumber
        );
    }

    getCollectionRate (_haliteInCargo, _haliteOnTile, _numOfTurnsToProjectForward, _bIsInspired = false) {
        const _result = this._createCollectionRateForTurn(_haliteInCargo, _haliteOnTile, _numOfTurnsToProjectForward, _bIsInspired);
        
        const _leaveCost = Math.ceil(_result.haliteOnTile * 0.1);
        const _haliteInCargoAfterLeave = _result.haliteInCargo - _leaveCost;

        return {
            haliteInCargoAtStart: _haliteInCargo,
            haliteOnTileAtStart: _haliteOnTile,
            bInspired: _bIsInspired,
            haliteInCargoAfterLeave: _haliteInCargoAfterLeave,
            haliteOnTileAfterLeave: _result.haliteOnTile,
            halitePerTurn: parseFloat(((_haliteInCargoAfterLeave - _haliteInCargo) / _numOfTurnsToProjectForward).toFixed(2), 10)
        }
    }
}

module.exports = CollectionRateAnalyzer;