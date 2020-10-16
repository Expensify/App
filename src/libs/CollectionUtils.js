import _ from 'underscore';

/**
 * Return the highest item in a numbered collection
 *
 * e.g. {1: '1', 2: '2', 3: '3'} -> '3'
 *
 * @param {Object} object
 * @return {*}
 */
export function lastItem(object = {}) {
    const lastKey = _.last(_.keys(object)) || 0;
    return object[lastKey];
}

/**
 * All collection keys have IDs built into the
 * key. This is a simple tool to separate that ID
 * from the key.
 *
 * @param {String} key
 * @return {String}
 */
export function getIDFromKey(key) {
    return _.last(key.split('_'));
}

export default {
    lastItem,
    getIDFromKey,
};
