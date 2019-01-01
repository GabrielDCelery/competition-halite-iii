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
        if (this.playerAI.checkIfShipsAreCalledHome(this.ship.getPosition())) {
            return this.validStates.SuicideRushHome;
        }

        if (this.numOfTurnsSpentAtWanderingInArea > 6 || this.ship.getAI().isCargoFullEnoughForDropoff()) {
            this.playerAI.decreaseNumOfAlliedShipsInArea(this.ship.getId());

            return this.validStates.MoveToDropoff;
        }

        return null;
    }

    createCommandForTurn () {
        const _shipAI = this.ship.getAI();
        const _shipPosition = this.ship.getPosition();

        if (
            !_shipAI.canMove() || 
            !_shipAI.amIOnADropoff() && _shipAI.shouldIStayOnTileWhileCollectingHalite()
        ) {
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