'use strict';

const VALID_STATES = {
    MoveToDropoff: require('./shipStates/MoveToDropoff'),
    CollectHaliteInArea: require('./shipStates/CollectHaliteInArea'),
    MoveToArea: require('./shipStates/MoveToArea'),
    SuicideRushHome: require('./shipStates/SuicideRushHome')
}

class ShipStateFactory {
    constructor (_ship) {
        this.ship = _ship;
        this.setState('MoveToArea');
    }

    static get VALID_STATES () {
        return {
            MoveToDropoff: 'MoveToDropoff',
            CollectHaliteInArea: 'CollectHaliteInArea',
            MoveToArea: 'MoveToArea',
            SuicideRushHome: 'SuicideRushHome'
        }
    }

    callMethodOnState (_methodname, _argumentsArray) {
        if (!this.state[_methodname]) {
            return false;
        }

        return Reflect.apply(this.state[_methodname], this.state, _argumentsArray);
    }

    setState (_newStateName) {
        this.state = new VALID_STATES[_newStateName](ShipStateFactory.VALID_STATES, this.ship);
    }

    toggleCommandCreatedForTurn(_boolean) {
        this.state.toggleCommandCreatedForTurn(_boolean);

        return this;
    }

    createCommandForTurn () {
        if (this.state.commandCreatedForTurn === true) {
            return null;
        }

        const _newStateName = this.state.checkIfNeedsToTransitionToNewState();

        if (_newStateName) {
            this.setState(_newStateName);
        }

        const _command = this.state.createCommandForTurn();

        this.toggleCommandCreatedForTurn(true);

        return _command;
    }
}

module.exports = ShipStateFactory;
