'use strict';

const AREA_SIZE = 3;
const SURROUNDING_CELLS = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1]
];

class GlobalAI {
    constructor() {
        this.setGameMap = this.setGameMap.bind(this);
        this.getGameMap = this.getGameMap.bind(this);
        this.areaGrid = null;
        this.shipyardX = null;
        this.syhipyardY = null;
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

    _initAreaGrid (_size) {
        const _table = new Array(_size);
        const _offset = (_size - 1) / 2;

        let _offsetY = _offset * (-1) * AREA_SIZE;

        for (let _y = 0, _yMax = _size; _y < _yMax; _y++) {
            _table[_y] = new Array(_size);

            let _offsetX = _offset * (-1) * AREA_SIZE;

            for (let _x = 0, _xMax = _size; _x < _xMax; _x++) {

                const _tileCenterPosition = this.gameMap.normalize(this.shipyardPosition.add({
                    x: _offsetX,
                    y: _offsetY
                }));

                _table[_y][_x] = {
                    id: null,
                    centerPosition: _tileCenterPosition,
                    pointers: [],
                    data: null
                };

                _offsetX += AREA_SIZE;
            }

            _offsetY += AREA_SIZE;
        }

        this.areaGrid = _table;
    }

    _createPointersForSurroundingTilesAtDistance (_centerX, _centerY, _distanceToEdge, _distance) {
        const _overflow = _distance - _distanceToEdge > 0 ? _distance - _distanceToEdge : 0;

        if (!_overflow) {
            let _offsetY = _distance * (-1);
            let _offsetX = 0;

            for (let _i = 0, _iMax = _distance; _i < _iMax; _i++) {
                this._createPointersToSurroundingTiles(_centerX + _offsetX, _centerY + _offsetY);

                _offsetY++;
                _offsetX++;
            }

            _offsetY = 0;
            _offsetX = _distance;

            for (let _i = 0, _iMax = _distance; _i < _iMax; _i++) {
                this._createPointersToSurroundingTiles(_centerX + _offsetX, _centerY + _offsetY);

                _offsetY++;
                _offsetX--;
            }

            _offsetY = _distance;
            _offsetX = 0;

            for (let _i = 0, _iMax = _distance; _i < _iMax; _i++) {
                this._createPointersToSurroundingTiles(_centerX + _offsetX, _centerY + _offsetY);

                _offsetY--;
                _offsetX--;
            }

            _offsetY = 0;
            _offsetX = _distance * (-1);

            for (let _i = 0, _iMax = _distance; _i < _iMax; _i++) {
                this._createPointersToSurroundingTiles(_centerX + _offsetX, _centerY + _offsetY);

                _offsetY--;
                _offsetX++;
            }

            return;
        }

        const _numOfIterations = (_distanceToEdge * 2) - _distance + 1;

        let _offsetY = _distanceToEdge * (-1);
        let _offsetX = 0 + _overflow;

        for (let _i = 0, _iMax = _numOfIterations; _i < _iMax; _i++) {
            this._createPointersToSurroundingTiles(_centerX + _offsetX, _centerY + _offsetY);

            _offsetY++;
            _offsetX++;
        }

        _offsetY = 0 + _overflow;
        _offsetX = _distanceToEdge;

        for (let _i = 0, _iMax = _numOfIterations; _i < _iMax; _i++) {
            this._createPointersToSurroundingTiles(_centerX + _offsetX, _centerY + _offsetY);

            _offsetY++;
            _offsetX--;
        }

        _offsetY = _distanceToEdge;
        _offsetX = 0 - _overflow;

        for (let _i = 0, _iMax = _numOfIterations; _i < _iMax; _i++) {
            this._createPointersToSurroundingTiles(_centerX + _offsetX, _centerY + _offsetY);

            _offsetY--;
            _offsetX--;
        }

        _offsetY = 0 - _overflow;
        _offsetX = _distanceToEdge * (-1);

        for (let _i = 0, _iMax = _numOfIterations; _i < _iMax; _i++) {
            this._createPointersToSurroundingTiles(_centerX + _offsetX, _centerY + _offsetY);

            _offsetY--;
            _offsetX++;
        }
    }

    _createPointersToSurroundingTiles (_startX, _startY) {
        const _currentGridTile = this.areaGrid[_startY][_startX];

        SURROUNDING_CELLS.forEach(_offset => {
            const _offsettedY = _startY + _offset[0];
            const _offsettedX = _startX + _offset[1];

            if (
                this.areaGrid[_offsettedY] === undefined || 
                this.areaGrid[_offsettedY][_offsettedX] === undefined || 
                this.areaGrid[_offsettedY][_offsettedX].id !== null
            ) {
                return;
            }

            _currentGridTile.pointers.push([_offsettedX, _offsettedY]);
        });

        _currentGridTile.id = this.cellId;
        this.cellId++;
    }

    init () {
        this.cellId = 0;

        const _rows = this.gameMap.getNumberOfRows();
        const _size = Math.floor((Math.floor((_rows - AREA_SIZE) / AREA_SIZE)) / 2) * 2 + 1;
        const _centerPosition = (_size - 1) / 2;

        this._initAreaGrid(_size);
        this._createPointersToSurroundingTiles(_centerPosition, _centerPosition);

        for (let _i = 1, _iMax = _size; _i <= _iMax; _i++) {
            this._createPointersForSurroundingTilesAtDistance(_centerPosition, _centerPosition, _centerPosition, _i);
        }

        console.log(this.shipyardPosition)
        console.log(JSON.stringify(this.areaGrid))

        return this;
    }
}

module.exports = GlobalAI;
