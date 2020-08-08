/**
 * This module is an abstraction around a persistent storage system. This file can be modified to use whatever
 * persistent storage method is desired.
 */

import AsyncStorage from '@react-native-community/async-storage';

/**
 * Get a key from storage
 *
 * @param {string} key
 */
const get = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.error(`Could not parse value from local storage. Key: ${key}`);
    }
};

/**
 * Write a key to storage
 *
 * @param {string} key
 * @param {mixed} val
 */
const set = async (key, val) => {
    await AsyncStorage.setItem(key, JSON.stringify(val));
};

/**
 * Empty out the storage (like when the user signs out)
 */
const clear = async () => {
    await AsyncStorage.clear();
};

export {get, set, clear};
