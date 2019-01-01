'use strict';

const Ship = require('../entities/Ship');
const Direction = require('./helpers/Direction');
const Position = require('./helpers/Position');
const MapCell = require('./MapCell');

/**
 * The game map.
 *
 * Can be indexed by a position, or by a contained entity.
 * Coordinates start at 0. Coordinates are normalized for you.
 */
class GameMap {
    constructor(cells, width, height) {
        this.width = width;
        this.height = height;
        this._cells = cells;
        this.Direction = Direction;
        this.normalize = this.normalize.bind(this);
        this.getMapCellByIndex = this.getMapCellByIndex.bind(this);
        this.getMapCellByPosition = this.getMapCellByPosition.bind(this);
        this.calculateManhattanDistance = this.calculateManhattanDistance.bind(this);
        this.calculateCenterPosition = this.calculateCenterPosition.bind(this);
    }

    getMapHeight () {
        return this.height;
    }

    getMapWidth () {
        return this.width;
    }

    getMapCellByIndex (_x, _y) {
        return this._cells[_y][_x];
    }

    getMapCellByPosition (_positionObj) {
        const _normalizedPositionObj = this.normalize(_positionObj);

        return this._cells[_normalizedPositionObj.y][_normalizedPositionObj.x];
    }

    calculateManhattanDistance(_sourcePosition, _targetPosition) {
        const _delta = this.normalize(_sourcePosition).sub(this.normalize(_targetPosition)).abs();

        return Math.min(_delta.x, this.width - _delta.x) + Math.min(_delta.y, this.height - _delta.y);
    }

    calculateManhattanDistanceToMultiplePositions (_sourcePosition, _targetPositions) {
        return this.calculateManhattanDistance(_sourcePosition, this.calculateCenterPosition(_targetPositions))
    }

    calculateCenterPosition (_positions) {
        const _numOfPositions = _positions.length;

        let _sumX = 0;
        let _sumY = 0;

        _positions.map(_position => {
            _sumX += _position.x;
            _sumY += _position.y;
        });

        return new Position(_sumX / _numOfPositions, _sumY / _numOfPositions);
    }

    roundPosition (_position) {
        return new Position(Math.round(_position.x), Math.round(_position.y))
    }

    /**
     * Normalized the position within the bounds of the toroidal map.
     * i.e.: Takes a point which may or may not be within width and
     * height bounds, and places it within those bounds considering
     * wraparound.
     * @param {Position} position A position object.
     * @returns A normalized position object fitting within the bounds of the map
    */
    normalize(position) {
        let x = ((position.x % this.width) + this.width) % this.width;
        let y = ((position.y % this.height) + this.height) % this.height;
        return new Position(x, y);
    }

    /**
     * Determine the relative direction of the target compared to the
     * source (i.e. is the target north, south, east, or west of the
     * source). Does not account for wraparound.
     * @param {Position} source The source position
     * @param {Position} target The target position
     * @returns {[Direction | null, Direction | null]} A 2-tuple whose
     * elements are: the relative direction for each of the Y and X
     * coordinates (note the inversion), or null if the coordinates
     * are the same.
     */
    _getTargetDirection(source, target) {
        return [
            target.y > source.y ? Direction.South :
                (target.y < source.y ? Direction.North : null),
            target.x > source.x ? Direction.East :
                (target.x < source.x ? Direction.West : null),
        ];
    }

    /**
     * Return a list of Direction(s) that move closer to the
     * destination, if any.
     *
     * This does not account for collisions. Multiple directions may
     * be returned if movement in both coordinates is viable.
     *
     * @param {Position} source The (normalized) source position
     * @param {Position} destination The (normalized) target position
     * @returns A list of Directions moving towards the target (if
     * any)
     */
    getUnsafeMoves(source, destination) {
        if (!(source instanceof Position && destination instanceof Position)) {
            throw new Error("source and destination must be of type Position");
        }

        source = this.normalize(source);
        destination = this.normalize(destination);

        const possibleMoves = [];
        const distance = destination.sub(source).abs();
        const [ yDir, xDir ] = this._getTargetDirection(source, destination);

        if (distance.x !== 0) {
            possibleMoves.push(distance.x < (this.width / 2) ? xDir : xDir.invert());
        }
        if (distance.y !== 0) {
            possibleMoves.push(distance.y < (this.height / 2) ? yDir : yDir.invert());
        }

        return possibleMoves;
    }

    /**
     * Returns a singular safe move towards the destination.
     * @param {Ship} ship - the ship to move
     * @param {Position} destination - the location to move towards
     * @return {Direction}
     */
    naiveNavigate(ship, destination) {
        // No need to normalize destination since getUnsafeMoves does
        // that
        for (const direction of this.getUnsafeMoves(ship.position, destination)) {
            const targetPos = ship.position.directionalOffset(direction);

            if (!this.getMapCellByPosition(targetPos).isOccupied) {
                this.getMapCellByPosition(targetPos).markUnsafe(ship);
                return direction;
            }
        }

        return Direction.Still;
    }

    getAnalyzedListOfChoicesTowardsDestination (_ship, _destination) {
        const _shipPosition = _ship.getPosition();

        const _choices = this.getUnsafeMoves(_shipPosition, _destination).map(_direction => {
            const _targetPosition = _shipPosition.directionalOffset(_direction);
            const _mapCell = this.getMapCellByPosition(_targetPosition);

            return {
                mapCell: _mapCell,
                direction: _direction,
                halite: _mapCell.getHaliteAmount(),
                ship: _mapCell.getShip() || null
            };
        });

        return _choices.sort(GameMap.sortByProperty('halite'));
    }

    useChosenMove(_ship, _chosen) {
        this.getMapCellByPosition(_ship.getPosition()).markSafe();
        _chosen.mapCell.markUnsafe(_ship);
        
        return _ship.move(_chosen.direction);
    }

    kamiKazeNavigate (_ship, _destination) {
        const _directions = this.getUnsafeMoves(_ship.position, _destination);
        const _targetPosition = _ship.getPosition().directionalOffset(_directions[0]);

        this.getMapCellByPosition(_targetPosition).markUnsafe(_ship);
        
        return _directions[0];
    }

    resetShipsOnMap () {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.getMapCellByIndex(x, y).ship = null;
            }
        }
    }

    updateTileHaliteAmount (_cellX, _cellY, _haliteAmount) {
        return this.getMapCellByIndex(_cellX, _cellY).haliteAmount = _haliteAmount;
    }

    static createMapCell(_x, _y, _haliteAmount) {
        return new MapCell(new Position(_x, _y), _haliteAmount);
    }

    static sortByProperty (_property) {
        return function compare(a,b) {
            if (a[_property] < b[_property]) {
                return -1;
            }

            if (a[_property] > b[_property]) {
                return 1;
            }

            return 0;
        }
    }

    static reverseSortByProperty (_property) {
        return function compare(a,b) {
            if (a[_property] < b[_property]) {
                return 1;
            }

            if (a[_property] > b[_property]) {
                return -1;
            }

            return 0;
        }
    }

    static generateEmptyTable (_numOfRows, _numOfColumns, _fillValue = null) {
        const _table = new Array(_numOfRows);

        for (let _i = 0, _iMax = _numOfRows; _i < _iMax; _i++) {
            _table[_i] = new Array(_numOfColumns).fill(_fillValue);
        }

        return _table;
    }
}

module.exports = GameMap;