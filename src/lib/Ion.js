import _ from 'underscore';
import AsyncStorage from '@react-native-community/async-storage';
import addStorageEventHandler from './addStorageEventHandler';

// Keeps track of the last connectionID that was used so we can keep incrementing it
let lastConnectionID = 0;

// Holds a mapping of all the react components that want their state subscribed to a store key
const callbackToStateMapping = {};

/**
 * When a key change happens, search for any callbacks matching the regex pattern and trigger those callbacks
 *
 * @param {string} key
 * @param {mixed} data
 */
function keyChanged(key, data) {
    // Find components that were added with connect() and trigger their setState() method with the new data
    _.each(callbackToStateMapping, (mappedComponent) => {
        if (mappedComponent && mappedComponent.regex.test(key)) {
            if (_.isFunction(mappedComponent.callback)) {
                mappedComponent.callback(data, key);
            }

            if (!mappedComponent.withIonInstance) {
                return;
            }

            // Set the state of the react component with the data
            if (mappedComponent.indexBy) {
                // Add the data to an array of existing items
                mappedComponent.withIonInstance.setState((prevState) => {
                    const collection = prevState[mappedComponent.statePropertyName] || {};
                    collection[data[mappedComponent.indexBy]] = data;
                    return {
                        [mappedComponent.statePropertyName]: collection,
                    };
                });
            } else {
                mappedComponent.withIonInstance.setState({
                    [mappedComponent.statePropertyName]: data,
                });
            }
        }
    });
}

/**
 * Initialize the store with actions and listening for storage events
 */
function init() {
    addStorageEventHandler((key, newValue) => keyChanged(key, newValue));
}

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
 * Sends the data obtained from the keys to the connection. It either:
 *     - sets state on the withIonInstances
 *     - triggers the callback function
 *
 * @param {object} config
 * @param {object} [config.withIonInstance]
 * @param {string} [config.statePropertyName]
 * @param {function} [config.callback]
 * @param {*} val
 * @param {string} [key]
 */
function sendDataToConnection(config, val, key) {
    if (config.withIonInstance) {
        config.withIonInstance.setState({
            [config.statePropertyName]: val,
        });
    } else if (_.isFunction(config.callback)) {
        config.callback(val, key);
    }
}

/**
 * Subscribes a react component's state directly to a store key
 *
 * @param {object} mapping the mapping information to connect Ion to the components state
 * @param {string} mapping.key
 * @param {string} mapping.statePropertyName the name of the property in the state to connect the data to
 * @param {string} [mapping.indexBy] the name of a property to index the collection by
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
    const config = {
        ...mapping,
        regex: RegExp(mapping.key),
    };
    callbackToStateMapping[connectionID] = config;

    if (mapping.initWithStoredValues === false) {
        return connectionID;
    }

    // Get all the data from Ion to initialize the connection with
    AsyncStorage.getAllKeys()
        .then((keys) => {
            // Find all the keys matched by the config regex
            const matchingKeys = _.filter(keys, config.regex.test.bind(config.regex));

            // If the key being connected to does not exist, initialize the value with null
            if (matchingKeys.length === 0) {
                sendDataToConnection(config, null, config.key);
                return;
            }

            if (matchingKeys.length > 1 && config.withIonInstance && !config.indexBy) {
                // eslint-disable-next-line no-console
                console.warning(`It looks like a React component subscribed to multiple Ion keys without 
                providing an 'indexBy' option. This will result in undefined behavior. The best thing to do is 
                provide an 'indexBy' value, or use a more specific regex that will only match a single Ion key.`);
            }

            if (config.indexBy) {
                Promise.all(_.map(matchingKeys, key => get(key)))
                    .then(values => _.reduce(values, (finalObject, value) => ({
                        ...finalObject,
                        [value[config.indexBy]]: value,
                    }), {}))
                    .then(val => sendDataToConnection(config, val));
            } else {
                _.each(matchingKeys, (key) => {
                    get(key).then(val => sendDataToConnection(config, val, key));
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
    // Values that are objects or arrays are merged into storage
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
