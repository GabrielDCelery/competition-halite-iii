'use strict';

const Leaf = require('../Leaf');

class AmIAssignedToADestination extends Leaf {
    init () {
        return this;
    }

    process () {
        if (this.ship.getState('designatedArea')) {
            return this.SUCCESS;
        }

        return this.FAIL;
    }
}

module.exports = AmIAssignedToADestination;