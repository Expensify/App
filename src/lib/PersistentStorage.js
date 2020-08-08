/**
 * This module is an abstraction around a persistent storage system. This file can be modified to use whatever
 * persistent storage method is desired.
 */
import AsyncStorage from '@react-native-community/async-storage';

/**
 * Get a key from storage
 *
 * @param {string} key
 * @returns {Promise}
 */
function get(key) {
    return AsyncStorage.getItem(key)
        .then(val => {
            const jsonValue = JSON.parse(val);
            return jsonValue;
        })
        .catch(err => {
            console.error(`Unable to get item from persistent storage. Key: ${key} Error: ${err}`);
        });
};

/**
 * Write a key to storage
 *
 * @param {string} key
 * @param {mixed} val
 * @returns {Promise}
 */
function set(key, val) {
    return AsyncStorage.setItem(key, JSON.stringify(val));
};

/**
 * Empty out the storage (like when the user signs out)
 *
 * @returns {Promise}
 */
function clear() {
    return AsyncStorage.clear();
};

export {
    get,
    set,
    clear,
};
