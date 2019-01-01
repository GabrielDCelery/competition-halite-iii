'use strict';

const constants = require('../../settings/constants');
const _ShipStateInterface = require('./_ShipStateInterface');

class MoveToDropoff extends _ShipStateInterface {
    constructor (_validStates, _ship) {
        super(_validStates, _ship);
        this.requestSwap = this.requestSwap.bind(this);
        this.destination = this.playerAI.getClosestDropoff(this.ship);
        this.lastSwappedWithShip = null;
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
        if (this.playerAI.checkIfShipsAreCalledHome(this.ship.getPosition())) {
            return this.validStates.SuicideRushHome;
        }

        if (this.ship.getHaliteInCargo() === 0) {
            return this.validStates.MoveToArea;
        }

        return null;
    }

    createCommandForTurn () {
        if (
            !this.ship.getAI().canMove() || 
            this.ship.getAI().shouldIStayOnTileWhileMovingToDropoff()
        ) {
            return this.ship.stayStill();
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

            if (_shipOnCell.getOwner() !== this.ship.getOwner() && _chosen.mapCell.getPosition().equals(this.destination)) {
                this.gameMap.getMapCellByPosition(this.ship.getPosition()).markSafe();
                _chosen.mapCell.markUnsafe(this.ship);

                return this.ship.move(_chosen.direction);
            }
        }
    }
}

module.exports = MoveToDropoff;