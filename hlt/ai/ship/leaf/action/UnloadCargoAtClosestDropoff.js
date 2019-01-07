'use strict';

const Leaf = require('../Leaf');

class GetClosestDropoff extends Leaf {
    init () {
        return this;
    }

    process () {
        const _dropoff = this.playerAI.getClosestDropoff(this.ship);

        this.ship.setState('destination', _dropoff.getPosition());
        this.ship.setState('stateUnloadCargo', true);
    
        return this.SUCCESS;
    }
}

module.exports = GetClosestDropoff;