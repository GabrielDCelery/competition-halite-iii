'use strict';

const Task = require('../interface/Task');

class Inverter extends Task {
    constructor (_childTask) {
        super();
        this.childTask = _childTask;
    }

    init () {
        return this;
    }

    process() {
        const _result = this.childTask.process();

        if (_result === this.SUCCESS) {
            return this.FAIL;
        }

        if (_result === this.FAIL) {
            return this.SUCCESS;
        }

        return this.this.RUNNING;
    }
}

module.exports = Inverter;