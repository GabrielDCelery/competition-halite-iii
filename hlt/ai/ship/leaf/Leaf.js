'use strict';

const Task = require('../interface/Task');

class LeafTask extends Task {
    constructor (_ship) {
        super();
        this.ship = _ship;
        this.playerAI = this.ship.getPlayerPublicMethods().getAI();
    }
}

module.exports = LeafTask;