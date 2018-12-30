'use strict';

const constants = require('../settings/constants');
const commonTransformations = require('../utils/commonTransformations');
const AREA_SIZE = 4;

const TURNS_TO_GET_HOME_WEIGHT = 1.2;

class GlobalAI {
    constructor(_player) {
        this.player = _player;
        this.turnNumber = 0;
        this.totalHaliteAtBeginningOfGame = 0;
        this.maxTurnsToGetHome = null;
        this.shipsAreCalledHome = false;
        this.numOfAreas = null;
        this.mapCellsToAreasMap = {};
        this.alliedShipsAtAreasMap = {};
        this.areas = null;
        this.cache = {
            normalizedDistancesFromShipyard: null
        };
        this.bCreateDropoff = false;
        this.dropoffShipAssigned = false;
        this.justCreatedDropoff = false;
        this.setGameMap = this.setGameMap.bind(this);
        this.getGameMap = this.getGameMap.bind(this);
    }

    getGameMap (_gameMap) {
        return this.gameMap;
    }

    setGameMap (_gameMap) {
        this.gameMap = _gameMap;

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

        const _possibleDropoffs = [{
            position: this.player.getShipyard().getPosition(),
            distance: this.gameMap.calculateManhattanDistance(_ship.getPosition(), this.player.getShipyard().getPosition())
        }];

        _dropoffs.forEach(_dropoff => {
            _possibleDropoffs.push({
                position: _dropoff.getPosition(),
                distance: this.gameMap.calculateManhattanDistance(_ship.getPosition(), _dropoff.getPosition())
            });
        });

        return _possibleDropoffs.sort(commonTransformations.sortByProperty('distance'))[0].position;
    }

    _calculateRemainingHalite () {
        let _remainingHalite = 0;

        this.areas.forEach(_area => {
            _remainingHalite += _area.halite;
        });

        return _remainingHalite;
    }

    _initEmptyMapTilesToAreasMap (_width, _height) {
        const _map = new Array(_height);

        for (let _y = 0, _yMax = _height; _y < _yMax; _y++)  {
            _map[_y] = new Array(_width);

            for (let _x = 0, _xMax = _width; _x < _xMax; _x++) {
                _map[_y][_x] = null;
            }
        }

        this.mapCellsToAreasMap = _map;
    }

    _initAreaGrid (_width, _height) {
        const _numOfAreasInRow = _width / AREA_SIZE;
        const _numOfAreasInColumn = _height / AREA_SIZE;

        this.numOfAreas = _numOfAreasInRow * _numOfAreasInColumn;

        this.areas = [...new Array(this.numOfAreas)].map(() => { 
            return {
                halite: 0,
                numOfEnemyShips: 0,
                numOfAlliedShipsSentToHarvest: 0,
                centerPositions: [],
                neighbouringAreaIds: []
            }
        });

        this.cache.normalizedDistancesFromShipyard = new Array(this.numOfAreas).fill(null);

        const _centerOffset1 = (AREA_SIZE - 1) / 2 + 0.5;
        const _centerOffset2 = (AREA_SIZE - 1) / 2 - 0.5;

        for (let _y = 0, _yMax = _height; _y < _yMax; _y++) {
            for (let _x = 0, _xMax = _width; _x < _xMax; _x++) {
                const _areaId = Math.floor(_x / AREA_SIZE) + Math.floor(_y / AREA_SIZE) * _numOfAreasInRow;

                this.mapCellsToAreasMap[_y][_x] = _areaId;

                const _mapCell = this.gameMap.getMapCellByIndex(_x, _y);
                const _haliteOnCell = _mapCell.getHaliteAmount();
                this.totalHaliteAtBeginningOfGame += _haliteOnCell;

                const _remainderX = _x % AREA_SIZE;
                const _remainderY = _y % AREA_SIZE;

                this.areas[_areaId].halite += _haliteOnCell;
                this.areas[_areaId].neighbouringAreaIds = this._getNeighbouringAreaIds(_areaId, _numOfAreasInRow, _numOfAreasInColumn);

                if (
                    (_remainderX === _centerOffset1 && _remainderY === _centerOffset1) || 
                    (_remainderX === _centerOffset2 && _remainderY === _centerOffset2)
                ) {
                    this.areas[_areaId].centerPositions.push(_mapCell.getPosition());
                }
            }
        }

        this.cache.normalizedDistancesFromShipyard = this._calculateNormalizedWeightedDistancesToAreas(this.player.getShipyard().getPosition());
    }

