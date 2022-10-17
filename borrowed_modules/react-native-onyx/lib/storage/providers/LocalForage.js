/**
 * @file
 * The storage provider based on localforage allows us to store most anything in its
 * natural form in the underlying DB without having to stringify or de-stringify it
 */

import localforage from 'localforage';
import _ from 'underscore';
import SyncQueue from '../../SyncQueue';
import mergeWithCustomized from '../../mergeWithCustomized';

localforage.config({
    name: 'OnyxDB',
});

const provider = {
    /**
     * Writing very quickly to IndexedDB causes performance issues and can lock up the page and lead to jank.
     * So, we are slowing this process down by waiting until one write is complete before moving on
     * to the next.
     */
    setItemQueue: new SyncQueue(({key, value, shouldMerge}) => {
        if (shouldMerge) {
            return localforage.getItem(key)
                .then((existingValue) => {
                    const newValue = _.isObject(existingValue)
                        ? mergeWithCustomized({}, existingValue, value)
                        : value;
                    return localforage.setItem(key, newValue);
                });
        }

        return localforage.setItem(key, value);
    }),

    /**
     * Get multiple key-value pairs for the give array of keys in a batch
     * @param {String[]} keys
     * @return {Promise<Array<[key, value]>>}
     */
    multiGet(keys) {
        const pairs = _.map(
            keys,
            key => localforage.getItem(key)
                .then(value => [key, value]),
        );

        return Promise.all(pairs);
    },

    /**
     * Multiple merging of existing and new values in a batch
     * @param {Array<[key, value]>} pairs
     * @return {Promise<void>}
     */
    multiMerge(pairs) {
        const tasks = _.map(pairs, ([key, value]) => this.setItemQueue.push({key, value, shouldMerge: true}));

        // We're returning Promise.resolve, otherwise the array of task results will be returned to the caller
        return Promise.all(tasks).then(() => Promise.resolve());
    },

    /**
     * Stores multiple key-value pairs in a batch
     * @param {Array<[key, value]>} pairs
     * @return {Promise<void>}
     */
    multiSet(pairs) {
        // We're returning Promise.resolve, otherwise the array of task results will be returned to the caller
        const tasks = _.map(pairs, ([key, value]) => this.setItem(key, value));
        return Promise.all(tasks).then(() => Promise.resolve());
    },

    /**
     * Clear absolutely everything from storage
     * @returns {Promise<void>}
     */
    clear: localforage.clear,

    /**
     * Returns all keys available in storage
     * @returns {Promise<String[]>}
     */
    getAllKeys: localforage.keys,

    /**
     * Get the value of a given key or return `null` if it's not available in storage
     * @param {String} key
     * @return {Promise<*>}
     */
    getItem: localforage.getItem,

    /**
     * Remove given key and it's value from storage
     * @param {String} key
     * @returns {Promise<void>}
     */
    removeItem: localforage.removeItem,

    /**
     * Sets the value for a given key. The only requirement is that the value should be serializable to JSON string
     * @param {String} key
     * @param {*} value
     * @return {Promise<void>}
     */
    setItem(key, value) {
        return this.setItemQueue.push({key, value});
    },
};

export default provider;
