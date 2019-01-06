'use strict';

const Leaf = require('../Leaf');

class AmIAtMyDesignatedArea extends Leaf {
    init () {
        return this;
    }

    process () {
        if (this.playerAI.getAreaIdForPosition(this.ship.getState('position')) === this.ship.getState('destinationArea')) {
            this.ship.setState('destinationArea', null);

            return this.SUCCESS;
        }

        return this.FAIL;
    }
}

module.exports = AmIAtMyDesignatedArea;