    _calculateDistancesToAreas (_position) {
        return this.areas.map(_area => {
            return this.gameMap.calculateManhattanDistanceToMultiplePositions(_position, _area.centerPositions);
        });
    }

    _calculateNormalizedWeightedDistancesToAreas (_position) {
        const _distances = this._calculateDistancesToAreas(_position);

        return commonTransformations.normalizeDataArray(_distances).map(_distance => { return (1 - _distance) * (1 - _distance) * (1 - _distance)});
    }

    _calculateHaliteForAreaAndItsSurroundings (_areaId) {
        let _totalHalite = 0;

        _totalHalite += this.areas[_areaId].halite;

        const _neightbouringAreaIds = this.areas[_areaId].neighbouringAreaIds;

        for (let _i = 0, _iMax = _neightbouringAreaIds.length; _i < _iMax; _i++) {
            _totalHalite += this.areas[_neightbouringAreaIds[_i]].halite;
        }

        return _totalHalite;
    }

    _getNeighbouringAreaIds (_areaId, _nOfArInRow, _nOfArInCol) {
        return [
            this._getCellIdToLeft(this._getCellIdToTop(_areaId, _nOfArInRow, _nOfArInCol), _nOfArInRow, _nOfArInCol),
            this._getCellIdToTop(_areaId, _nOfArInRow, _nOfArInCol),
            this._getCellIdToRight(this._getCellIdToTop(_areaId, _nOfArInRow, _nOfArInCol), _nOfArInRow, _nOfArInCol),
            this._getCellIdToLeft(_areaId, _nOfArInRow, _nOfArInCol),
            this._getCellIdToRight(_areaId, _nOfArInRow, _nOfArInCol),
            this._getCellIdToLeft(this._getCellIdToBottom(_areaId, _nOfArInRow, _nOfArInCol), _nOfArInRow, _nOfArInCol),
            this._getCellIdToBottom(_areaId, _nOfArInRow, _nOfArInCol),
            this._getCellIdToRight(this._getCellIdToBottom(_areaId, _nOfArInRow, _nOfArInCol), _nOfArInRow, _nOfArInCol)
        ];
    }

    _getCellIdToTop (_areaId, _numOfAreasInRow, _numOfAreasInColumn) {
        return _areaId < _numOfAreasInColumn ? _areaId + _numOfAreasInColumn * (_numOfAreasInRow - 1) : _areaId - _numOfAreasInColumn;
    }

    _getCellIdToLeft (_areaId, _numOfAreasInRow, _numOfAreasInColumn) {
        return _areaId % _numOfAreasInRow === 0 ? _areaId + _numOfAreasInRow - 1 : _areaId - 1;
    }

    _getCellIdToRight (_areaId, _numOfAreasInRow, _numOfAreasInColumn) {
        return (_areaId + 1) % _numOfAreasInRow === 0 ? _areaId - _numOfAreasInRow + 1 : _areaId + 1;
    }

    _getCellIdToBottom (_areaId, _numOfAreasInRow, _numOfAreasInColumn) {
        return _numOfAreasInRow * _numOfAreasInColumn <= _areaId + _numOfAreasInRow ? _areaId % _numOfAreasInRow : _areaId + _numOfAreasInRow;
    }

    init () {
        const _height = this.gameMap.getMapHeight();
        const _width = this.gameMap.getMapWidth();

        this.maxTurnsToGetHome = ((_height / 2) + (_width / 2)) * TURNS_TO_GET_HOME_WEIGHT;

        this._initEmptyMapTilesToAreasMap (_width, _height);
        this._initAreaGrid(_width, _height);

        return this;
    }

    updateHaliteForAreaBeforeMapCellUpdate (_cellX, _cellY, _newValue) {
        const _mapCell = this.gameMap.getMapCellByIndex(_cellX, _cellY);
        const _diff = _mapCell.getHaliteAmount() - _newValue;
        const _areaId = this.mapCellsToAreasMap[_cellY][_cellX];

        this.areas[_areaId].halite = this.areas[_areaId].halite - _diff;
    }

