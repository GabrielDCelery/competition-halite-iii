'use strict';

const constants = require('../settings/constants');
const commonTransformations = require('../utils/commonTransformations');

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

    isTileDepleted () {
        return this.playerAI.getGameMap().getMapCellByPosition(this.ship.getPosition()).getHaliteAmount() < 10;
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
        //return _averageHaliteAmountOnTiles * 0.5 <= _haliteOnTile;
        return _averageHaliteAmountOnTiles * 0.5 <= _haliteOnTile || constants.MAX_HALITE / 10 < _haliteOnTile;

    }

    shouldIStayOnTileWhileCollectingHalite () {
        const _haliteOnTile = this.playerAI.getGameMap().getMapCellByPosition(this.ship.getPosition()).getHaliteAmount();
        const _averageHaliteAmountOnTiles = this.ship.getAI().getAverageHaliteAmountOnTileInMyArea();

        return _averageHaliteAmountOnTiles * 0.5 <= _haliteOnTile;
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

    numOfEnemiesNextToPosition (_referencePosition = null) {
        const _position = _referencePosition || this.ship.getPosition();
        const _positionOptions = _position.getSurroundingCardinals().map(this.playerAI.getGameMap().normalize);

        let _numOfEnemies = 0;

        for (let _i = 0, _iMax = _positionOptions.length; _i < _iMax; _i++) {
            const _mapCell = this.playerAI.getGameMap().getMapCellByPosition(_positionOptions[_i]);

            if (_mapCell.isOccupiedByEnemy(this.ship)) {
                _numOfEnemies++;
            }
        }

        return _numOfEnemies;
    }

    isPositionInspired (_referencePosition = null) {
        return this.playerAI.getGameMap().isPositionInspired(this.ship, _referencePosition);
    }

    getMostProfitablePosition () {
        const _profitablePositions = [];
        const _shipPosition = this.ship.getPosition();
        const _haliteOnTile = this.playerAI.getGameMap().getMapCellByPosition(_shipPosition).getHaliteAmount();
        const _haliteInCargo = this.ship.getHaliteInCargo();

        const _currentHalitePerTurn = this.playerAI.getCollectionRate(
            _haliteInCargo, 
            _haliteOnTile, 
            this.isPositionInspired(_shipPosition)
        ).halitePerTurn;

        const _possiblePositions = _shipPosition.getSurroundingCardinals().map(this.playerAI.getGameMap().normalize);

        _possiblePositions.forEach(_possiblePosition => {
            const _mapCell = this.playerAI.getGameMap().getMapCellByPosition(_possiblePosition);

            if (!_mapCell.isEmpty) {
                return;
            }

            const _numOfEnemiesNextToPosition = this.numOfEnemiesNextToPosition(_possiblePosition);

            if (0 < _numOfEnemiesNextToPosition) {
                return;
            }

            const _haliteOnTile = _mapCell.getHaliteAmount();
            
            const _halitePerTurn = this.playerAI.getCollectionRate(
                _haliteInCargo, 
                _haliteOnTile, 
                this.isPositionInspired(_possiblePosition)
            ).halitePerTurn;

            const _bIsMoreProfitable = _currentHalitePerTurn < _halitePerTurn * 0.5;

            if (_bIsMoreProfitable) {
                _profitablePositions.push(_possiblePosition);
            }
        });

        return _profitablePositions.sort(commonTransformations.reverseSortByProperty('halitePerTurn'))[0];
    }
}

module.exports = LocalAI;
