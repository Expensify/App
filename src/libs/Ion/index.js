import _ from 'underscore';
import AsyncStorage from '@react-native-community/async-storage';
import addStorageEventHandler from './addStorageEventHandler';
import Str from '../Str';
import {registerLogger, logInfo, logAlert} from './Logger';

// Keeps track of the last connectionID that was used so we can keep incrementing it
let lastConnectionID = 0;

// Holds a mapping of all the react components that want their state subscribed to a store key
const callbackToStateMapping = {};

// Stores all of the keys that Ion can use. Must be defined in init().
let ionKeys;

// Holds a list of keys that have been directly subscribed to or recently modified from least to most recent
let recentlyAccessedKeys = [];

// Holds a list of keys that are safe to remove when we reach max storage
let evictionAllowList = [];

// Holds a list of keys that we should never remove
const evictionBlocklist = {};

/**
 * When a key change happens, search for any callbacks matching the regex pattern and trigger those callbacks
 * Get some data from the store
 *
 * @param {string} key
 * @returns {Promise<*>}
 */
function get(key) {
    return AsyncStorage.getItem(key)
        .then(val => JSON.parse(val))
        .catch(err => logInfo(`Unable to get item from persistent storage. Key: ${key} Error: ${err}`));
}

/**
 * Checks to see if the a subscriber's supplied key
 * is associated with a collection of keys.
 *
 * @param {String} key
 * @returns {Boolean}
 */
function isCollectionKey(key) {
    return _.contains(_.values(ionKeys.COLLECTION), key);
}

/**
 * Checks to see if a given key matches with the
 * configured key of our connected subscriber
 *
 * @param {String} configKey
 * @param {String} key
 * @return {Boolean}
 */
function isKeyMatch(configKey, key) {
    return isCollectionKey(configKey)
        ? Str.startsWith(key, configKey)
        : configKey === key;
}

/**
 * Checks to see if this key has been flagged as
 * safe for removal.
 *
 * @param {String} testKey
 * @returns {Boolean}
 */
function isSafeEvictionKey(testKey) {
    return _.some(evictionAllowList, key => isKeyMatch(key, testKey));
}

/**
 * Remove a key from the recently accessed key list.
 *
 * @param {String} key
 */
function removeLastAccessedKey(key) {
    recentlyAccessedKeys = _.without(recentlyAccessedKeys, key);
}

/**
 * Add a key to the list of recently accessed keys. The least
 * recently accessed key should be at the head and the most
 * recently accessed key at the tail.
 *
 * @param {String} key
 */
function addLastAccessedKey(key) {
    // Only specific keys belong in this list since we cannot remove an entire collection.
    if (isCollectionKey(key) || !isSafeEvictionKey(key)) {
        return;
    }

    removeLastAccessedKey(key);
    recentlyAccessedKeys.push(key);
}

/**
 * Removes a key previously added to this list
 * which will enable it to be deleted again.
 *
 * @param {String} key
 * @param {Number} connectionID
 */
function removeFromEvictionBlockList(key, connectionID) {
    evictionBlocklist[key] = _.without(evictionBlocklist[key] || [], connectionID);

    // Remove the key if there are no more subscribers
    if (evictionBlocklist[key].length === 0) {
        delete evictionBlocklist[key];
    }
}

/**
 * Keys added to this list can never be deleted.
 *
 * @param {String} key
 * @param {Number} connectionID
 */
function addToEvictionBlockList(key, connectionID) {
    removeFromEvictionBlockList(key, connectionID);

    if (!evictionBlocklist[key]) {
        evictionBlocklist[key] = [];
    }

    evictionBlocklist[key].push(connectionID);
}

/**
 * When a key change happens, search for any callbacks matching the key or collection key and trigger those callbacks
 *
 * @param {string} key
 * @param {mixed} data
 */
