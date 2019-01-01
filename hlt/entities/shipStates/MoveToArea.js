'use strict';

const constants = require('../../settings/constants');
const _ShipStateInterface = require('./_ShipStateInterface');

class MoveToArea extends _ShipStateInterface {
    constructor (_validStates, _ship) {
        super(_validStates, _ship);
        this.requestSwap = this.requestSwap.bind(this);
        this.targetAreaId = this.ship.getAI().requestHaliteRichAreaFromGlobalAI();
        this.destination = this._getPositionNotInAlignment(this.ship.getPosition(), this.playerAI.getCenterPositionsForAreaId(this.targetAreaId));
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

    _getPositionNotInAlignment (_shipPosition, _targetPositions) {
        for (let _i = 0, _iMax = _targetPositions.length; _i < _iMax; _i++) {
            if (_shipPosition.x !== _targetPositions[_i].x && _shipPosition.y !== _targetPositions[_i].y) {
                return _targetPositions[_i];
            }
        }

        return _shipPosition;
    }

    checkIfNeedsToTransitionToNewState () {
        if (this.ship.getAI().shouldIRushHome()) {
            return this.validStates.SuicideRushHome;
        }

        if (this.ship.getAI().isCargoFullEnoughForDropoff()) {
            return this.validStates.MoveToDropoff;
        }

        if (this.playerAI.getAreaIdForPosition(this.ship.getPosition()) === this.targetAreaId) {
            return this.validStates.CollectHaliteInArea;
        }

        return null;
    }

    createCommandForTurn () {
        const _shipAI = this.ship.getAI();

        if (
            !_shipAI.canMove() || 
            !_shipAI.amIOnADropoff() && _shipAI.shouldIStayOnTileInsteadOfMovingTowardsArea()
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
        }
    }
}

module.exports = MoveToArea;