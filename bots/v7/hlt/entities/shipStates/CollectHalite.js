'use strict';

const constants = require('../../settings/constants');

class CollectHalite {
    constructor (_validStates, _ship) {
        this.validStates = _validStates;
        this.ship = _ship;
        this._init();
    }

    _init () {
        this.playerAI = this.ship.getPlayerPublicMethods().getAI();
        this.gameMap = this.playerAI.getGameMap();
    }

    checkIfNeedsToTransitionToNewState () {
        if (constants.MAX_HALITE * 0.8 < this.ship.getHaliteInCargo()) {
            return this.validStates.MoveToDropoff;
        }

        return null;
    }

    createCommandForTurn () {
        const _shipPosition = this.ship.getPosition();
        const _haliteOnTile = this.gameMap.getMapCellByPosition(_shipPosition).getHaliteAmount();
        const _haliteInShipCargo = this.ship.getHaliteInCargo();

        const _isOnShipyard = _haliteOnTile === 0 && _haliteInShipCargo === 0;
        const _worthToStayingOnTile = constants.MAX_HALITE / 10 < _haliteOnTile;

        if (!_isOnShipyard && _worthToStayingOnTile) {
            return this.ship.stayStill();
        }

        const _canMove = Math.floor(_haliteOnTile / 10) <= _haliteInShipCargo;

        if (!_canMove) {
            return this.ship.stayStill();
        }

        const _positionOptions = _shipPosition.getSurroundingCardinals().map(this.gameMap.normalize);
        const _choices = [];

        _positionOptions.map(_positionOption => {
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

        const _safeMove = this.gameMap.kamiKazeNavigate(this.ship, _chosen.position);

        return this.ship.move(_safeMove);
    }
}

module.exports = CollectHalite;