function keyChanged(key, data) {
    // Add or remove this key from the recentlyAccessedKeys lists
    if (!_.isNull(data)) {
        addLastAccessedKey(key);
    } else {
        removeLastAccessedKey(key);
    }

    // Find all subscribers that were added with connect() and trigger the callback or setState() with the new data
    _.each(callbackToStateMapping, (subscriber) => {
        if (subscriber && isKeyMatch(subscriber.key, key)) {
            if (_.isFunction(subscriber.callback)) {
                subscriber.callback(data, key);
            }

            if (!subscriber.withIonInstance) {
                return;
            }

            // Check if we are subscribing to a collection key and add this item as a collection
            if (isCollectionKey(subscriber.key)) {
                subscriber.withIonInstance.setState((prevState) => {
                    const collection = prevState[subscriber.statePropertyName] || {};
                    collection[key] = data;
                    return {
                        [subscriber.statePropertyName]: collection,
                    };
                });
            } else {
                subscriber.withIonInstance.setState({
                    [subscriber.statePropertyName]: data,
                });
            }
        }
    });
}

/**
 * Sends the data obtained from the keys to the connection. It either:
 *     - sets state on the withIonInstances
 *     - triggers the callback function
 *
 * @param {object} config
 * @param {object} [config.withIonInstance]
 * @param {string} [config.statePropertyName]
 * @param {function} [config.callback]
 * @param {*|null} val
 */
function sendDataToConnection(config, val) {
    if (config.withIonInstance) {
        config.withIonInstance.setState({
            [config.statePropertyName]: val,
        });
    } else if (_.isFunction(config.callback)) {
        config.callback(val);
    }
}

/**
 * Subscribes a react component's state directly to a store key
 *
 * @param {object} mapping the mapping information to connect Ion to the components state
 * @param {string} mapping.key
 * @param {string} mapping.statePropertyName the name of the property in the state to connect the data to
 * @param {object} [mapping.withIonInstance] whose setState() method will be called with any changed data
 *      This is used by React components to connect to Ion
 * @param {object} [mapping.callback] a method that will be called with changed data
 *      This is used by any non-React code to connect to Ion
 * @param {boolean} [mapping.initWithStoredValues] If set to false, then no data will be prefilled into the
 *  component
 * @returns {number} an ID to use when calling disconnect
 */
function connect(mapping) {
    const connectionID = lastConnectionID++;
    callbackToStateMapping[connectionID] = mapping;

    if (mapping.initWithStoredValues === false) {
        return connectionID;
    }

    // Check to see if this key is flagged as a safe eviction key and add it to the recentlyAccessedKeys list
    if (mapping.withIonInstance && !isCollectionKey(mapping.key) && isSafeEvictionKey(mapping.key)) {
        // All React components subscribing to a key flagged as a safe eviction
        // key must implement the canEvict property.
        if (_.isUndefined(mapping.canEvict)) {
            // eslint-disable-next-line max-len
            throw new Error(`Cannot subscribe to safe eviction key '${mapping.key}' without providing a canEvict value.`);
        }
        addLastAccessedKey(mapping.key);
    }

    AsyncStorage.getAllKeys()
        .then((keys) => {
            // Find all the keys matched by the config key
            const matchingKeys = _.filter(keys, key => isKeyMatch(mapping.key, key));

            // If the key being connected to does not exist, initialize the value with null
            if (matchingKeys.length === 0) {
                sendDataToConnection(mapping, null);
                return;
            }

            // When using a callback subscriber we will trigger the callback
            // for each key we find. It's up to the subscriber to know whether
            // to expect a single key or multiple keys in the case of a collection.
            // React components are an exception since we'll want to send their
            // initial data as a single object when using collection keys.
            if (mapping.withIonInstance && isCollectionKey(mapping.key)) {
                Promise.all(_.map(matchingKeys, key => get(key)))
                    .then(values => _.reduce(values, (finalObject, value, i) => ({
                        ...finalObject,
                        [matchingKeys[i]]: value,
                    }), {}))
                    .then(val => sendDataToConnection(mapping, val));
            } else {
                _.each(matchingKeys, (key) => {
                    get(key).then(val => sendDataToConnection(mapping, val));
                });
            }
        });

    return connectionID;
}

/**
 * Remove the listener for a react component
 *
 * @param {string} connectionID
 */
function disconnect(connectionID) {
    if (!callbackToStateMapping[connectionID]) {
        return;
    }
    delete callbackToStateMapping[connectionID];
}

/**
 * Remove a key from Ion and update the subscribers
 *
 * @param {String} key
 * @return {Promise}
 */
function remove(key) {
    return AsyncStorage.removeItem(key)
        .then(() => keyChanged(key, null));
}

