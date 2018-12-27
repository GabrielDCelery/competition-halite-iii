'use strict';

const VALID_STATES = {
    CollectHalite: require('./shipStates/CollectHalite'),
    MoveToDropoff: require('./shipStates/MoveToDropoff')
}

class ShipStateFactory {
    constructor (_ship) {
        this.ship = _ship;
        this.setState('CollectHalite');
    }

    static get VALID_STATES () {
        return {
            CollectHalite: 'CollectHalite',
            MoveToDropoff: 'MoveToDropoff'
        }
    }

    setState (_newStateName) {
        this.state = new VALID_STATES[_newStateName](ShipStateFactory.VALID_STATES, this.ship);
    }

    createCommandForTurn () {
        const _newStateName = this.state.checkIfNeedsToTransitionToNewState();

        if (_newStateName) {
            this.setState(_newStateName);
        }

        return this.state.createCommandForTurn();
    }
}

module.exports = ShipStateFactory;
