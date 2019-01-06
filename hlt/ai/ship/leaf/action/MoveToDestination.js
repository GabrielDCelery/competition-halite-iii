'use strict';

const Leaf = require('../Leaf');
const commonTransformations = require('../../../../utils/commonTransformations');

class MoveToDestination extends Leaf {
    constructor () {
        super();
    }

    _canMove () {
        const _haliteOnTile = this.playerAI.getGameMap().getMapCellByPosition(this.ship.getState('position')).getHaliteAmount();
        const _haliteInShipCargo = this.ship.getState('haliteAmount');

        return Math.floor(_haliteOnTile / constants.MOVE_COST_RATIO) <= _haliteInShipCargo;
    }

    _markMyPositionSafe () {
        return this.playerAI.getGameMap().getMapCellByPosition(this.ship.getPosition()).markSafe();
    }

    _tryToMove (_move) {
        const _shipOnCell = _move.mapCell.getShip();

        if (
            _shipOnCell && 
            _shipOnCell.getOwner() === this.ship.getOwner() && 
            //this.lastSwappedWithShip !== _shipOnCell.getId() && 
            _shipOnCell.getAI().callMethodOnState('requestSwap', [this.ship])
        ) {
            //this.lastSwappedWithShip = _shipOnCell.getId();
            _move.mapCell.markUnsafe(this.ship);
            this.playerAI.pushCommandToQueue(this.ship.move(_move.direction));

            return true;
        }

        if (!_shipOnCell) {
            this._markMyPositionSafe();
            _move.mapCell.markUnsafe(this.ship);
            this.playerAI.pushCommandToQueue(this.ship.move(_move.direction));

            return true;
        }

        return false;
    }

    init (_ship, _destination) {
        this.ship = _ship;
        this.playerAI = this.ship.getPlayerPublicMethods().getAI();
        this.destinationPosition = _destination;

        return this;
    }

    process () {
        const _shipPosition = this.ship.getState('position');
        const _destinationPosition = this.ship.getState('destinationPosition');

        if (_shipPosition.equals(_destinationPosition)) {
            this.ship.setState('destinationPosition', null);

            return this.SUCCESS;
        }

        if (!this._canMove) {
            this.playerAI.pushCommandToQueue(this.ship.stayStill());

            return this.RUNNING;
        }

        const _moves = this.playerAI.getMapCellByPosition()
            .getUnsafeMoves(_shipPosition, _destinationPosition)
            .map(_direction => {
                const _targetPosition = _shipPosition.directionalOffset(_direction);
                const _mapCell = this.playerAI.getGameMap().getMapCellByPosition(_targetPosition);

                return {
                    mapCell: _mapCell,
                    direction: _direction,
                    halite: _mapCell.getHaliteAmount()
                };
            })
            .sort(commonTransformations.reverseSortByProperty('halite'));

        for (let _i = 0, _iMax = _moves.length; _i < _iMax; _i++) {
            if (this._tryToMove(_moves[_i])) {
                return this.RUNNING;
            }
        }
    
        return this.RUNNING;
    }
}

module.exports = MoveToDestination;