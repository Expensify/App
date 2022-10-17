/**
 * The AsyncStorage provider stores everything in a key/value store by
 * converting the value to a JSON string
 */

import _ from 'underscore';
import AsyncStorage from '@react-native-async-storage/async-storage';

let totalParse = 0;
let totalStr = 0;

let bef = performance.now();

setInterval(() => {
    console.log('aaabbb total time spent on parsing', totalParse, performance.now() - bef);
    console.log('aaabbb total time spent on stringify', totalStr, performance.now() - bef);
}, 2000);

const provider = {
    /**
     * Get the value of a given key or return `null` if it's not available in storage
     * @param {String} key
     * @return {Promise<*>}
     */
    getItem(key) {
        return AsyncStorage.getItem(key)
            .then((value) => {
                const before = performance.now();
                const parsed = value && JSON.parse(value);
                const after = performance.now();
                totalParse += after - before;
                return parsed;
            });
    },

    /**
     * Get multiple key-value pairs for the give array of keys in a batch
     * @param {String[]} keys
     * @return {Promise<Array<[key, value]>>}
     */
    multiGet(keys) {
        return AsyncStorage.multiGet(keys)
            .then(pairs => _.map(pairs, ([key, value]) => {
                const before = performance.now();
                const val = [key, value && JSON.parse(value)] 
                const after = performance.now();
                totalParse += after - before;
                return val;
            }));
    },

    /**
     * Sets the value for a given key. The only requirement is that the value should be serializable to JSON string
     * @param {String} key
     * @param {*} value
     * @return {Promise<void>}
     */
    setItem(key, value) {
        const before = performance.now();
        const val = JSON.stringify(value);
        const after = performance.now();
        totalStr += after - before;
        return AsyncStorage.setItem(key, val);
    },

    /**
     * Stores multiple key-value pairs in a batch
     * @param {Array<[key, value]>} pairs
     * @return {Promise<void>}
     */
    multiSet(pairs) {
        const stringPairs = _.map(pairs, ([key, value]) => {
            const before = performance.now();
            const val = [key, JSON.stringify(value)]
            const after = performance.now();
            totalStr += after - before;
            return val;
        });
        return AsyncStorage.multiSet(stringPairs);
    },

    /**
     * Multiple merging of existing and new values in a batch
     * @param {Array<[key, value]>} pairs
     * @return {Promise<void>}
     */
    multiMerge(pairs) {
        const stringPairs = _.map(pairs, ([key, value]) => {
            const before = performance.now();
            const val = [key, JSON.stringify(value)]
            const after = performance.now();
            totalStr += after - before;
            return val;
        });
        return AsyncStorage.multiMerge(stringPairs);
    },

    /**
     * Returns all keys available in storage
     * @returns {Promise<String[]>}
     */
    getAllKeys: AsyncStorage.getAllKeys,

    /**
     * Remove given key and it's value from storage
     * @param {String} key
     * @returns {Promise<void>}
     */
    removeItem: AsyncStorage.removeItem,

    /**
     * Clear absolutely everything from storage
     * @returns {Promise<void>}
     */
    clear: AsyncStorage.clear,
};

export default provider;
