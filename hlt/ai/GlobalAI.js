'use strict';

const constants = require('../settings/constants');
const commonTransformations = require('../utils/commonTransformations');

const TURNS_TO_GET_HOME_WEIGHT = 1.2;

class GlobalAI {
    constructor(_player) {
        this.player = _player;
        this.turnNumber = 0;
        this.totalHaliteAtBeginningOfGame = 0;
        this.maxTurnsToGetHome = null;
        this.shipsAreCalledHome = false;
        this.bCreateDropoff = false;
        this.dropoffShipAssigned = false;
        this.justCreatedDropoff = false;

        this.getGameMap = this.getGameMap.bind(this);
        this.setGameMap = this.setGameMap.bind(this);
        this.setGameArea = this.setGameArea.bind(this);
        this.setTurnNumber = this.setTurnNumber.bind(this);
    }

    getGameMap (_gameMap) {
        return this.gameMap;
    }

    setGameMap (_gameMap) {
        this.gameMap = _gameMap;

        return this;
    }

    setGameArea (_gameArea) {
        this.gameArea = _gameArea;

        return this;
    }

    setTurnNumber (_turnNumber) {
        this.turnNumber = _turnNumber;

        return this;
    }

    getClosestDropoff (_ship) {
        const _dropoffs = this.player.getDropoffs();

        if (_dropoffs.length === 0) {
            return this.player.getShipyard().getPosition();
        }

        let _position = this.player.getShipyard().getPosition();
        let _distance = this.gameMap.calculateManhattanDistance(_ship.getPosition(), this.player.getShipyard().getPosition());

        _dropoffs.forEach(_dropoff => {
            const _dropoffDistance = this.gameMap.calculateManhattanDistance(_ship.getPosition(), _dropoff.getPosition());

            if (_dropoffDistance <= _distance) {
                _distance = _dropoffDistance;
                _position = _dropoff.getPosition()
            }

        });

        return _position;
    }

    init () {
        const _height = this.gameMap.getMapHeight();
        const _width = this.gameMap.getMapWidth();

        this.maxTurnsToGetHome = ((_height / 2) + (_width / 2)) * TURNS_TO_GET_HOME_WEIGHT;

        return this;
    }

    getAreaIdForPosition (_position) {
        return this.gameArea.getAreaIdForPosition(_position);
    }

    getCenterPositionsForAreaId (_areaId) {
        return this.gameArea.getCenterPositionsForAreaId (_areaId);
    }

    decreaseNumOfAlliedShipsInArea (_shipId) {
        this.gameArea.decreaseNumOfAlliedShipsInArea(_shipId);
    }

    _calculateRecommendationValueForArea (_areaId, _normalizedWeightedDistance) {
        const _areaData = this.gameArea.getAreaData(_areaId);

        const _totalHarvestable = 
            _areaData.halite - 
            _areaData.numOfEnemyShips * 500 -
            _areaData.numOfAlliedShipsSentToHarvest * 800;
       
        return parseInt(_totalHarvestable * _normalizedWeightedDistance, 10);
    }

    _getClosestShipToPosition (_position) {
        let _distance = Infinity;
        let _closestShip = null;

        this.player.getShips().forEach(_ship => {
            const _shipDistance = this.gameMap.calculateManhattanDistance(_ship.getPosition(), _position);

            if (_shipDistance < _distance) {
                _distance = _shipDistance;
                _closestShip = _ship;
            }
        });

        return _closestShip.getId();
    }

    getAreaRecommendationForShip (_ship) {
        const _normalizedWeightedDistances = this.gameArea.calculateNormalizedWeightedDistancesToAreas(_ship.getPosition());

        let _highestRecommendationValue = this._calculateRecommendationValueForArea(0, _normalizedWeightedDistances[0]);
        let _recommendedAreaId = 0;

        for (let _i = 1, _iMax = this.gameArea.getNumOfAreas(); _i < _iMax; _i++) {
            const _recommendationValue = this._calculateRecommendationValueForArea(_i, _normalizedWeightedDistances[_i]);

            if (_recommendationValue > _highestRecommendationValue) {
                _highestRecommendationValue = _recommendationValue;
                _recommendedAreaId = _i;
            }
        }

        this.gameArea.increaseNumOfAlliedShipsInArea(_ship.getId(), _recommendedAreaId);

        return _recommendedAreaId;
    }
    
    getHaliteAmountPerCellInArea (_areaId) {
        return this.gameArea.getHaliteAmountPerCellInArea(_areaId);
    }

    checkIfShipsAreCalledHome (_position) {
        if (this.shipsAreCalledHome) {
            return true;
        }

        const _turnsRemaining = constants.MAX_TURNS - this.turnNumber;

        if (this.maxTurnsToGetHome < _turnsRemaining) {
            return false;
        }

        if (_turnsRemaining < this.gameMap.calculateManhattanDistance(this.player.getShipyard().getPosition(), _position) * TURNS_TO_GET_HOME_WEIGHT) {
            this.shipsAreCalledHome = true;
            
            return true;
        }

        return false;
    }

    _calculateDropoffLocation (_position, _minDistance, _maxDistance) {
        const _distances = this.gameArea.calculateDistancesToAreas(_position);

        const _choices = [];

        _distances.forEach((_distance, _areaId) => {
            if (_distance < _minDistance || _maxDistance < _distance) {
                return;
            }

            _choices.push({
                areaId: _areaId,
                halite: this.gameArea.calculateSumsForAreaAndItsSurroundings(_areaId).halite,
                distance: _distance,
                position: this.gameArea.getCenterPositionsForAreaId(_areaId)[0]
            });
        });

        const _originAreaId = this.gameArea.getAreaIdForPosition(_position);

        return {
            origin: {
                areaId: _originAreaId,
                halite: this.gameArea.calculateSumsForAreaAndItsSurroundings(_originAreaId).halite
            },
            possibleAreas: _choices.sort(commonTransformations.reverseSortByProperty('halite'))
        };
    }

    createCommandForTurn () {
        if (this.justCreatedDropoff) {
            this.justCreatedDropoff = false;

            return null;
        }

        if (!this.bCreateDropoff && this.player.getShips().length === 12 && this.player.getDropoffs().length === 0) {
            this.bCreateDropoff = true;

            return null;
        }

        if (this.bCreateDropoff && !this.dropoffShipAssigned && 4000 <= this.player.getHaliteAmount()) {
            const _dropoffLocations = this._calculateDropoffLocation(this.player.getShipyard().getPosition(), 14, 18);
            const _dropoffPosition = _dropoffLocations.possibleAreas[0].position;

            const _shipId = this._getClosestShipToPosition(_dropoffPosition);

            this.player.getShip(_shipId).setState('MoveToLocationAndConvertToDropoff', _dropoffPosition);
            this.dropoffShipAssigned = true;
        }

        if (
            this.bCreateDropoff === false &&
            this.justCreatedDropoff === false &&
            this.turnNumber < 0.6 * constants.MAX_TURNS && 
            0.6 < this.gameArea.calculateRemainingHalite() / this.gameArea.getTotalHaliteAtBeginningOfGame() &&
            this.player.getHaliteAmount() >= constants.SHIP_COST &&
            !this.gameMap.getMapCellByPosition(this.player.getShipyard().getPosition()).isOccupied
        ) {
            return this.player.getShipyard().spawn();
        }
    }
}

module.exports = GlobalAI;
