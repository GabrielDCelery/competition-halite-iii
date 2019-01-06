'use strict';

const Leaf = require('../Leaf');
const commonTransformations = require('../../../../utils/commonTransformations');

class GetMoveStackTowardsDestination extends Leaf {
    init () {
        return this;
    }

    process () {
        const _shipPosition = this.ship.getState('position');
        const _destinationPosition = this.ship.getState('destination');
        const _gameMap = this.playerAI.getGameMap();

        const _nextMoveStack = _gameMap.getUnsafeMoves(_shipPosition, _destinationPosition)
            .map(_direction => {
                const _targetPosition = _shipPosition.directionalOffset(_direction);
                const _mapCell = _gameMap.getMapCellByPosition(_targetPosition);

                return {
                    mapCell: _mapCell,
                    direction: _direction,
                    halite: _mapCell.getHaliteAmount()
                };
            })
            .sort(commonTransformations.reverseSortByProperty('halite'));

        this.ship.setState('nextMoveStack', _nextMoveStack);

        return this.SUCCESS;
    }
}

module.exports = GetMoveStackTowardsDestination;