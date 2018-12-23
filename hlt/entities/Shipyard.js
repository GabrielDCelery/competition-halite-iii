'use strict';

const commands = require('../settings/commands');
const GameEntity = require('./GameEntity');

class Shipyard extends GameEntity {
    spawn() {
        return commands.GENERATE;
    }
}

module.exports = Shipyard;