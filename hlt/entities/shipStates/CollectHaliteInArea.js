'use strict';

const constants = require('../../settings/constants');
const _ShipStateInterface = require('./_ShipStateInterface');

class CollectHalite extends _ShipStateInterface {
    constructor (_validStates, _ship) {
        super(_validStates, _ship);
        this.areaId = this.ship.getAI().whichAreaIAmIn();
        this.previouslyVisitedCell = {
            x: null,
            y: null
        };

        this.numOfTurnsSpentAtWanderingInArea = 0;
    }

    checkIfNeedsToTransitionToNewState () {
        if (this.ship.getAI().shouldIRushHome()) {
            return this.validStates.SuicideRushHome;
        }

        if (this.ship.getAI().isCargoFullEnoughForDropoff()) {
            this.playerAI.decreaseNumOfAlliedShipsInArea(this.ship.getId());

            return this.validStates.MoveToDropoff;
        }

        return null;
    }

    createCommandForTurn () {
        const _shipAI = this.ship.getAI();

        if (!_shipAI.canMove()) {
            return this.ship.stayStill();
        }

        const _mostProfitablePositions = _shipAI.getMostProfitablePositions();

        if (_mostProfitablePositions.length === 0) {
            return this.ship.stayStill()
        }

        const _move = this.gameMap.kamiKazeNavigate(this.ship, _mostProfitablePositions[0]);

        return this.ship.move(_move);
    }
}

module.exports = CollectHalite;