import _ from 'underscore';

/**
 * Return the highest item in a numbered collection
 *
 * e.g. {1: '1', 2: '2', 3: '3'} -> '3'
 *
 * @param {Object} object
 * @returns {*}
 */
function lastItem(object = {}) {
    const lastKey = _.last(_.keys(object)) || 0;
    return object[lastKey];
}

export {
    // eslint-disable-next-line import/prefer-default-export
    lastItem,
};
