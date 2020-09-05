import _ from 'underscore';
import AsyncStorage from '@react-native-community/async-storage';

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

            // Set the state of the react component with either the pathed data, or the data
            if (mappedComponent.addAsCollection) {
                // Add the data to an array of existing items
                mappedComponent.withIonInstance.setState((prevState) => {
                    const collection = prevState[mappedComponent.statePropertyName] || {};
                    collection[data[mappedComponent.collectionID]] = data;
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
 * Subscribes a react component's state directly to a store key
 *
 * @param {object} mapping the mapping information to connect Ion to the components state
 * @param {string} mapping.keyPattern
 * @param {string} mapping.statePropertyName the name of the property in the state to connect the data to
 * @param {boolean} [mapping.addAsCollection] rather than setting a single state value, this will add things to an array
 * @param {string} [mapping.collectionID] the name of the ID property to use for the collection
 * @param {object} [mapping.withIonInstance] whose setState() method will be called with any changed data
 *      This is used by React components to connect to Ion
 * @param {object} [mapping.callback] a method that will be called with changed data
 *      This is used by any non-React code to connect to Ion
 * @returns {number} an ID to use when calling disconnect
 */
function connect(mapping) {
    const connectionID = lastConnectionID++;
    const connectionMapping = {
        ...mapping,
        regex: RegExp(mapping.key),
    };
    callbackToStateMapping[connectionID] = connectionMapping;

    // If the mapping has a callback, trigger it with the existing data
    // in Ion so it initializes properly
    // @TODO remove the if statement when this is supported by react components
    // @TODO need to support full regex key connections for callbacks.
    //      This would look something like getInitialStateFromConnectionID
    if (mapping.callback) {
        get(mapping.key)
            .then(val => keyChanged(mapping.key, val));
    }

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
 * Returns initial state for a connection config so that stored data
 * is available shortly after the first render.
 *
 * @param {Number} connectionID
 * @return {Promise}
 */
function getInitialStateFromConnectionID(connectionID) {
    const config = callbackToStateMapping[connectionID];
    if (config.addAsCollection) {
        return AsyncStorage.getAllKeys()
            .then((keys) => {
                const regex = RegExp(config.key);
                const matchingKeys = _.filter(keys, key => regex.test(key));
                return Promise.all(_.map(matchingKeys, key => get(key)));
            })
            .then(values => _.reduce(values, (finalObject, value) => ({
                ...finalObject,
                [value[config.collectionID]]: value,
            }), {}));
    }
    return get(config.key);
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
 * @param {string} val
 * @returns {Promise}
 */
function merge(key, val) {
    return AsyncStorage.mergeItem(key, JSON.stringify(val))
        .then(() => get(key))
        .then((newObject) => {
            keyChanged(key, newObject);
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
    getInitialStateFromConnectionID,
};

export default Ion;
