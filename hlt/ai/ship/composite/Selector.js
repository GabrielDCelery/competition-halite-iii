'use strict';

const Task = require('../interface/Task');

class Selector extends Task {
    constructor (_childTasks) {
        super();
        this.childTasks = _childTasks;
        this.continueAtIndex = 0;
    }

    init () {
        return this;
    }

    process() {
        for (let _i = this.continueAtIndex, _iMax = this.childTasks.length; _i < _iMax; _i++) {
            const _result = this.childTasks[_i].process();

            if (_result === this.SUCCESS) {
                this.continueAtIndex = 0;

                return this.SUCCESS;
            }

            if (_result === this.RUNNING) {
                this.continueAtIndex = _i;

                return this.RUNNING;
            }
        }

        this.continueAtIndex = 0;

        return this.FAIL;
    }
}

module.exports = Selector;