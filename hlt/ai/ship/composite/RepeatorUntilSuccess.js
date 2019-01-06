'use strict';

const Task = require('../interface/Task');

class RepeatorUntilSuccess extends Task {
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
            return this.SUCCESS;
        }

        if (_result === this.FAIL) {
            return this.process();
        }

        return this.RUNNING;
    }
}

module.exports = RepeatorUntilSuccess;