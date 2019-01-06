'use strict';

const Leaf = require('../Leaf');

class AmIAtMyDestination extends Leaf {
    init () {
        return this;
    }

    process () {
        if (this.ship.getState('position') === this.ship.getState('destination')) {
            this.ship.setState('destination', null);

            return this.SUCCESS;
        }

        return this.FAIL;
    }
}

module.exports = AmIAtMyDestination;