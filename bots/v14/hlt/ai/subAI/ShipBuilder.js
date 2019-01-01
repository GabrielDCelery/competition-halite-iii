'use strict';

const constants = require('../../settings/constants');

class ShipBuilder {
    constructor (_player, _gameMap, _gameArea) {
        this.player = _player;
        this.gameMap = _gameMap;
        this.gameArea = _gameArea;
        this.active = true;
    }

    isActive() {
        return this.active === true;
    }

    toggleActive (_bActive) {
        this.active = _bActive;

        return this;
    }

    shouldBuild (_turnNumber) {
        const _bShouldBuild = _turnNumber < 0.6 * constants.MAX_TURNS && 
            0.6 < this.gameArea.calculateRemainingHalite() / this.gameArea.getTotalHaliteAtBeginningOfGame() &&
            constants.SHIP_COST <= this.player.getHaliteAmount() &&
            !this.gameMap.getMapCellByPosition(this.player.getShipyard().getPosition()).isOccupied;

        return _bShouldBuild;
    }

    hasEnoughInReserves (_reserveAmount) {
        return constants.SHIP_COST <= this.player.getHaliteAmount() - _reserveAmount;
    }
}

module.exports = ShipBuilder;