'use strict';

const Leaf = require('../Leaf');

class GetClosestDropoff extends Leaf {
    init () {
        return this;
    }

    process () {
        this.ship.setState('designatedDropoff', true);
        this.ship.setState('destination', this.playerAI.getClosestDropoffPosition(this.ship));
    
        return this.SUCCESS;
    }
}

module.exports = GetClosestDropoff;