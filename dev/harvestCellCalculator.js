'use strict';

const _ = require('lodash');

const harvestCell = function harvestCell (_turns, _amountInCargo, _amountOnCell) {
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
    }
}