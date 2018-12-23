'use strict';

const Entity = require('./Entity');

class Dropoff extends Entity {
    static async _generate(playerId, getLine) {
        const [ id, xPos, yPos ] = (await getLine())
              .split(/\s+/)
              .map(x => parseInt(x, 10));
        return [ id, new Dropoff(playerId, id, new Position(xPos, yPos)) ];
    }
}

module.exports = Dropoff;