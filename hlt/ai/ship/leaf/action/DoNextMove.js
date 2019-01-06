'use strict';

const Leaf = require('../Leaf');

class DoNextMove extends Leaf {
    init () {
        return this;
    }

    process () {
        const _move = this.ship.getState('nextMove');

        if (!_move) {
            return this.FAIL;
        }

        const _gameMap = this.playerAI.getGameMap();

        _gameMap.getMapCellByPosition(this.ship.getState('position')).markSafe();
        _gameMap.getMapCellByPosition(_move.mapCell.getPosition()).markUnsafe(this.ship);

        this.playerAI.pushCommandToQueue(this.ship.move(_move.direction));
        this.ship.setState('nextMove', null);

        return this.SUCCESS;
    }
}

module.exports = DoNextMove;