import _ from 'underscore';
import AsyncStorage from '@react-native-community/async-storage';
import Str from './Str';
import IONKEYS from '../IONKEYS';

// Keeps track of the last connectionID that was used so we can keep incrementing it
let lastConnectionID = 0;

/**
 * Initialize the store with actions and listening for storage events
 */
function init() {
    // Subscribe to the storage event so changes to local storage can be captured
    // TODO: Refactor window events
    // window.addEventListener('storage', (e) => {
    //   try {
    //     keyChanged(e.key, JSON.parse(e.newValue));
    //   } catch (e) {
    //     console.error(`Could not parse value from local storage. Key: ${e.key}`);
    //   }
    // });
}

// Holds a mapping of all the react components that want their state subscribed to a store key
const callbackToStateMapping = {};

/**
 * Get some data from the store
 *
 * @param {string} key
 * @returns {*}
 */
function get(key) {
    return AsyncStorage.getItem(key)
        .then(val => JSON.parse(val))
        .catch(err => console.error(`Unable to get item from persistent storage. Key: ${key} Error: ${err}`));
}

/**
 * Checks to see if the a subscriber's supplied key
 * is associated with a collection of keys.
 *
 * @param {String} key
 * @returns {Boolean}
 */
function isCollectionKey(key) {
    return _.contains(_.values(IONKEYS.COLLECTION), key);
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
 * When a key change happens, search for any callbacks matching the key or collection key and trigger those callbacks
 *
 * @param {string} key
 * @param {mixed} data
 */
function keyChanged(key, data) {
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
 * Write a value to our store with the given key
 *
 * @param {string} key
 * @param {mixed} val
 * @returns {Promise}
 */
function set(key, val) {
    // Write the thing to persistent storage, which will trigger a storage event for any other tabs open on this domain
    return AsyncStorage.setItem(key, JSON.stringify(val))
        .then(() => {
            keyChanged(key, val);
        });
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
        .then(() => {
            _.each(data, (val, key) => keyChanged(key, val));
        });
}

/**
 * Clear out all the data in the store
 *
 * @returns {Promise}
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
    // Values that are objects can be merged into storage
    if (_.isObject(val)) {
        AsyncStorage.mergeItem(key, JSON.stringify(val))
            .then(() => get(key))
            .then((newObject) => {
                keyChanged(key, newObject);
            });
        return;
    }

    // Anything else (strings and numbers) need to be set into storage
    AsyncStorage.setItem(key, JSON.stringify(val))
        .then(() => {
            keyChanged(key, val);
        });
}

const Ion = {
    connect,
    disconnect,
    set,
    multiSet,
    merge,
    clear,
    init,
};

export default Ion;
