'use strict';

/** A cell on the game map. */
class MapCell {
    constructor(position, halite) {
        this.position = position;
        this.haliteAmount = halite;
        this.ship = null;
        this.structure = null;
    }

    getPosition () {
        return this.position;
    }

    getHaliteAmount () {
        return this.haliteAmount;
    }

    getShip() {
        return this.ship || null;
    }

    /**
     * @returns {Boolean} whether this cell has no ships or structures.
     */
    get isEmpty() {
        return !this.isOccupied && !this.hasStructure;
    }

    /**
     * @returns {Boolean} whether this cell has any ships.
     */
    get isOccupied() {
        return this.ship !== null;
    }

    /**
     * @returns {Boolean} whether this cell has any structures.
     */
    get hasStructure() {
        return this.structure !== null;
    }

    /**
     * @returns The type of the structure in this cell, or null.
     */
    get structureType() {
        if (this.hasStructure) {
            return this.structure.constructor;
        }
        return null;
    }

    /**
     * Mark this cell as unsafe (occupied) for navigation.
     *
     * Use in conjunction with {@link GameMap#getSafeMove}.
     *
     * @param {Ship} ship The ship occupying this cell.
     */
    markUnsafe(ship) {
        this.ship = ship;
    }

    markSafe () {
        this.ship = null;
    }

    equals(other) {
        return this.position.equals(other.position);
    }

    toString() {
        return `MapCell(${this.position}, halite=${this.haliteAmount})`;
    }
}

module.exports = MapCell;