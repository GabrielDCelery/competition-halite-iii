'use strict';

const constants = require('../../settings/constants');

class CollectHalite {
    constructor (_validStates, _ship) {
        this.validStates = _validStates;
        this.ship = _ship;
        this.commandCreatedForTurn = false;
        this.toggleCommandCreatedForTurn = this.toggleCommandCreatedForTurn.bind(this);
        this._init();
    }

    toggleCommandCreatedForTurn (_boolean) {
        this.commandCreatedForTurn = _boolean;

        return this;
    }

    _init () {
        this.playerAI = this.ship.getPlayerPublicMethods().getAI();
        this.gameMap = this.playerAI.getGameMap();
        this.areaId = this.playerAI.getAreaIdForPosition(this.ship.getPosition());
        this.previouslyVisitedCell = {
            x: null,
            y: null
        };
        this.worthAmount = this.playerAI.getHaliteAmountPerCellInArea(this.areaId) * 0.5;
        this.numOfTurnsSpentAtWanderingInArea = 0;
    }

    checkIfNeedsToTransitionToNewState () {
        if (this.numOfTurnsSpentAtWanderingInArea > 6 || constants.MAX_HALITE * 0.8 < this.ship.getHaliteInCargo()) {
            this.playerAI.decreaseNumOfAlliedShipsInArea(this.ship.getId());

            return this.validStates.MoveToDropoff;
        }

        return null;
    }

    createCommandForTurn () {
        const _shipPosition = this.ship.getPosition();
        const _haliteOnTile = this.gameMap.getMapCellByPosition(_shipPosition).getHaliteAmount();
        const _haliteInShipCargo = this.ship.getHaliteInCargo();

        const _isOnShipyard = _haliteOnTile === 0 && _haliteInShipCargo === 0;
        //const _worthToStayOnTile = constants.MAX_HALITE / 10 < _haliteOnTile;
        const _worthToStayOnTile = this.worthAmount <= _haliteOnTile || constants.MAX_HALITE / 10 < _haliteOnTile;

        if (!_isOnShipyard && _worthToStayOnTile) {
            return this.ship.stayStill();
        }

        const _canMove = Math.floor(_haliteOnTile / 10) <= _haliteInShipCargo;

        if (!_canMove) {
            return this.ship.stayStill();
        }

        const _positionOptions = _shipPosition.getSurroundingCardinals().map(this.gameMap.normalize);
        const _choices = [];

        _positionOptions.map(_positionOption => {
            const _bIsInArea = this.playerAI.getAreaIdForPosition(_positionOption) === this.areaId;

            if (!_bIsInArea) {
                return;
            }

            const _bVisitedAtPreviousTurn = _positionOption.equals(this.previouslyVisitedCell);

            if (_bVisitedAtPreviousTurn) {
                return;
            }

            const _mapCell = this.gameMap.getMapCellByPosition(_positionOption);

            if (!_mapCell.isEmpty) {
                return;
            }

            _choices.push({
                position: _positionOption,
                halite: _mapCell.getHaliteAmount()
            });
        });

        if (_choices.length === 0) {
            this.previouslyVisitedCell = {
                x: null,
                y: null
            };

            return this.ship.stayStill();
        }

        const _chosen = {
            position: null,
            halite: 0
        };

        _choices.forEach(_choice => {
            if (_chosen.halite <= _choice.halite) {
                _chosen.halite = _choice.halite;
                _chosen.position = _choice.position;
            }
        });

        this.previouslyVisitedCell = {
            x: _shipPosition.x,
            y: _shipPosition.y
        };

        this.numOfTurnsSpentAtWanderingInArea++;

        const _safeMove = this.gameMap.kamiKazeNavigate(this.ship, _chosen.position);

        return this.ship.move(_safeMove);
    }
}

module.exports = CollectHalite;