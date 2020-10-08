/**
 * This lib has been adapted from github.com/react-native-community/async-storage/blob/master/src/AsyncStorage.js
 *
 * Until the next version of async-storage web will only support localStorage which means
 * our storage capacity is severely limited in the browser. This lib mimicks the API of
 * AsyncStorage and replaces all localStorage with localForage (an IndexedDB wrapper which
 * increases the available space significantly).
 */

import merge from 'deep-assign';
import localForage from 'localforage';

const mergeLocalStorageItem = (key, value) => (
    localForage.getItem(key)
        .then((oldValue) => {
            const oldObject = JSON.parse(oldValue);
            const newObject = JSON.parse(value);
            const nextValue = JSON.stringify(merge({}, oldObject, newObject));
            return localForage.setItem(key, nextValue);
        })
);

const createPromiseAll = (promises, processResult) => (
    Promise.all(promises).then(
        (result) => {
            const value = processResult ? processResult(result) : null;
            return Promise.resolve(value);
        },
        errors => Promise.reject(errors)
    )
);

export default class AsyncStorage {
    /**
     * Fetches `key` value
     *
     * @param {String} key
     * @returns {Promise}
     */
    static getItem(key) {
        return localForage.getItem(key);
    }

    /**
     * Sets `value` for `key`.
     *
     * @param {String} key
     * @param {String} value
     * @returns {Promise}
     */
    static setItem(key, value) {
        return localForage.setItem(key, value);
    }

    /**
     * Removes a `key`
     *
     * @param {String} key
     * @returns {Promise}
     */
    static removeItem(key) {
        return localForage.removeItem(key);
    }

    /**
     * Merges existing value with input value, assuming they are stringified JSON.
     *
     * @param {String} key
     * @param {String} value
     * @returns {Promise}
     */
    static mergeItem(key, value) {
        return mergeLocalStorageItem(key, value);
    }

    /**
     * Erases *all* AsyncStorage for the domain.
     *
     * @returns {Promise}
     */
    static clear() {
        return localForage.clear();
    }

    /**
     * Gets *all* keys known to the app, for all callers, libraries, etc.
     *
     * @returns {Promise}
     */
    static getAllKeys() {
        return localForage.keys();
    }

    /**
     * (stub) Flushes any pending requests using a single batch call to get the data.
     */
    static flushGetRequests() {}

    /**
     * multiGet resolves to an array of key-value pair arrays that matches the
     * input format of multiSet.
     *
     *   multiGet(['k1', 'k2']) -> [['k1', 'val1'], ['k2', 'val2']]
     *
     * @param {String[]} keys
     * @returns {Promise}
     */
    static multiGet(keys) {
        const promises = keys.map(key => AsyncStorage.getItem(key));
        const processResult = result => result.map((value, i) => [keys[i], value]);
        return createPromiseAll(promises, processResult);
    }

    /**
     * Takes an array of key-value array pairs.
     *   multiSet([['k1', 'val1'], ['k2', 'val2']])
     *
     * @param {Array} keyValuePairs
     * @returns {Promise}
     */
    static multiSet(keyValuePairs) {
        const promises = keyValuePairs.map(item => AsyncStorage.setItem(item[0], item[1]));
        return createPromiseAll(promises);
    }

    /**
     * Delete all the keys in the `keys` array.
     *
     * @param {Array} keys
     * @return {Promise}
     */
    static multiRemove(keys) {
        const promises = keys.map(key => AsyncStorage.removeItem(key));
        return createPromiseAll(promises);
    }

    /**
     * Takes an array of key-value array pairs and merges them with existing
     * values, assuming they are stringified JSON.
     *
     *   multiMerge([['k1', 'val1'], ['k2', 'val2']])
     *
     * @param {Array} keyValuePairs
     * @return {Promise}
     */
    static multiMerge(keyValuePairs) {
        const promises = keyValuePairs.map(item => AsyncStorage.mergeItem(item[0], item[1]));
        return createPromiseAll(promises);
    }
}
