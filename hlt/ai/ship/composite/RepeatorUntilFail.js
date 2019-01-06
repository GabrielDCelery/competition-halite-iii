'use strict';

const Task = require('../interface/Task');

class RepeatorUntilFail extends Task {
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
            return this.process();
        }

        if (_result === this.FAIL) {
            return this.SUCCESS;
        }

        return this.RUNNING;
    }
}

module.exports = RepeatorUntilFail;