'use strict';

const Leaf = require('../Leaf');
const constants = require('../../../../settings/constants');

class DoIHaveEnoughHaliteToMove extends Leaf {
    init () {
        return this;
    }

    process () {
        const _haliteOnTile = this.playerAI.getGameMap().getMapCellByPosition(this.ship.getState('position')).getHaliteAmount();
        const _haliteInShipCargo = this.ship.getState('haliteAmount');

        const _bCanMove = Math.floor(_haliteOnTile / constants.MOVE_COST_RATIO) <= _haliteInShipCargo;

        if (_bCanMove) {
            return this.SUCCESS;
        }
        
        return this.FAIL;
    }
}

module.exports = DoIHaveEnoughHaliteToMove;