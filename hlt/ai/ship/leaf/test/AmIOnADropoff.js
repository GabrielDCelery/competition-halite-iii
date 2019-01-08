'use strict';

const Leaf = require('../Leaf');

class AmIOnADropoff extends Leaf {
    init () {
        return this;
    }

    process () {
        const _haliteOnTile = this.playerAI.getGameMap().getMapCellByPosition(this.ship.getState('position')).getHaliteAmount();
        const _haliteInShipCargo = this.ship.getState('haliteAmount');
        const _bIAmOnADropoff = _haliteOnTile === 0 && _haliteInShipCargo === 0;

        if (_bIAmOnADropoff) {
            return this.SUCCESS;
        }

        return this.FAIL;
    }
}

module.exports = AmIOnADropoff;