'use strict';

const constants = require('../../settings/constants');

class MoveToArea {
    constructor (_validStates, _ship) {
        this.validStates = _validStates;
        this.ship = _ship;
        this.commandCreatedForTurn = false;
        this.requestSwap = this.requestSwap.bind(this);
        this.toggleCommandCreatedForTurn = this.toggleCommandCreatedForTurn.bind(this);
        this._init();
    }

    _init () {
        this.playerAI = this.ship.getPlayerPublicMethods().getAI();
        this.gameMap = this.playerAI.getGameMap();
        this.targetAreaId = this.playerAI.getAreaRecommendationForShip(this.ship);
        this.destination = this._getPositionNotInAlignment(this.ship.getPosition(), this.playerAI.getCenterPositionsForAreaId(this.targetAreaId));
        this.lastSwappedWithShip = null;
    }

    toggleCommandCreatedForTurn (_boolean) {
        this.commandCreatedForTurn = _boolean;

        return this;
    }

    requestSwap (_ship) {
        if (this.commandCreatedForTurn === true || this.lastSwappedWithShip === _ship.getId()) {
            return false;
        }

        const _haliteOnTile = this.gameMap.getMapCellByPosition(this.ship.getPosition()).getHaliteAmount();
        const _haliteInShipCargo = this.ship.getHaliteInCargo();

        const _canMove = Math.floor(_haliteOnTile / 10) <= _haliteInShipCargo;

        if (!_canMove) {
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
        if (this.playerAI.checkIfShipsAreCalledHome(this.ship.getPosition())) {
            return this.validStates.SuicideRushHome;
        }

        if (constants.MAX_HALITE * 0.8 < this.ship.getHaliteInCargo()) {
            return this.validStates.MoveToDropoff;
        }

        if (this.playerAI.getAreaIdForPosition(this.ship.getPosition()) === this.targetAreaId) {
            return this.validStates.CollectHaliteInArea;
        }

        return null;
    }

    createCommandForTurn () {
        const _haliteOnTile = this.gameMap.getMapCellByPosition(this.ship.getPosition()).getHaliteAmount();
        const _haliteInShipCargo = this.ship.getHaliteInCargo();

        const _canMove = Math.floor(_haliteOnTile / 10) <= _haliteInShipCargo;

        if (!_canMove) {
            return this.ship.stayStill();
        }

        const _worthAmount = this.playerAI.getHaliteAmountPerCellInArea(this.playerAI.getAreaIdForPosition(this.ship.getPosition())) * 0.5
        const _worthToStayOnTile = _worthAmount <= _haliteOnTile || constants.MAX_HALITE / 10 < _haliteOnTile;

        if (_worthToStayOnTile) {
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