'use strict';

class Entity {
    constructor(owner, id, position) {
        this.owner = owner;
        this.id = id;
        this.position = position;
    }

    toString() {
        return `${this.constructor.name}(id=${this.id}, ${this.position})`;
    }
}

module.exports = Entity;