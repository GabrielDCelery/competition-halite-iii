'use strict';

const commands = require('../settings/commands');
const Entity = require('./Entity');

class Shipyard extends Entity {
    spawn() {
        return commands.GENERATE;
    }
}

module.exports = Shipyard;