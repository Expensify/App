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

/**
 * Used to grab the id for a particular collection item's key.
 * e.g. reportActions_1 -> 1
 *
 * @param {String} key
 * @returns {String}
 */
function extractCollectionItemID(key) {
    return key.split('_')[1];
}

export {
    lastItem,
    extractCollectionItemID,
};