/**
 * If we fail to set or merge we must handle this by
 * evicting some data from Ion and then retrying to do
 * whatever it is we attempted to do.
 *
 * @param {Error} error
 * @param {Function} ionMethod
 * @param  {...any} args
 * @return {Promise}
 */
function evictStorageAndRetry(error, ionMethod, ...args) {
    // Find the first key that we can remove that has no subscribers in our blocklist
    const keyForRemoval = _.find(recentlyAccessedKeys, key => !evictionBlocklist[key]);

    if (!keyForRemoval) {
        const logMessage = 'Out of storage. But found no acceptable keys to remove.';
        console.error(logMessage);
        logAlert(logMessage);
        throw error;
    }

    // Remove the least recently viewed key that is not currently being accessed and retry.
    console.debug(
        'Out of storage. Evicting least recently accessed key and retrying.',
        {keyForRemoval}
    );
    return remove(keyForRemoval)
        .then(() => ionMethod(...args));
}

/**
 * Write a value to our store with the given key
 *
 * @param {string} key
 * @param {mixed} val
 * @returns {Promise}
 */
function set(key, val) {
    // Write the thing to persistent storage, which will trigger a storage event for any other tabs open on this domain
    return AsyncStorage.setItem(key, JSON.stringify(val))
        .then(() => keyChanged(key, val))
        .catch(error => evictStorageAndRetry(error, set, key, val));
}

/**
 * Sets multiple keys and values. Example
 * Ion.multiSet({'key1': 'a', 'key2': 'b'});
 *
 * @param {object} data
 * @returns {Promise}
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

    return AsyncStorage.multiSet(keyValuePairs)
        .then(() => _.each(data, (val, key) => keyChanged(key, val)))
        .catch(error => evictStorageAndRetry(error, multiSet, data));
}

/**
 * Clear out all the data in the store
 *
 * @returns {Promise<void>}
 */
function clear() {
    return AsyncStorage.clear();
}

/**
 * Merge a new value into an existing value at a key
 *
 * @param {string} key
 * @param {*} val
 */
function merge(key, val) {
    // Arrays need to be manually merged because the AsyncStorage behavior
    // is not desired when merging arrays. `AsyncStorage.mergeItem('test', [1]);
    // will result in `{0: 1}` being set in storage, when `[1]` is what is expected
    if (_.isArray(val)) {
        let newArray;
        get(key)
            .then((prevVal) => {
                const previousValue = prevVal || [];
                newArray = [...previousValue, ...val];
                return AsyncStorage.setItem(key, JSON.stringify(newArray));
            })
            .then(() => keyChanged(key, newArray))
            .catch(error => evictStorageAndRetry(error, merge, key, val));
        return;
    }

    // Values that are objects are merged normally into storage
    if (_.isObject(val)) {
        AsyncStorage.mergeItem(key, JSON.stringify(val))
            .then(() => get(key))
            .then((newObject) => {
                keyChanged(key, newObject);
            })
            .catch(error => evictStorageAndRetry(error, merge, key, val));
        return;
    }

    // Anything else (strings and numbers) need to be set into storage
    set(key, val);
}

/**
 * Initialize the store with actions and listening for storage events
 *
 * @param {Object} [options]
 * @param {String[]} [options.safeEvictionKeys] This is an array of IONKEYS
 * (individual or collection patterns) that when provided to Ion are flagged
 * as "safe" for removal. Any components subscribing to these keys must also
 * implement a canEvict option. See the README for more info.
 */
function init({keys, initialKeyStates, safeEvictionKeys}) {
    // Let Ion know about all of our keys
    ionKeys = keys;

    // Let Ion know about which keys are safe to evict
    evictionAllowList = safeEvictionKeys;

    // Initialize all of our keys with data provided
    _.each(initialKeyStates, (state, key) => merge(key, state));

    // Update any key whose value changes in storage
    addStorageEventHandler((key, newValue) => keyChanged(key, newValue));
}

const Ion = {
    connect,
    disconnect,
    set,
    multiSet,
    merge,
    clear,
    init,
    registerLogger,
    addToEvictionBlockList,
    removeFromEvictionBlockList,
    isSafeEvictionKey,
};

export default Ion;
