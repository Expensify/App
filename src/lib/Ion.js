import _ from 'underscore';
import AsyncStorage from '@react-native-community/async-storage';
import Str from './Str';

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
 * Takes a key from a subscriber and a key from Ion
 * and returns true if we have a collection key or item.
 *
 * @param {string} configKey
 * @param {string} key
 * @returns {boolean}
 */
function isKeyMatch(configKey, key) {
    return key === configKey || Str.startsWith(key, `${configKey}_`);
}

/**
 * Returns an object collection for all keys stored in Ion that match
 * the provided key. Said another way, this will return an exact snapshot of
 * the current Ion storage state, but with only the keys we want to know about.
 *
 * e.g. if we pass 'report' this would match on 'report_42', 'report_43',
 * etc and our final object would be:
 *
 * {report_42: {...}, report_43: {...}}
 *
 * If only a single key matches (not a collection) then we return:
 *
 * {personalDetails: {...}}
 *
 * @param {string} configKey
 * @returns {object}
 */
function getCollection(configKey) {
    return AsyncStorage.getAllKeys()
        .then((keys) => {
            // Find all the keys matched by the config key
            const matchingKeys = _.filter(keys, key => isKeyMatch(configKey, key));

            // If the key being connected to does not exist, initialize the value with null
            if (matchingKeys.length === 0) {
                return Promise.resolve(null);
            }

            // Get the values and send each one back to the subscriber callback or component
            return Promise.all(_.map(matchingKeys, key => get(key)))
                .then(values => _.reduce(values, (finalObject, value, i) => ({
                    ...finalObject,
                    [matchingKeys[i]]: value,
                }), {}));
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
 * @param {object|null} collection
 * @param {string} key
 * @param {*} item - the original data that updated vs. a collection
 */
function sendDataToConnection(config, collection, key, item) {
    console.log(key);
    let valueToSend = collection;

    if (_.size(collection) === 1 && collection[key]) {
        valueToSend = collection[key];
    }

    if (_.isFunction(config.callback)) {
        config.callback(valueToSend, item);
    }

    if (!config.withIonInstance) {
        return;
    }

    config.withIonInstance.setState({
        [config.statePropertyName]: valueToSend,
    });
}

/**
 * When a key change happens, search for any callbacks matching the key or collection key and trigger those callbacks
 *
 * @param {string} key
 * @param {mixed} item
 */
function keyChanged(key, item) {
    getCollection(key)
        .then((collection) => {
            // Find components that were added with connect() and trigger their setState() method with the new data
            _.each(callbackToStateMapping, (subscriber) => {
                // If the subscriber is explicitly subscribing to this key or the key is
                // collection key then get the data and return it to the subscriber.
                if (subscriber && isKeyMatch(subscriber.key, key)) {
                    sendDataToConnection(subscriber, collection, key, item);
                }
            });
        });
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

    // Get collection data from Ion to initialize the connection with
    getCollection(mapping.key).then(val => sendDataToConnection(mapping, val, mapping.key));
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
