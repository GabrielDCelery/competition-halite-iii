'use strict';

const constants = require('../../settings/constants');

class CollectHaliteInArea {
    constructor (_validStates, _ship) {
        this.validStates = _validStates;
        this.ship = _ship;
        this.gameMap = this.ship.getPlayerPublicMethods().getAI().getGameMap();
    }

    checkIfNeedsToTransitionToNewState () {
    }

    createCommandForTurn () {
    }
}

module.exports = CollectHaliteInArea;