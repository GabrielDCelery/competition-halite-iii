'use strict';

const Ship = require('./entities/Ship');
const Dropoff = require('./entities/Dropoff');
const Shipyard = require('./entities/Shipyard');
const Position = require('./map/helpers/Position');
const GlobalAI = require('./ai/GlobalAI');

class Player {
    constructor(playerId, shipyard, halite=0) {
        this.id = playerId;
        this.shipyard = shipyard;
        this.haliteAmount = halite;
        this._ships = new Map();
        this._dropoffs = new Map();
        this.gameMap = null;
        this.ai = null;
        this.commandQueue = [];

        this.setShipyard = this.setShipyard.bind(this);
        this.setAI = this.setAI.bind(this);
        this.getShipyard = this.getShipyard.bind(this);
        this.getAI = this.getAI.bind(this);
        this.getHaliteAmount = this.getHaliteAmount.bind(this);
        this.pushCommandToQueue = this.pushCommandToQueue.bind(this);
    }

    getCommandQueue () {
        return this.commandQueue;
    }

    pushCommandToQueue (_command) {
        this.commandQueue.push(_command);
    }

    resetCommandQueue () {
        this.commandQueue = [];

        return this;
    }

    setShipyard (_shipyardX, _shipyardY) {
        this.shipyard = new Shipyard(this.id, -1, new Position(_shipyardX, _shipyardY));

        return this;
    }

    getShipyard () {
        return this.shipyard;
    }

    getHaliteAmount () {
        return this.haliteAmount;
    }

    initAI () {
        this.ai = new GlobalAI(this);

        return this;
    }

    setAI (_ai) {
        this.ai = _ai;

        return this;
    }

    getAI () {
        return this.ai;
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
     * Update the player object for the current turn using input from
     * the game engine.
     * @private
     */
    async _update(numShips, numDropoffs, halite, _readAndParseLine, _bIsMe) {
        this.haliteAmount = halite;
        const _newShipMap = new Map();

        for (let i = 0; i < numShips; i++) {
            const [ shipId, xPos, yPos, halite ] = await _readAndParseLine();

            let ship = this._ships.get(shipId);

            if (!ship) {
                ship = new Ship(this.id, shipId, new Position(xPos, yPos), halite);

                if (_bIsMe) {
                    ship.setPlayerPublicMethods({
                        getShipyard: this.getShipyard,
                        getAI: this.getAI,
                        pushCommandToQueue: this.pushCommandToQueue
                    }).initAI().initState();
                }
            }

            ship.setPosition(new Position(xPos, yPos)).setHaliteAmountInCargo(halite);

            if (_bIsMe) {
                ship.toggleCommandCreatedForTurn(false);
            }

            _newShipMap.set(shipId, ship);
        }

        if (_bIsMe && this._ships.size !== _newShipMap.size) {
            this._ships.forEach(_ship => {
                const _shipId = _ship.getId();

                if (!_newShipMap.get(_shipId)) {
                    return this.getAI().decreaseNumOfAlliedShipsInArea(_shipId);
                }
            });
        }

        this._ships = _newShipMap;

        this._dropoffs = new Map();
        for (let i = 0; i < numDropoffs; i++) {
            const [ dropoffId, xPos, yPos ] = await _readAndParseLine();
            const dropoff = new Dropoff(this.id, dropoffId, new Position(xPos, yPos));

            this._dropoffs.set(dropoffId, dropoff);
        }
    }
}

module.exports = Player;