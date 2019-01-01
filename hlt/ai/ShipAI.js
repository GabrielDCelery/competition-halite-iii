'use strict';

const constants = require('../settings/constants');

class LocalAI {
    constructor (_ship) {
        this.ship = _ship;
        this.playerAI = this.ship.getPlayerPublicMethods().getAI();
    }

    getGameState () {
        const _timeProgression = this.playerAI.getTurnNumber() / constants.MAX_TURN;

        if (_timeProgression <= 0.3) {
            return 0;
        }

        if (0.3 < _timeProgression && _timeProgression < 0.8) {
            return 1;
        }

        return 2;
    }

    canMove () {
        const _haliteOnTile = this.playerAI.getGameMap().getMapCellByPosition(this.ship.getPosition()).getHaliteAmount();
        const _haliteInShipCargo = this.ship.getHaliteInCargo();

        return Math.floor(_haliteOnTile / constants.MOVE_COST_RATIO) <= _haliteInShipCargo;
    }

    isCargoFullEnoughForDropoff () {
        return constants.MAX_HALITE * 0.8 < this.ship.getHaliteInCargo();
    }

    requestHaliteRichAreaFromGlobalAI () {
        return this.playerAI.getAreaRecommendationForShip(this.ship);
    }

    whichAreaIAmIn () {
        return this.playerAI.getAreaIdForPosition(this.ship.getPosition());
    }

    amIOnADropoff () {
        const _haliteOnTile = this.playerAI.getGameMap().getMapCellByPosition(this.ship.getPosition()).getHaliteAmount();
        const _haliteInShipCargo = this.ship.getHaliteInCargo();

        return _haliteOnTile === 0 && _haliteInShipCargo === 0;
    }

    getAverageHaliteAmountOnTileInMyArea () {
        return this.playerAI.getHaliteAmountPerCellInArea(this.whichAreaIAmIn());
    }

    shouldIStayOnTileInsteadOfMovingTowardsArea () {
        const _haliteOnTile = this.playerAI.getGameMap().getMapCellByPosition(this.ship.getPosition()).getHaliteAmount();
        const _averageHaliteAmountOnTiles = this.ship.getAI().getAverageHaliteAmountOnTileInMyArea();

        return _averageHaliteAmountOnTiles * 0.5 <= _haliteOnTile || constants.MAX_HALITE / 10 < _haliteOnTile;
    }

    shouldIStayOnTileWhileCollectingHalite () {
        const _haliteOnTile = this.playerAI.getGameMap().getMapCellByPosition(this.ship.getPosition()).getHaliteAmount();
        const _averageHaliteAmountOnTiles = this.ship.getAI().getAverageHaliteAmountOnTileInMyArea();
        //const _modifier = [0.5, 0.5, 0.5][this.getGameState()]

        return _averageHaliteAmountOnTiles * 0.5 <= _haliteOnTile /*|| constants.MAX_HALITE / 10 < _haliteOnTile*/;
    }

    shouldIStayOnTileWhileMovingToDropoff () {
        const _haliteOnTile = this.playerAI.getGameMap().getMapCellByPosition(this.ship.getPosition()).getHaliteAmount();
        const _haliteInShipCargo = this.ship.getHaliteInCargo();

        return _haliteInShipCargo < 950 && _haliteInShipCargo * 0.3 < _haliteOnTile;
    }

    shouldIRushHome () {
        const _turnsRemaining = constants.MAX_TURNS - this.playerAI.getTurnNumber();

        if (_turnsRemaining > 80) {
            return false;
        }

        const _turnsToGetHome = this.playerAI.getGameMap().calculateManhattanDistance(
            this.ship.getPosition(), 
            this.playerAI.getClosestDropoff(this.ship)
        );

        return _turnsRemaining - 10 <= _turnsToGetHome;
    }
}

module.exports = LocalAI;
