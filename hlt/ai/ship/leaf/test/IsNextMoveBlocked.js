'use strict';

const Leaf = require('../Leaf');

class IsNextMoveBlocked extends Leaf {
    init () {
        return this;
    }

    process () {
        const _move = this.ship.getState('nextMove');

        if (_move.mapCell.getShip()) {
            return this.SUCCESS;
        }

        return this.FAIL;
    }
}

module.exports = IsNextMoveBlocked;