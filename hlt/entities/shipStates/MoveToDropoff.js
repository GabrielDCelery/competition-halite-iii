'use strict';

const constants = require('../../settings/constants');

class MoveToDropoff {
    constructor (_validStates, _ship) {
        this.validStates = _validStates;
        this.ship = _ship;
        this.destination = this.ship.getPlayerPublicMethods().getShipyard().getPosition();
        this.gameMap = this.ship.getPlayerPublicMethods().getGameMap();
    }

    checkIfNeedsToTransitionToNewState () {
        if (this.ship.getHaliteInCargo() === 0) {
            return this.validStates.CollectHalite;
        }

        return null;
    }

    createCommandForTurn () {
        const _safeMove = this.gameMap.naiveNavigate(this.ship, this.destination);

        return this.ship.move(_safeMove);
    }
}

module.exports = MoveToDropoff;