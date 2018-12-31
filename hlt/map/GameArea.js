'use strict';

const constants = require('../settings/constants');
const commonTransformations = require('../utils/commonTransformations');
const AREA_SIZE = 4;

class GameArea {
    constructor (_gameMap) {
        this.gameMap = _gameMap;
        this.mapCellsToAreasMap = null;
        this.numOfAreas = null;
        this.areas = null;
        this.alliedShipsAtAreasMap = {};
        this.totalHaliteAtBeginningOfGame = 0;
        this._init();
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

    _initEmptyMapCellsToAreasMap (_width, _height) {
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
    }

    _init () {
        const _height = this.gameMap.getMapHeight();
        const _width = this.gameMap.getMapWidth();

        this._initEmptyMapCellsToAreasMap (_width, _height);
        this._initAreaGrid(_width, _height);

        return this;
    }

    calculateDistancesToAreas (_position) {
        return this.areas.map(_area => {
            return this.gameMap.calculateManhattanDistanceToMultiplePositions(_position, _area.centerPositions);
        });
    }

    calculateNormalizedWeightedDistancesToAreas (_position) {
        const _distances = this.calculateDistancesToAreas(_position);

        return commonTransformations.normalizeDataArray(_distances).map(_distance => { 
            return (1 - _distance) * (1 - _distance) * (1 - _distance);
        });
    }

    calculateRemainingHalite () {
        let _remainingHalite = 0;

        this.areas.forEach(_area => {
            _remainingHalite += _area.halite;
        });

        return _remainingHalite;
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

    getHaliteAmountPerCellInArea (_areaId) {
        return this.areas[_areaId].halite / (AREA_SIZE * AREA_SIZE);
    }

    getAreaData (_areaId) {
        return this.areas[_areaId];
    }

    calculateSumsForAreaAndItsSurroundings (_areaId) {
        let _total = {
            halite: 0,
            numOfEnemyShips: 0,
            numOfAlliedShipsSentToHarvest: 0
        };

        _total.halite += this.areas[_areaId].halite;
        _total.numOfEnemyShips += this.areas[_areaId].numOfEnemyShips;
        _total.numOfAlliedShipsSentToHarvest += this.areas[_areaId].numOfAlliedShipsSentToHarvest;

        const _neightbouringAreaIds = this.areas[_areaId].neighbouringAreaIds;

        for (let _i = 0, _iMax = _neightbouringAreaIds.length; _i < _iMax; _i++) {
            const _neighbouringArea = this.areas[_neightbouringAreaIds[_i]];

            _total.halite += _neighbouringArea.halite;
            _total.numOfEnemyShips += _neighbouringArea.numOfEnemyShips;
            _total.numOfAlliedShipsSentToHarvest += _neighbouringArea.numOfAlliedShipsSentToHarvest;
        }

        return _total;
    }

    getNumOfAreas () {
        return this.numOfAreas;
    }

    getTotalHaliteAtBeginningOfGame () {
        return this.totalHaliteAtBeginningOfGame;
    }
}

module.exports = GameArea;
