'use strict';

const Leaf = Leaf('./Leaf');
const commonTransformations = require('../../../../utils/commonTransformations');

class ConvertToDropoff extends Leaf {
    constructor () {
        super();
    }

    init (_ship, _destination) {
        this.ship = _ship;
        this.playerAI = this.ship.getPlayerPublicMethods().getAI();

        return this;
    }

    process () {
    }
}

module.exports = ConvertToDropoff;