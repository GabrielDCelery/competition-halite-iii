'use strict';

const constants = require('../settings/constants');
const commonTransformations = require('../utils/commonTransformations');

const TURNS_TO_GET_HOME_WEIGHT = 1.2;

const ShipBuilder = require('./subAI/ShipBuilder');
const DropoffBuilder = require('./subAI/DropoffBuilder');

class GlobalAI {
    constructor(_player) {
        this.player = _player;
        this.turnNumber = 0;
        this.totalHaliteAtBeginningOfGame = 0;
        this.maxTurnsToGetHome = null;
        this.shipsAreCalledHome = false;

        this.subAI = {
            shipBuilder: null,
            dropoffBuilder: null
        };

        this.getGameMap = this.getGameMap.bind(this);
        this.setGameMap = this.setGameMap.bind(this);
        this.setGameArea = this.setGameArea.bind(this);
        this.setTurnNumber = this.setTurnNumber.bind(this);
    }

    init () {
        const _height = this.gameMap.getMapHeight();
        const _width = this.gameMap.getMapWidth();

        this.maxTurnsToGetHome = ((_height / 2) + (_width / 2)) * TURNS_TO_GET_HOME_WEIGHT;

        this.subAI.shipBuilder = new ShipBuilder(this.player, this.gameMap, this.gameArea);
        this.subAI.dropoffBuilder = new DropoffBuilder(this.player, this.gameMap, this.gameArea);

        return this;
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

    getTurnNumber () {
        return this.turnNumber;
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
        const _distances = this.gameArea.calculateDistancesToAreas(_ship.getPosition());

        const _normalizedWeightedDistances = commonTransformations.normalizeDataArray(_distances).map(_distance => { 
            return (1 - _distance) * (1 - _distance) * (1 - _distance);
        });

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

    sendBatchOfShipsToLatestDropoff () {
        const _dropoffs = this.player.getDropoffs();
        const _latestDropoff = _dropoffs.sort(commonTransformations.reverseSortByProperty('id'))[0];

        const _areaId = this.gameArea.getAreaIdForPosition(_latestDropoff.getPosition());

        const _ships = this.player.getShips();
        const _numOfShipsToSend = Math.round(_ships.length / (_dropoffs.length + 1));

        const _chosenShips = this.player.getShips().map(_ship => {
            return {
                id: _ship.getId(),
                distance: this.gameArea.calculateDistanceBetweenAreaAndPosition(_areaId, _ship.getPosition())
            };
        }).sort(commonTransformations.sortByProperty('distance')).slice(0, _numOfShipsToSend);

        const _neighbouringAreas = this.gameArea.getAreaData(_areaId).neighbouringAreaIds;

        _chosenShips.forEach(_chosenShip => {
            const _areaToGoTo = _neighbouringAreas[Math.floor(Math.random()*_neighbouringAreas.length)];
            
            this.gameArea.decreaseNumOfAlliedShipsInArea(_chosenShip.id);
            this.gameArea.increaseNumOfAlliedShipsInArea(_chosenShip.id, _areaToGoTo);

            this.player.getShip(_chosenShip.id).setState('MoveToArea', { areaId: _areaToGoTo });
        });
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

    createCommandForTurn (_turnNumber) {
        if(this.subAI.dropoffBuilder.didFinishBuildingDropoff()) {
            this.sendBatchOfShipsToLatestDropoff();
        }

        if (this.subAI.dropoffBuilder.shouldBuildDropoff(_turnNumber)) {
            if (this.subAI.dropoffBuilder.canBuildDropoff() && !this.subAI.dropoffBuilder.isDropoffBuildInProgress()) {
                this.subAI.dropoffBuilder.assignShipToBuildDropoff();

                return null;
            }

            return null;
        }

        if (
            this.subAI.shipBuilder.shouldBuild(this.turnNumber) &&
            this.subAI.shipBuilder.hasEnoughInReserves(this.subAI.dropoffBuilder.isDropoffBuildInProgress() ? 4000 : 0)
        ) {
            return this.player.getShipyard().spawn();
        }
    }
}

module.exports = GlobalAI;
