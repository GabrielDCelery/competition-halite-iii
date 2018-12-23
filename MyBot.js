const hlt = require('./hlt');
const { Direction }  = require('./hlt');
const logging = require('./hlt/utils/logging');

const game = new hlt.GameInstance();
game.initialize().then(async () => {
    // At this point "game" variable is populated with initial map data.
    // This is a good place to do computationally expensive start-up pre-processing.
    // As soon as you call "ready" function below, the 2 second per turn timer will start.
    await game.ready('MyJavaScriptBot');

    logging.info(`My Player ID is ${game.myId}.`);

    while (true) {
        await game.updateFrame();

        const { gameMap, me } = game;

        const commandQueue = [];

        for (const ship of me.getShips()) {
            if (ship.haliteAmount > hlt.constants.MAX_HALITE / 2) {
                const destination = me.shipyard.position;
                const safeMove = gameMap.naiveNavigate(ship, destination);
                commandQueue.push(ship.move(safeMove));
            }
            else if (gameMap.getMapCellByPosition(ship.position).haliteAmount < hlt.constants.MAX_HALITE / 10) {
                const direction = Direction.getAllCardinals()[Math.floor(4 * Math.random())];
                const destination = ship.position.directionalOffset(direction);
                const safeMove = gameMap.naiveNavigate(ship, destination);
                commandQueue.push(ship.move(safeMove));
            }
        }

        if (game.turnNumber < 0.75 * hlt.constants.MAX_TURNS &&
            me.haliteAmount >= hlt.constants.SHIP_COST &&
            !gameMap.getMapCellByPosition(me.shipyard.position).isOccupied) {
            commandQueue.push(me.shipyard.spawn());
        }

        await game.endTurn(commandQueue);
    }
});
