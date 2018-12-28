'use strict';

const constants = require('../settings/constants');
const AREA_SIZE = 4;

const TURNS_TO_GET_HOME_WEIGHT = 1.2;

class GlobalAI {
    constructor() {
        this.turnNumber = 0;
        this.maxTurnsToGetHome = null;
        this.shipsAreCalledHome = false;
        this.areaGrid = null;
        this.numOfAreas = null;
        this.mapCellsToAreasMap = {};
        this.state = {
            haliteAmounts: null,
            distances: null,
            centerPositions: null,
            numOfEnemyShips: null,
            numOfAlliedShipsSentToHarvest: null
        };
        this.alliedShipsAtAreasMap = {};
        this.setGameMap = this.setGameMap.bind(this);
        this.getGameMap = this.getGameMap.bind(this);
        this._calculateRecommendationValueForArea = this._calculateRecommendationValueForArea.bind(this);
    }

    getGameMap (_gameMap) {
        return this.gameMap;
    }

    setGameMap (_gameMap) {
        this.gameMap = _gameMap;

        return this;
    }

    setShipyardPosition (_shipyardPosition) {
        this.shipyardPosition = _shipyardPosition;

        return this;
    }

    setTurnNumber (_turnNumber) {
        this.turnNumber = _turnNumber;

        return this;
    }

    getShipyardPosition () {
        return this.shipyardPosition;
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

        this.state.haliteAmounts = new Array(this.numOfAreas).fill(0);
        this.state.numOfEnemyShips = new Array(this.numOfAreas).fill(0);
        this.state.numOfAlliedShipsSentToHarvest = new Array(this.numOfAreas).fill(0);
        this.state.distances = new Array(this.numOfAreas).fill(null);
        this.state.centerPositions = [...new Array(this.numOfAreas)].map(() => { return []});

        const _areasPositions = [...new Array(this.numOfAreas)].map(() => { return []});

        const _centerOffset1 = (AREA_SIZE - 1) / 2 + 0.5;
        const _centerOffset2 = (AREA_SIZE - 1) / 2 - 0.5;

        for (let _y = 0, _yMax = _height; _y < _yMax; _y++) {
            for (let _x = 0, _xMax = _width; _x < _xMax; _x++) {
                const _areaId = Math.floor(_x / AREA_SIZE) + Math.floor(_y / AREA_SIZE) * _numOfAreasInRow;

                this.mapCellsToAreasMap[_y][_x] = _areaId;

                const _mapCell = this.gameMap.getMapCellByIndex(_x, _y);

                this.state.haliteAmounts[_areaId] += _mapCell.getHaliteAmount();

                _areasPositions[_areaId].push(_mapCell.getPosition());

                const _remainderX = _x % AREA_SIZE;
                const _remainderY = _y % AREA_SIZE;

                if (
                    (_remainderX === _centerOffset1 && _remainderY === _centerOffset1) || 
                    (_remainderX === _centerOffset2 && _remainderY === _centerOffset2)
                ) {
                    this.state.centerPositions[_areaId].push(_mapCell.getPosition());
                }
            }
        }

        const _distances = this.state.centerPositions.map(_centerPositions => {
            const _distance1 = this.gameMap.calculateManhattanDistance(_centerPositions[0], this.shipyardPosition);
            const _distance2 = this.gameMap.calculateManhattanDistance(_centerPositions[1], this.shipyardPosition);

            return (_distance1 + _distance2) / 2;
        });

        this.state.distances = GlobalAI.normalizeDataArray(_distances).map(_distance => { return (1 - _distance) * (1 - _distance) * (1 - _distance)});
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

        this.state.haliteAmounts[_areaId] = this.state.haliteAmounts[_areaId] - _diff;
    }

    increaseEnemyNumberOfShipsInArea (_position) {
        const _areaId = this.mapCellsToAreasMap[_position.y][_position.x];

        this.state.numOfEnemyShips[_areaId]++;
    }

    resetEnemyShipDistribution () {
        this.state.numOfEnemyShips = new Array(this.numOfAreas).fill(0);
    }

    getAreaIdForPosition (_position) {
        return this.mapCellsToAreasMap[_position.y][_position.x];
    }

    getCenterPositionsForAreaId (_areaId) {
        return this.state.centerPositions[_areaId];
    }

    _calculateRecommendationValueForArea (_areaId) {
        const _totalHarvestable =  this.state.haliteAmounts[_areaId] - this.state.numOfEnemyShips[_areaId] * 500 - this.state.numOfAlliedShipsSentToHarvest[_areaId] * 800;
       
        return parseInt(_totalHarvestable * this.state.distances[_areaId], 10);
    }

    increaseNumOfAlliedShipsInArea (_shipId, _areaId) {
        this.alliedShipsAtAreasMap[_shipId] = _areaId;
        this.state.numOfAlliedShipsSentToHarvest[_areaId]++;
    }

    decreaseNumOfAlliedShipsInArea (_shipId) {
        const _areaId = this.alliedShipsAtAreasMap[_shipId];

        if (_areaId) {
            this.alliedShipsAtAreasMap[_shipId] = null;
            this.state.numOfAlliedShipsSentToHarvest[_areaId]--;
        }
    }

    getAreaRecommendationForShip (_ship) {
        let _highestRecommendationValue = this._calculateRecommendationValueForArea(0);
        let _recommendedAreaId = 0;

        for (let _i = 1, _iMax = this.numOfAreas; _i < _iMax; _i++) {
            const _recommendationValue = this._calculateRecommendationValueForArea(_i);

            if (_recommendationValue > _highestRecommendationValue) {
                _highestRecommendationValue = _recommendationValue;
                _recommendedAreaId = _i;
            }
        }

        this.increaseNumOfAlliedShipsInArea(_ship.getId(), _recommendedAreaId);

        return _recommendedAreaId;
    }
    
    getHaliteAmountPerCellInArea (_areaId) {
        return this.state.haliteAmounts[_areaId] / (AREA_SIZE * AREA_SIZE);
    }

    checkIfShipsAreCalledHome (_position) {
        if (this.shipsAreCalledHome) {
            return true;
        }

        const _turnsRemaining = constants.MAX_TURNS - this.turnNumber;

        if (this.maxTurnsToGetHome < _turnsRemaining) {
            return false;
        }

        if (_turnsRemaining < this.gameMap.calculateManhattanDistance(this.shipyardPosition, _position) * TURNS_TO_GET_HOME_WEIGHT) {
            this.shipsAreCalledHome = true;
            
            return true;
        }

        return false;
    }

    static normalizeDataArray (_values) {
        const _minValue = Math.min(..._values);
        const _maxValue = Math.max(..._values);

        const _diff = _maxValue - _minValue;

        if (_diff === 0) {
            return _values;
        }

        return _values.map(_value => {
            return parseFloat(((_value - _minValue) / _diff).toFixed(2));
        });
    }
}

module.exports = GlobalAI;
