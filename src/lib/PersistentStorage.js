/**
 * This module is an abstraction around a persistent storage system. This file can be modified to use whatever
 * persistent storage method is desired.
 */
import AsyncStorage from '@react-native-community/async-storage';
import _ from 'underscore';

/**
 * Get a key from storage
 *
 * @param {string} key
 * @returns {Promise}
 */
function get(key) {
    return AsyncStorage.getItem(key)
        .then(val => JSON.parse(val))
        .catch(err => console.error(`Unable to get item from persistent storage. Key: ${key} Error: ${err}`));
}

/**
 * Get the data for multiple keys
 *
 * @param {string[]} keys
 * @returns {Promise}
 */
function multiGet(keys) {
    // AsyncStorage returns the data in an array format like:
    // [ ['@MyApp_user', 'myUserValue'], ['@MyApp_key', 'myKeyValue'] ]
    // This method will transform the data into a better JSON format like:
    // {'@MyApp_user': 'myUserValue', '@MyApp_key': 'myKeyValue'}
    return AsyncStorage.multiGet(keys)
        .then(arrayOfData => _.reduce(arrayOfData, (finalData, keyValuePair) => ({
            ...finalData,
            [keyValuePair[0]]: JSON.parse(keyValuePair[1]),
        }), {}))
        .catch(err => console.error(`Unable to get item from persistent storage. Error: ${err}`, keys));
}

/**
 * Write a key to storage
 *
 * @param {string} key
 * @param {mixed} val
 * @returns {Promise}
 */
function set(key, val) {
    return AsyncStorage.setItem(key, JSON.stringify(val));
}

/**
 * Set multiple keys at once
 *
 * @param {object} data where the keys and values will be stored
 * @returns {Promise|Promise<void>|*}
 */
function multiSet(data) {
    // AsyncStorage expenses the data in an array like:
    // [["@MyApp_user", "value_1"], ["@MyApp_key", "value_2"]]
    // This method will transform the params from a better JSON format like:
    // {'@MyApp_user': 'myUserValue', '@MyApp_key': 'myKeyValue'}
    const keyValuePairs = _.reduce(data, (finalArray, val, key) => ([
        ...finalArray,
        [key, JSON.stringify(val)],
    ]), []);
    return AsyncStorage.multiSet(keyValuePairs);
}

/**
 * Empty out the storage (like when the user signs out)
 *
 * @returns {Promise}
 */
function clear() {
    return AsyncStorage.clear();
}

/**
 * Merges `val` into an existing key. Best used when updating an existing object
 *
 * @param {string} key
 * @param {mixed} val
 * @returns {Promise}
 */
function merge(key, val) {
    return AsyncStorage.mergeItem(key, val);
}

export {
    get,
    multiGet,
    set,
    multiSet,
    merge,
    clear,
};
