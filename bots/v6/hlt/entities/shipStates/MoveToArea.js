'use strict';

const constants = require('../../settings/constants');

class MoveToArea {
    constructor (_validStates, _ship) {
        this.validStates = _validStates;
        this.ship = _ship;
        this._init();
    }

    _init () {
        this.playerAI = this.ship.getPlayerPublicMethods().getAI();
        this.areaId = this.playerAI.getAreaIdForPosition(this.ship.getPosition());

    }

    checkIfNeedsToTransitionToNewState () {
    }

    createCommandForTurn () {
    }
}

module.exports = MoveToArea;