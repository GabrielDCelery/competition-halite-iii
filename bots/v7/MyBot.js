const hlt = require('./hlt');
const logging = require('./hlt/utils/logging');

const gameInstance = new hlt.GameInstance();
gameInstance.initialize().then(async () => {
    // At this point "game" variable is populated with initial map data.
    // This is a good place to do computationally expensive start-up pre-processing.
    // As soon as you call "ready" function below, the 2 second per turn timer will start.
    await gameInstance.ready('Lancelotv7');

    logging.info(`My Player ID is ${gameInstance.myId}.`);

    while (true) {
        await gameInstance.updateFrame();

        const { gameMap, me } = gameInstance;

        me.resetCommandQueue();

        for (const ship of me.getShips()) {
            const _command = ship.createCommandForTurn();

            if (_command) {
                me.pushCommandToQueue(_command)
            }
        }

        if (gameInstance.turnNumber < 0.75 * hlt.constants.MAX_TURNS &&
            me.haliteAmount >= hlt.constants.SHIP_COST &&
            !gameMap.getMapCellByPosition(me.shipyard.position).isOccupied) {
            me.pushCommandToQueue(me.shipyard.spawn())
        }

        await gameInstance.endTurn(me.getCommandQueue());
    }
});
