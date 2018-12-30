'use strict';

const constants = require('../../settings/constants');
const _ShipStateInterface = require('./_ShipStateInterface');

class MoveToLocationAndConvertToDropoff extends _ShipStateInterface {
    constructor (_validStates, _ship, _config) {
        super(_validStates, _ship);
        this.destination = _config;
        this.lastSwappedWithShip = null;
        this.requestSwap = this.requestSwap.bind(this);
    }

    requestSwap (_ship) {
        if (this.commandCreatedForTurn === true || this.lastSwappedWithShip === _ship.getId()) {
            return false;
        }

        if (!this.ship.getAI().canMove()) {
            return false;
        }

        const _choices = this.gameMap.getAnalyzedListOfChoicesTowardsDestination(this.ship, this.destination);

        if (_choices.length === 0) {
            return false;
        }

        const _chosen = _choices[0];

        if (_ship.getPosition().equals(_chosen.mapCell.getPosition())) {
            this.lastSwappedWithShip = _ship.getId();
            _chosen.mapCell.markUnsafe(this.ship);
            this.toggleCommandCreatedForTurn(true);
            this.ship.getPlayerPublicMethods().pushCommandToQueue(this.ship.move(_chosen.direction));

            return true;
        }

        return false;
    }

    checkIfNeedsToTransitionToNewState () {
        return null;
    }

    createCommandForTurn () {
        const _shipAI = this.ship.getAI();

        if (!_shipAI.canMove()) {
            return this.ship.stayStill();
        }

        if (this.gameMap.calculateManhattanDistance(this.ship.getPosition(), this.destination) <= 2) {
            if (this.playerAI.player.getHaliteAmount() < 4000) {
                return this.ship.stayStill();
            }

            this.playerAI.justCreatedDropoff = true;
            this.playerAI.bCreateDropoff = false;

            return this.ship.makeDropoff();
        }

        const _choices = this.gameMap.getAnalyzedListOfChoicesTowardsDestination(this.ship, this.destination);

        for (let _i = 0, _iMax = _choices.length; _i < _iMax; _i++) {
            const _chosen = _choices[_i];
            const _shipOnCell = _chosen.ship;

            if (_shipOnCell && _shipOnCell.getOwner() === this.ship.getOwner() && this.lastSwappedWithShip !== _shipOnCell.getId() && _shipOnCell.callMethodOnState('requestSwap', [this.ship])) {
                this.lastSwappedWithShip = _shipOnCell.getId();
                _chosen.mapCell.markUnsafe(this.ship);

                return this.ship.move(_chosen.direction);
            }

            if (!_shipOnCell) {
                this.gameMap.getMapCellByPosition(this.ship.getPosition()).markSafe();
                _chosen.mapCell.markUnsafe(this.ship);

                return this.ship.move(_chosen.direction);
            }
        }
    }
}

module.exports = MoveToLocationAndConvertToDropoff;