'use strict';

const normalizeDataArray = function normalizeDataArray (_values) {
    const _minValue = Math.min(..._values);
    const _maxValue = Math.max(..._values);

    const _diff = _maxValue - _minValue;

    if (_diff === 0) {
        return _values;
    }

    return _values.map(_value => {
        return parseFloat(((_value - _minValue) / _diff).toFixed(2));
    });
}

const sortByProperty = function sortByProperty (_property) {
    return function compare(a,b) {
        if (a[_property] < b[_property]) {
            return -1;
        }

        if (a[_property] > b[_property]) {
            return 1;
        }

        return 0;
    }
}

const reverseSortByProperty = function reverseSortByProperty (_property) {
    return function compare(a,b) {
        if (a[_property] < b[_property]) {
            return 1;
        }

        if (a[_property] > b[_property]) {
            return -1;
        }

        return 0;
    }
}

module.exports = {
    normalizeDataArray: normalizeDataArray,
    sortByProperty: sortByProperty,
    reverseSortByProperty: reverseSortByProperty
}