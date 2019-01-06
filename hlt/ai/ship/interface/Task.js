'use strict';

class Task {
    constructor () {
        this.SUCCESS = 0;
        this.FAIL = 1;
        this.RUNNING = 2;
    }

    init () {
        throw new Error('Task.init method needs to be overriden!');
    }

    process() {
        throw new Error('Task.process method needs to be overriden!');
    }
}

module.exports = Task;