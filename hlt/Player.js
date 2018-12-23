'use strict';

const Ship = require('./entities/Ship');
const Dropoff = require('./entities/Dropoff');
const Shipyard = require('./entities/Shipyard');
const Position = require('./map/helpers/Position');

class Player {
    constructor(playerId, shipyard, halite=0) {
        this.id = playerId;
        this.shipyard = shipyard;
        this.haliteAmount = halite;
        this._ships = new Map();
        this._dropoffs = new Map();
    }

    /** Get a single ship by its ID. */
    getShip(shipId) {
        return this._ships.get(shipId);
    }

    /** Get a list of the player's ships. */
    getShips() {
        const result = [];
        for (const ship of this._ships.values()) {
            result.push(ship);
        }
        return result;
    }

    /** Get a single dropoff by its ID. */
    getDropoff(dropoffId) {
        return this._dropoffs.get(dropoffId);
    }

    /** Get a list of the player's dropoffs. */
    getDropoffs() {
        const result = [];
        for (const dropoff of this._dropoffs.values()) {
            result.push(dropoff);
        }
        return result;
    }

    /** Check whether a ship with a given ID exists. */
    hasShip(shipId) {
        return this._ships.has(shipId);
    }

    /**
     * Create a player object using input from the game engine.
     * @private
     */

    static async _createPlayer (_readAndParseLine) {
        const [ _playerId, _shipyardX, _shipyardY ] = await _readAndParseLine();

        return new Player(_playerId, new Shipyard(_playerId, -1, new Position(_shipyardX, _shipyardY)));
    }

    /**
     * Update the player object for the current turn using input from
     * the game engine.
     * @private
     */
    async _update(numShips, numDropoffs, halite, getLine) {
        this.haliteAmount = halite;
        this._ships = new Map();
        for (let i = 0; i < numShips; i++) {
            const [ shipId, ship ] = await Ship._generate(this.id, getLine);
            this._ships.set(shipId, ship);
        }
        this._dropoffs = new Map();
        for (let i = 0; i < numDropoffs; i++) {
            const [ dropoffId, dropoff ] = await Dropoff._generate(this.id, getLine);
            this._dropoffs.set(dropoffId, dropoff);
        }
    }
}

module.exports = Player;