'use strict';

const Ship = require('../entities/Ship');
const Direction = require('./helpers/Direction');
const Position = require('./helpers/Position');
const TableWrapper = require('../../utils/TableWrapper');
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
    }

    getMapCellByIndex (_x, _y) {
        return this._cells[_y][_x];
    }

    getMapCellByPosition (_positionObj) {
        const _normalizedPositionObj = this.normalize(_positionObj);

        return this._cells[_normalizedPositionObj.y][_normalizedPositionObj.x];
    }

    calculateManhattanDistance(_source, _target) {
        const _delta = this.normalize(_source).sub(this.normalize(_target)).abs();

        return Math.min(_delta.x, this.width - _delta.x) + Math.min(_delta.y, this.height - _delta.y);
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
    static _getTargetDirection(source, target) {
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
        const [ yDir, xDir ] = GameMap._getTargetDirection(source, destination);

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

    static async _generate(_readAndParseLine) {
        const [ mapWidth, mapHeight ] = await _readAndParseLine();

        const gameMap = TableWrapper.generateEmptyTable (mapHeight, mapWidth);

        for (let y = 0; y < mapHeight; y++) {
            const cells = await _readAndParseLine();

            for (let x = 0; x < mapWidth; x++) {
                gameMap[y][x] = new MapCell(new Position(x, y), cells[x]);
            }
        }

        return new GameMap(gameMap, mapWidth, mapHeight);
    }

    /**
     * Update this map object from the input given by the game
     * engine.
     */
    async _update(getLine) {
        // Mark cells as safe for navigation (re-mark unsafe cells
        // later)
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.getMapCellByIndex(x, y).ship = null;
            }
        }

        const numChangedCells = parseInt(await getLine(), 10);
        for (let i = 0; i < numChangedCells; i++) {
            const line = (await getLine());
            const [ cellX, cellY, cellEnergy ] = line
                  .split(/\s+/)
                  .map(x => parseInt(x, 10));
            this.getMapCellByIndex(cellX, cellY).haliteAmount = cellEnergy;
        }
    }
}

module.exports = GameMap;