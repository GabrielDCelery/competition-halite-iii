'use strict';

const Leaf = require('../Leaf');
const commonTransformations = require('../../../../utils/commonTransformations');

class CollectHaliteOnCell extends Leaf {
    init (_ship, _destination) {
        return this;
    }

    process () {
    }
}

module.exports = CollectHaliteOnCell;