'use strict';

const constants = require('../../settings/constants');

class CollectHalite {
    constructor (_validStates, _ship) {
        this.validStates = _validStates;
        this.ship = _ship;
        this.gameMap = this.ship.getPlayerPublicMethods().getGameMap();
    }

    checkIfNeedsToTransitionToNewState () {
        if (constants.MAX_HALITE / 2 < this.ship.getHaliteInCargo()) {
            return this.validStates.MoveToDropoff;
        }

        return null;
    }

    createCommandForTurn () {
        const _haliteOnTile = this.gameMap.getMapCellByPosition(this.ship.getPosition()).getHaliteAmount();
        const _haliteInShipCargo = this.ship.getHaliteInCargo();

        if (_haliteInShipCargo === 0 || (_haliteOnTile < constants.MAX_HALITE / 10 && Math.floor(_haliteOnTile / 10) < _haliteInShipCargo)) {
            const _direction = this.gameMap.Direction.getAllCardinals()[Math.floor(4 * Math.random())];
            const _destination = this.ship.getPosition().directionalOffset(_direction);
            const _safeMove = this.gameMap.naiveNavigate(this.ship, _destination);
    
            return this.ship.move(_safeMove);
        }

        return this.ship.stayStill();
    }
}

module.exports = CollectHalite;