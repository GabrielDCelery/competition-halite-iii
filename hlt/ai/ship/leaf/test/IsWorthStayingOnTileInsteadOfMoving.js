'use strict';

const Leaf = require('../Leaf');

class IsWorthStayingOnTileInsteadOfMoving extends Leaf {
    init () {
        return this;
    }

    process () {
        const _areaId = this.playerAI.getAreaIdForPosition(this.ship.getState('position'));
        const _averageHaliteAmountOnTiles = this.playerAI.getHaliteAmountPerCellInArea(_areaId);
        const _haliteInShipCargo = this.ship.getState('haliteAmount');
        const _haliteOnTile = this.playerAI.getGameMap().getMapCellByPosition(this.ship.getState('position')).getHaliteAmount();
        
        const _bWorthStayingOnTile = _haliteInShipCargo < 700 && _averageHaliteAmountOnTiles * 0.5 <= _haliteOnTile;

        if (_bWorthStayingOnTile) {
            return this.SUCCESS;
        }

        return this.FAIL;
    }
}

module.exports = IsWorthStayingOnTileInsteadOfMoving;