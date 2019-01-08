'use strict';

const Leaf = require('../Leaf');

class AmIAssignedToAnArea extends Leaf {
    init () {
        return this;
    }

    process () {
        if (this.ship.getState('designatedDropoff')) {
            return this.SUCCESS;
        }

        return this.FAIL;
    }
}

module.exports = AmIAssignedToAnArea;