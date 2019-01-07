'use strict';

const Task = require('../interface/Task');
const Sequencer = require('../composite/Sequencer');
const Selector = require('../composite/Selector');
const Inverter = require('../composite/Inverter');
const RepeatorUntilFail = require('../composite/RepeatorUntilFail');
const GetNextMoveStackTowardsDestination = require('../leaf/action/GetNextMoveStackTowardsDestination');
const GetNextMove = require('../leaf/action/GetNextMove');
const DoNextMoveIfTileEmpty = require('../subTree/DoNextMoveIfTileEmpty');
const StayStillIfDoesNotHaveEnoughHaliteToMove = require('../subTree/StayStillIfDoesNotHaveEnoughHaliteToMove');

class MoveTowardsDestination extends Task {
    constructor (_ship) {
        super();
        this.behaviour = new Selector([
            new StayStillIfDoesNotHaveEnoughHaliteToMove(_ship),
            new Sequencer([
                new GetNextMoveStackTowardsDestination(_ship),
                new RepeatorUntilFail(new Sequencer([
                    new GetNextMove(_ship),
                    new Inverter(new Sequencer([
                        new DoNextMoveIfTileEmpty(_ship)
                    ]))
                ]))
            ])
        ]);
    }

    init () {
        return this;
    }

    process () {
        return this.behaviour.process();
    }
}

module.exports = MoveTowardsDestination;