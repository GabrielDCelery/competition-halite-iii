'use strict';

const constants = require('../../settings/constants');
const _ShipStateInterface = require('./_ShipStateInterface');

class SuicideRushHome extends _ShipStateInterface {
    constructor (_validStates, _ship) {
        super(_validStates, _ship);
        this.destination = this.playerAI.getShipyardPosition();
    }

    checkIfNeedsToTransitionToNewState () {
        return null;
    }

    createCommandForTurn () {
        if (!this.ship.getAI().canMove()) {
            return this.ship.stayStill();
        }
    
        const _choices = this.gameMap.getAnalyzedListOfChoicesTowardsDestination(this.ship, this.destination);

        for (let _i = 0, _iMax = _choices.length; _i < _iMax; _i++) {
            const _chosen = _choices[_i];
            const _shipOnCell = _chosen.ship;

            if (!_shipOnCell || _chosen.mapCell.getPosition().equals(this.destination)) {
                this.gameMap.getMapCellByPosition(this.ship.getPosition()).markSafe();
                _chosen.mapCell.markUnsafe(this.ship);

                return this.ship.move(_chosen.direction);
            }
        }
    }
}

module.exports = SuicideRushHome;