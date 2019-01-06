'use strict';

const Leaf = require('../Leaf');

class GetNextMove extends Leaf {
    init () {
        return this;
    }

    process () {
        const _nextMoveStack = this.ship.getState('nextMoveStack');

        if (_nextMoveStack.length === 0) {
            return this.FAIL;
        }

        this.ship.setState('nextMove', _nextMoveStack.pop())

        return this.SUCCESS;
    }
}

module.exports = GetNextMove;