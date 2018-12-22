'use strict';

const Direction = require('./Direction');

class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    directionalOffset(direction) {
        return this.add(new Position(direction.dx, direction.dy));
    }

    getSurroundingCardinals() {
        return Direction.getAllCardinals().map(currentDirection => this.directionalOffset(currentDirection));
    }

    add(other) {
        return new Position(this.x + other.x, this.y + other.y);
    }

    sub(other) {
        return new Position(this.x - other.x, this.y - other.y);
    }

    addMut(other) {
        this.x += other.x;
        this.y += other.y;
    }

    subMut(other) {
        this.x -= other.x;
        this.y -= other.y;
    }

    abs() {
        return new Position(Math.abs(this.x), Math.abs(this.y));
    }

    equals(other) {
        return this.x === other.x && this.y === other.y;
    }

    toString() {
        return `${this.constructor.name}(${this.x}, ${this.y})`;
    }
}

module.exports = Position;