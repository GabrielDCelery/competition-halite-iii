'use strict';

const _ = require('lodash');

class CellHarvestSimulator {
    constructor () {
        this._harvestMap = {};
    }

    harvestCell (_turns, _amountInCargo, _amountOnCell) {
        let _currentAmountInCargo = _amountInCargo;
        let _currentAmountOnCell = _amountOnCell;
    
        _.times(_turns, () => {
            const _collected = Math.ceil(_currentAmountOnCell * 0.25);
    
            _currentAmountInCargo += _collected;
            _currentAmountOnCell -= _collected;
        });
    
        _currentAmountInCargo -= Math.ceil(_currentAmountOnCell * 0.1);
    
        return {
            amountInCargo: _currentAmountInCargo,
            amountOnCell: _currentAmountOnCell
        };
    }

    mapHarvest (_turnsArray, _amountInCargoArray, _amountOnCellArray) {
        _.forEach(_turnsArray, _turns => {
            _.forEach(_amountInCargoArray, _amountInCargo => {
                _.forEach(_amountOnCellArray, _amountOnCell => {
                    console.log(`${_turns}-${_amountInCargo}-${_amountOnCell}`)

                    _.set(this._harvestMap, [_turns, _amountInCargo, _amountOnCell], this.harvestCell(_turns, _amountInCargo, _amountOnCell))
                });
            });
        });
    }

    getMappedHarvest (_turns, _amountInCargo, _amountOnCell) {
        return _.get(this._harvestMap, [_turns, _amountInCargo, _amountOnCell])
    }
}

module.exports = CellHarvestSimulator;