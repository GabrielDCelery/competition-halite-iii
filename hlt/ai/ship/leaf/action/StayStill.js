'use strict';

const Leaf = require('../Leaf');

class StayStill extends Leaf {
    init () {
        return this;
    }

    process () {
        this.playerAI.pushCommandToQueue(this.ship.stayStill());

        return this.SUCCESS;
    }
}

module.exports = StayStill;