'use strict';

const Task = require('../interface/Task');
const Selector = require('../composite/Selector');
const Sequencer = require('../composite/Sequencer');
const Inverter = require('../composite/Inverter');
const RepeatorUntilFail = require('../composite/RepeatorUntilFail');
const GetNextMoveStackTowardsDestination = require('../leaf/action/GetNextMoveStackTowardsDestination');
const GetNextMove = require('../leaf/action/GetNextMove');
const StayStillIfCannotMove = require('./StayStillIfCannotMove');
const DoNextMoveIfTileEmpty = require('./DoNextMoveIfTileEmpty');

class MoveToDesignatedArea extends Task {
    constructor (_ship) {
        super();
        this.ship = _ship;
        this._init();
    }

    _init (_ship) {
        this.behaviour = new Selector([
            new StayStillIfCannotMove(this.ship),
            new Sequencer([
                new GetNextMoveStackTowardsDestination(this.ship),
                new RepeatorUntilFail(new Sequencer([
                    new GetNextMove(this.ship),
                    new Inverter(new Sequencer([
                        new DoNextMoveIfTileEmpty(this.ship)
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

module.exports = MoveToDesignatedArea;