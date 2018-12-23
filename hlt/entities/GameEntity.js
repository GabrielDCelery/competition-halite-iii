'use strict';

class GameEntity {
    constructor(owner, id, position) {
        this.owner = owner;
        this.id = id;
        this.position = position;
        this.playerPublicMethods = null;
    }

    setPlayerPublicMethods (_playerPublicMethods) {
        this.playerPublicMethods = _playerPublicMethods;

        return this;
    }

    getPlayerPublicMethods () {
        return this.playerPublicMethods;
    }

    getOwner () {
        return this.owner;
    }

    getId () {
        return this.id;
    }

    getPosition () {
        return this.position;
    }

    toString() {
        return `${this.constructor.name}(id=${this.id}, ${this.position})`;
    }
}

module.exports = GameEntity;