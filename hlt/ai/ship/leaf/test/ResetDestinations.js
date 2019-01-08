'use strict';

const Leaf = require('../Leaf');

class ResetDestinations extends Leaf {
    init () {
        return this;
    }

    process () {
        this.ship.setState('designatedArea', null);
        this.ship.setState('designatedDropoff', null);
        this.ship.setState('destination', null);
        
        return this.SUCCESS;
    }
}

module.exports = ResetDestinations;