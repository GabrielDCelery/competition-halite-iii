const readline = require('readline');

const constants = require('./settings/constants');
const logging = require('./utils/logging');
const GameMap = require('./map/GameMap');
const GameArea = require('./map/GameArea');
const Player = require('./Player');

class GameInstance {
    constructor() {
        this.turnNumber = 0;
        this.myId = null;
        this.players = null;
        this.me = null;
        this.gameMap = null;
        this.gameArea = null;

        // Setup input/output
        const rl = readline.createInterface({
            input: process.stdin,
            output: null,
        });
        const buffer = [];
        let currentResolve;
        const makePromise = function() {
            return new Promise((resolve) => {
                currentResolve = resolve;
            });
        };
        let currentPromise = makePromise();
        rl.on('line', (line) => {
            buffer.push(line);
            currentResolve();
            currentPromise = makePromise();
        });
        const getLine = function() {
            return new Promise(async (resolve) => {
                while (buffer.length === 0) {
                    await currentPromise;
                }
                resolve(buffer.shift());
            });
        };
        this._getLine = getLine;
        this._readAndParseLine = this._readAndParseLine.bind(this);
    }

    async _readAndParseLine () {
        return (await this._getLine()).split(/\s+/).map(_value => parseInt(_value, 10));
    }

    /**
     * Initialize a game object collecting all the start-state
     * instances for pre-game. Also sets up a log file in
     * "bot-<bot_id>.log".
     */
    async initialize() {
        constants.loadConstants(JSON.parse(await this._getLine()));

        const [ _numOfPlayers, myId ] = await this._readAndParseLine();
        this.myId = myId;

        logging.setup(`bot-${myId}.log`);

        this.players = new Map();

        for (let i = 0; i < _numOfPlayers; i++) {
            const [ _playerId, _shipyardX, _shipyardY ] = await this._readAndParseLine();

            const _player = new Player(_playerId).setShipyard(_shipyardX, _shipyardY);

            this.players.set(i, _player);
        }
        this.me = this.players.get(this.myId);

        const [ _mapWidth, _mapHeight ] = await this._readAndParseLine();
        const _gameMap = GameMap.generateEmptyTable(_mapWidth, _mapHeight);

        for (let _y = 0; _y < _mapHeight; _y++) {
            const _cells = await this._readAndParseLine();

            for (let _x = 0; _x < _mapWidth; _x++) {
                _gameMap[_y][_x] = GameMap.createMapCell(_x, _y, _cells[_x]);
            }
        }

        this.gameMap = new GameMap(_gameMap, _mapWidth, _mapHeight);
        this.gameArea = new GameArea(this.gameMap);

        this.me.initAI().getAI()
            .setGameMap(this.gameMap)
            .setGameArea(this.gameArea)
            .setTurnNumber(this.turnNumber)
            .init();
    }

    /** Indicate that your bot is ready to play. */
    async ready(name) {
        await sendCommands([ name ]);
    }

    /**
     * Updates the game object's state.
     */
    async updateFrame() {
        this.turnNumber = parseInt(await this._getLine(), 10);
        this.me.getAI().setTurnNumber(this.turnNumber);
        logging.info(`================ TURN ${this.turnNumber.toString().padStart(3, '0')} ================`);

        for (let i = 0; i < this.players.size; i++) {
            const [ _playerId, numShips, numDropoffs, halite ] = await this._readAndParseLine();
            const _bIsMe = _playerId === this.myId;
            await this.players.get(_playerId)._update(numShips, numDropoffs, halite, this._readAndParseLine, _bIsMe);
        }

        this.gameArea.resetEnemyShipDistribution();
        this.gameMap.resetShipsOnMap();

        const _numChangedCells = parseInt(await this._getLine(), 10);

        for (let i = 0; i < _numChangedCells; i++) {
            const [ _cellX, _cellY, _cellEnergy ] = await this._readAndParseLine();

            this.gameArea.updateHaliteForAreaBeforeMapCellUpdate(_cellX, _cellY, _cellEnergy);
            this.gameMap.updateTileHaliteAmount(_cellX, _cellY, _cellEnergy);
        }

        // Mark cells with ships as unsafe for navigation

        for (const player of this.players.values()) {
            if (player.id !== this.myId) {
                for (const ship of player.getShips()) {
                    this.gameArea.increaseEnemyNumberOfShipsInArea(ship.position);
                }
            }

            for (const ship of player.getShips()) {
                this.gameMap.getMapCellByPosition(ship.position).markUnsafe(ship);
            }
            this.gameMap.getMapCellByPosition(player.shipyard.position).structure = player.shipyard;
            for (const dropoff of player.getDropoffs()) {
                this.gameMap.getMapCellByPosition(dropoff.position).structure = dropoff;
            }
        }
    }

    /**
     * Send all commands to the game engine, effectively ending your
     * turn.
     * @param {Array} commands
     */
    async endTurn(commands) {
        await sendCommands(commands);
    }
}

/**
 * Sends a list of commands to the engine.
 * @param commands The list of commands to send.
 * @returns a Promise fulfilled once stdout is drained.
 */
function sendCommands(commands) {
    return new Promise((resolve) => {
        process.stdout.write(commands.join(' ') + '\n', function() {
            resolve();
        });
    });
}

module.exports = GameInstance;
