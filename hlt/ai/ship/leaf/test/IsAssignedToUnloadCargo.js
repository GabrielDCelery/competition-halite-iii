'use strict';

const Leaf = require('../Leaf');

class GetClosestDropoff extends Leaf {
    init () {
        return this;
    }

    process () {
        if (this.ship.getState('stateUnloadCargo')) {
            return this.SUCCESS;
        }
    
        return this.FAIL;
    }
}

module.exports = GetClosestDropoff;