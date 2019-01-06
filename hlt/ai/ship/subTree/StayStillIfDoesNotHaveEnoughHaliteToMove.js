'use strict';

const Task = require('../interface/Task');
const Sequencer = require('../composite/Sequencer');
const Inverter = require('../composite/Inverter');
const DoIHaveEnoughHaliteToMove = require('../leaf/test/DoIHaveEnoughHaliteToMove');
const StayStill = require('../leaf/action/StayStill');

class StayStillIfDoesNotHaveEnoughHaliteToMove extends Task {
    constructor (_ship) {
        super();
        this.behaviour = new Sequencer([
            new Inverter(new DoIHaveEnoughHaliteToMove(_ship)),
            new StayStill(_ship)
        ]);
    }

    init () {
        return this;
    }

    process () {
        return this.behaviour.process();
    }
}

module.exports = StayStillIfDoesNotHaveEnoughHaliteToMove;