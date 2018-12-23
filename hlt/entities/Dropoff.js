'use strict';

const GameEntity = require('./GameEntity');

class Dropoff extends GameEntity {
    static async _generate(playerId, getLine) {
        const [ id, xPos, yPos ] = (await getLine())
              .split(/\s+/)
              .map(x => parseInt(x, 10));
        return [ id, new Dropoff(playerId, id, new Position(xPos, yPos)) ];
    }
}

module.exports = Dropoff;