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
const IsCargoFullEnough = require('./leaf/test/IsCargoFullEnough');
const IsAssignedToUnloadCargo = require('./leaf/test/IsAssignedToUnloadCargo');
const MoveToAssignedDestination = require('./macro/MoveToAssignedDestination');
const UnloadCargoAtClosestDropoff = require('./leaf/action/UnloadCargoAtClosestDropoff');
const AmIAssignedToADestination = require('./leaf/test/AmIAssignedToADestination');

class ShipAI {
    constructor (_ship) {
        this.ship = _ship;

        const moveToAssignedDestination = new MoveToAssignedDestination(this.ship);

        this.behaviour = new Selector([
            new Sequencer([
                new Selector([
                    new AmIAssignedToADestination(this.ship),
                    new Sequencer([
                        new IsCargoFullEnough(this.ship),
                        new UnloadCargoAtClosestDropoff(this.ship),
                    ]),
                    new Sequencer([
                        new AmIOnADropoff(this.ship),
                        new GetDesignatedArea(this.ship)
                    ])
                ]),
                moveToAssignedDestination
            ])
        ]);
    }

    createCommandForTurn () {
        this.behaviour.process();
    }
}

module.exports = ShipAI;