'use strict';

const Selector = require('./composite/Selector');
const Sequencer = require('./composite/Sequencer');
const Inverter = require('./composite/Inverter');

const AmIOnADropoff = require('./leaf/test/AmIOnADropoff');
const GetDesignatedArea = require('./leaf/action/GetDesignatedArea');

const IsCargoFullEnough = require('./leaf/test/IsCargoFullEnough');
const MoveToAssignedDestination = require('./macro/MoveToAssignedDestination');
const GetClosestDropoff = require('./leaf/action/GetClosestDropoff');
const AmIAssignedToAnArea = require('./leaf/test/AmIAssignedToAnArea');
const IsWorthStayingOnTileInsteadOfMoving = require('./leaf/test/IsWorthStayingOnTileInsteadOfMoving');
const StayStill = require('./leaf/action/StayStill');
const AmIAssignedToADropoff = require('./leaf/test/ResetDestinations');

class ShipAI {
    constructor (_ship) {
        this.ship = _ship;

        this.behaviour = new Selector([
            new Sequencer([
                new Selector([
                    new Sequencer([
                        new IsCargoFullEnough(this.ship),
                        new Selector([
                            new AmIAssignedToADropoff(this.ship),
                            new GetClosestDropoff(this.ship)
                        ])
                    ]),
                    new AmIAssignedToAnArea(this.ship),
                    new Sequencer([
                        new AmIOnADropoff(this.ship),
                        new Selector([
                            new AmIAssignedToAnArea(this.ship),
                            new GetDesignatedArea(this.ship)
                        ])
                    ])
                ]),
                new Selector([
                    new Sequencer([
                        new IsWorthStayingOnTileInsteadOfMoving(this.ship),
                        new StayStill(this.ship)
                    ]),
                    new MoveToAssignedDestination(this.ship)
                ])
            ])
        ]);
    }

    createCommandForTurn () {
        this.behaviour.process();
    }
}

module.exports = ShipAI;