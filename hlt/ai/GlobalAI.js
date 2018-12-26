'use strict';

const AREA_SIZE = 4;

class GlobalAI {
    constructor() {
        this.setGameMap = this.setGameMap.bind(this);
        this.getGameMap = this.getGameMap.bind(this);
        this.areaGrid = null;
        this.numOfAreas = null;
        this.mapCellsToAreasMap = {};
        this.state = {
            haliteAmounts: null,
            distances: null,
            numOfEnemyShips: null,
            numOfAlliedShipsSentToHarvest: null
        }
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

        const _areasPositions = [...new Array(this.numOfAreas)].map(() => { return []})

        for (let _y = 0, _yMax = _height; _y < _yMax; _y++) {
            for (let _x = 0, _xMax = _width; _x < _xMax; _x++) {
                const _areaId = Math.floor(_x / AREA_SIZE) + Math.floor(_y / AREA_SIZE) * _numOfAreasInRow;

                this.mapCellsToAreasMap[_y][_x] = _areaId;

                const _mapCell = this.gameMap.getMapCellByIndex(_x, _y);

                this.state.haliteAmounts[_areaId] += _mapCell.getHaliteAmount();

                _areasPositions[_areaId].push(_mapCell.getPosition());
            }
        }

        this.state.distances = _areasPositions.map(_areaPositions => {
            const _areaCenterPosition = this.gameMap.calculateCenterPosition(_areaPositions);

            return this.gameMap.calculateManhattanDistance(_areaCenterPosition, this.shipyardPosition);
        });
    }

    init () {
        const _height = this.gameMap.getMapHeight();
        const _width = this.gameMap.getMapWidth();

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