    increaseEnemyNumberOfShipsInArea (_position) {
        const _areaId = this.mapCellsToAreasMap[_position.y][_position.x];

        this.areas[_areaId].numOfEnemyShips++;
    }

    resetEnemyShipDistribution () {
        this.areas.forEach(_area => {
            _area.numOfEnemyShips = 0;
        });
    }

    getAreaIdForPosition (_position) {
        return this.mapCellsToAreasMap[_position.y][_position.x];
    }

    getCenterPositionsForAreaId (_areaId) {
        return this.areas[_areaId].centerPositions;
    }

    increaseNumOfAlliedShipsInArea (_shipId, _areaId) {
        this.alliedShipsAtAreasMap[_shipId] = _areaId;
        this.areas[_areaId].numOfAlliedShipsSentToHarvest++;
    }

    decreaseNumOfAlliedShipsInArea (_shipId) {
        const _areaId = this.alliedShipsAtAreasMap[_shipId];

        if (_areaId) {
            this.alliedShipsAtAreasMap[_shipId] = null;
            this.areas[_areaId].numOfAlliedShipsSentToHarvest--;
        }
    }

    _calculateRecommendationValueForArea (_areaId, _normalizedWeightedDistance) {
        const _totalHarvestable = 
            this.areas[_areaId].halite - 
            this.areas[_areaId].numOfEnemyShips * 500 -
            this.areas[_areaId].numOfAlliedShipsSentToHarvest * 800;
       
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
        const _normalizedDistances = 
            _ship.getPosition().equals(this.player.getShipyard().getPosition()) ? 
            this.cache.normalizedDistancesFromShipyard :
            this._calculateNormalizedWeightedDistancesToAreas(_ship.getPosition());

        let _highestRecommendationValue = this._calculateRecommendationValueForArea(0, _normalizedDistances[0]);
        let _recommendedAreaId = 0;

        for (let _i = 1, _iMax = this.numOfAreas; _i < _iMax; _i++) {
            const _recommendationValue = this._calculateRecommendationValueForArea(_i, _normalizedDistances[_i]);

            if (_recommendationValue > _highestRecommendationValue) {
                _highestRecommendationValue = _recommendationValue;
                _recommendedAreaId = _i;
            }
        }

        this.increaseNumOfAlliedShipsInArea(_ship.getId(), _recommendedAreaId);

        return _recommendedAreaId;
    }
    
    getHaliteAmountPerCellInArea (_areaId) {
        return this.areas[_areaId].halite / (AREA_SIZE * AREA_SIZE);
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
        const _distances = this._calculateDistancesToAreas(_position);

        const _choices = [];

        _distances.forEach((_distance, _areaId) => {
            if (_distance < _minDistance || _maxDistance < _distance) {
                return;
            }

            _choices.push({
                areaId: _areaId,
                halite: this._calculateHaliteForAreaAndItsSurroundings(_areaId),
                distance: _distance,
                position: this.areas[_areaId].centerPositions[0]
            });
        });

        const _originAreaId = this.getAreaIdForPosition(_position);

        return {
            origin: {
                areaId: _originAreaId,
                halite: this._calculateHaliteForAreaAndItsSurroundings(_originAreaId)
            },
            possibleAreas: _choices.sort(commonTransformations.reverseSortByProperty('halite'))
        };
    }

    createCommandForTurn () {
        if (this.justCreatedDropoff) {
            this.justCreatedDropoff = false;

            return null;
        }

        if (!this.bCreateDropoff && this.player.getShips().length === 20 && this.player.getDropoffs().length === 0) {
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
            0.6 < this._calculateRemainingHalite() / this.totalHaliteAtBeginningOfGame &&
            this.player.getHaliteAmount() >= constants.SHIP_COST &&
            !this.gameMap.getMapCellByPosition(this.player.getShipyard().getPosition()).isOccupied
        ) {
            return this.player.getShipyard().spawn();
        }
    }
}

module.exports = GlobalAI;
