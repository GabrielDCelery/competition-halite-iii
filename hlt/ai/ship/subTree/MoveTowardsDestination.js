'use strict';

const Task = require('../interface/Task');
const Selector = require('../composite/Selector');
const GetNextMoveStackTowardsDestination = require('../leaf/action/GetNextMoveStackTowardsDestination');
const StayStillIfCannotMove = require('./StayStillIfCannotMove');
const DoNextMoveIfTileEmpty = require('./DoNextMoveIfTileEmpty');

class MoveTowardsDestination extends Task {
    constructor (_ship) {
        super();
        this._init(_ship);
    }

    _init (_ship) {
        this.behaviour = new Selector([
            new GetNextMoveStackTowardsDestination(this.ship),
            new StayStillIfCannotMove(this.ship),
            new DoNextMoveIfTileEmpty(this.ship)
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