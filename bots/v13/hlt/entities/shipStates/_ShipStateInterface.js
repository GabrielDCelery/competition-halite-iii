'use strict';

class _ShipStateInterface {
    constructor (_validStates, _ship) {
        this.validStates = _validStates;
        this.ship = _ship;
        this.playerAI = this.ship.getPlayerPublicMethods().getAI();
        this.gameMap = this.playerAI.getGameMap();
        this.commandCreatedForTurn = false;
        this.toggleCommandCreatedForTurn = this.toggleCommandCreatedForTurn.bind(this);
    }

    toggleCommandCreatedForTurn (_boolean) {
        this.commandCreatedForTurn = _boolean;

        return this;
    }
}

module.exports = _ShipStateInterface;
