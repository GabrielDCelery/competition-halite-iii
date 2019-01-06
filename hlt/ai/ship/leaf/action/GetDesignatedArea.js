'use strict';

const Leaf = require('../Leaf');

class GetDesignatedArea extends Leaf {
    init () {
        return this;
    }

    process () {
        const _areaId = 1;
        //const _areaId = this.playerAI.getAreaRecommendationForShip(this.ship);
        const _destination = this.playerAI.getRandomPositionForAreaId(_areaId);

        this.ship.setState('designatedArea', _areaId);
        this.ship.setState('destination', _destination);

        return this.SUCCESS;
    }
}

module.exports = GetDesignatedArea;