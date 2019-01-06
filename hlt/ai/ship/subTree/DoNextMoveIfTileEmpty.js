'use strict';

const Task = require('../interface/Task');
const Sequencer = require('../composite/Sequencer');
const Inverter = require('../composite/Inverter');
const IsNextMoveBlocked = require('../leaf/test/IsNextMoveBlocked');
const DoNextMove = require('../leaf/action/DoNextMove');

class DoNextMoveIfTileEmpty extends Task {
    constructor (_ship) {
        super();
        this.behaviour = new Sequencer([
            new Inverter(new IsNextMoveBlocked(_ship)),
            new DoNextMove(_ship)
        ])
    }

    init () {
        return this;
    }

    process () {
        return this.behaviour.process();
    }
}

module.exports = DoNextMoveIfTileEmpty;