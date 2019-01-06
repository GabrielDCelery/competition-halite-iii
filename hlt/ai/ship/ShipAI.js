'use strict';

const Selector = require('./composite/Selector');
const Sequencer = require('./composite/Sequencer');
const Inverter = require('./composite/Inverter');
const StayStillIfDoesNotHaveEnoughHaliteToMove = require('./subTree/StayStillIfDoesNotHaveEnoughHaliteToMove');
const AmIAssignedToAnArea = require('./leaf/test/AmIAssignedToAnArea');

const AmIOnADropoff = require('./leaf/test/AmIOnADropoff');
const GetDesignatedArea = require('./leaf/action/GetDesignatedArea');

const RepeatorUntilFail = require('./composite/RepeatorUntilFail');
const GetNextMoveStackTowardsDestination = require('./leaf/action/GetNextMoveStackTowardsDestination');
const GetNextMove = require('./leaf/action/GetNextMove');
const IsNextMoveBlocked = require('./leaf/test/IsNextMoveBlocked');
const DoNextMove = require('./leaf/action/DoNextMove');
const DoNextMoveIfTileEmpty = require('./subTree/DoNextMoveIfTileEmpty');
const AmIAtMyDestination = require('./leaf/test/AmIAtMyDestination');

class ShipAI {
    constructor (_ship) {
        this.ship = _ship;
        this.behaviour = new Selector([
            new Sequencer([
                new Selector([
                    new AmIAssignedToAnArea(this.ship),
                    new Inverter(new AmIOnADropoff(this.ship)),
                    new GetDesignatedArea(this.ship)
                ]),
                new Selector([
                    new StayStillIfDoesNotHaveEnoughHaliteToMove(this.ship),
                    new Sequencer([
                        new GetNextMoveStackTowardsDestination(this.ship),
                        new RepeatorUntilFail(new Sequencer([
                            new GetNextMove(this.ship),
                            new Inverter(new Sequencer([
                                new DoNextMoveIfTileEmpty(this.ship)
                            ]))
                        ]))
                    ])
                ])
            ])
        ])
    }

    createCommandForTurn () {
        this.behaviour.process();
    }
}

module.exports = ShipAI;