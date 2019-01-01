'use strict';

const constants = require('../../settings/constants');
const commonTransformations = require('../../utils/commonTransformations');

const DROPOFF_SHIP_THRESHOLD_MAP = {
    '1': {
        '32': 16,
        '40': 17,
        '48': 18,
        '56': 19,
        '64': 20,
    },
    '3': {
        '32': 12,
        '40': 13,
        '48': 14,
        '56': 15,
        '64': 16,
    } 
}

const DROPOFF_DEFAULT_DISTANCE_MAP = {
    '1': {
        '32': 16,
        '40': 17,
        '48': 18,
        '56': 19,
        '64': 20,
    },
    '3': {
        '32': 16,
        '40': 16,
        '48': 16,
        '56': 16,
        '64': 16,
    }
}

class DropoffBuilder {
    constructor (_player, _gameMap, _gameArea) {
        this.player = _player;
        this.gameMap = _gameMap;
        this.gameArea = _gameArea;
        this.active = false;
        this.numOfDropoffsNeeded = 0;
        this.noMoreDropoffsNeeded = false;
        this.dropoffBuildInProgress = false;
        this.dropoffShipThreshold = DROPOFF_SHIP_THRESHOLD_MAP[this.player.getEnemyPlayers().length][this.gameMap.getMapHeight()]
        this.dropoffDefaultDistance = DROPOFF_DEFAULT_DISTANCE_MAP[this.player.getEnemyPlayers().length][this.gameMap.getMapHeight()];
    }

    _getDropoffPositionsForPlayer (_player) {
        const _dropoffPositions = _player.getDropoffs().map(_dropoff => {
            return _dropoff.getPosition();
        });

        _dropoffPositions.push(_player.getShipyard().getPosition());

        return _dropoffPositions;
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

    _calculateDropoffDistanceRange () {
        return {
            min: this.dropoffDefaultDistance * 0.875,
            max: this.dropoffDefaultDistance / 0.875
        };
    }

    _calculateDropoffLocation () {
        const _dropoffDistanceRange = this._calculateDropoffDistanceRange();
        const _choicesForEachSource = [];

        const _myDropoffPositions = this._getDropoffPositionsForPlayer(this.player);
        
        const _enemies = this.player.getEnemyPlayers();

        const _enemiesDropoffPositions = _enemies.map(_enemy => {
            return this._getDropoffPositionsForPlayer(_enemy);
        })

        _myDropoffPositions.map(_sourcePosition => {
            const _sourceAreaId = this.gameArea.getAreaIdForPosition(_sourcePosition);
            const _distances = this.gameArea.calculateDistancesToAreas(_sourcePosition);
            const _sourceRegion = this.gameArea.calculateSumsForAreaAndItsSurroundings(_sourceAreaId);

            const _choices = [];

            _distances.forEach((_distance, _areaId) => {
                if (_distance < _dropoffDistanceRange.min || _dropoffDistanceRange.max < _distance) {
                    return;
                }

                const _areaPosition = this.gameArea.getCenterPositionsForAreaId(_areaId)[0];

                for (let _i = 0, _iMax = _myDropoffPositions.length; _i < _iMax; _i++) {
                    if (this.gameMap.calculateManhattanDistance(_areaPosition, _myDropoffPositions[_i]) <= (this.dropoffDefaultDistance * 0.75)) {
                        
                        return;
                    }
                }

                for (let _i = 0, _iMax = _enemiesDropoffPositions.length; _i < _iMax; _i++) {
                    const _enemyDropoffPositions = _enemiesDropoffPositions[_i];

                    for (let _j = 0, _jMax = _enemyDropoffPositions.length; _j < _jMax; _j++) {
                        if (this.gameMap.calculateManhattanDistance(_areaPosition, _enemyDropoffPositions[_j]) <= (this.dropoffDefaultDistance * 1.5)) {
                            return;
                        }
                    }
                }

                const _targetRegion = this.gameArea.calculateSumsForAreaAndItsSurroundings(_areaId);

                const _projectedHaliteInRegion = _targetRegion.halite - _targetRegion.numOfEnemyShips * 1000;

                if (_projectedHaliteInRegion < _sourceRegion.halite * 0.8) {
                    return;
                }

                _choices.push({
                    areaId: _areaId,
                    halite: _targetRegion.halite,
                    distance: _distance,
                    position: _areaPosition
                });
            });

            if (_choices.length === 0) {
                return null;
            }

            _choicesForEachSource.push(_choices.sort(commonTransformations.reverseSortByProperty('halite'))[0]);
        });

        return _choicesForEachSource.sort(commonTransformations.reverseSortByProperty('halite'))[0];
    }

    assignShipToBuildDropoff () {
        const _dropoffLocation = this._calculateDropoffLocation();
        const _shipId = this._getClosestShipToPosition(_dropoffLocation.position);

        this.player.getShip(_shipId).setState('MoveToLocationAndConvertToDropoff', _dropoffLocation.position);
        this.dropoffBuildInProgress = true;
    }

    shouldBuildDropoff (_turnNumber) {
        if (
            _turnNumber < 0.5 * constants.MAX_TURNS || 
            this.noMoreDropoffsNeeded || 
            this.dropoffBuildInProgress ||
            this.gameArea.calculateRemainingHalite() / this.gameArea.getTotalHaliteAtBeginningOfGame() < 0.5
        ) {
            return false;
        }

        this.numOfDropoffsNeeded = Math.floor(this.player.getShips().length/ this.dropoffShipThreshold);
        
        const _bShouldBuild = this.player.getDropoffs().length < this.numOfDropoffsNeeded;

        if (!_bShouldBuild) {
            return false;
        }
        
        const _dropoffLocation = this._calculateDropoffLocation();

        if (!_dropoffLocation) {
            this.noMoreDropoffsNeeded = true;

            return false;
        }

        return true;
    }

    canBuildDropoff () {
        return constants.DROPOFF_COST <= this.player.getHaliteAmount();
    }

    isDropoffBuildInProgress () {
        return this.dropoffBuildInProgress;
    }

    didFinishBuildingDropoff () {
        if (this.dropoffBuildInProgress && this.numOfDropoffsNeeded <= this.player.getDropoffs().length) {
            this.dropoffBuildInProgress = false;

            return true;
        }

        return false;
    }
}

module.exports = DropoffBuilder;