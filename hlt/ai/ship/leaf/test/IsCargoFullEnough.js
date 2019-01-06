'use strict';

const Leaf = require('../Leaf');
const constants = require('../../../../settings/constants');

class IsCargoFullEnough extends Leaf {
    init () {
        return this;
    }

    process () {
        const _bFullEnough = constants.MAX_HALITE * 0.8 < this.ship.getState('haliteAmount');

        if (_bFullEnough) {
            return this.SUCCESS;
        }
        
        return this.FAIL;
    }
}

module.exports = IsCargoFullEnough;