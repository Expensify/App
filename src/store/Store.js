import lodashGet from 'lodash.get';
import _ from 'underscore';
import AsyncStorage from '@react-native-community/async-storage';

// Keeps track of the last subscription ID that was used
let lastSubscriptionID = 0;

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
 * Subscribes a react component's state directly to a store key
 *
 * @param {string} keyPattern
 * @param {string} path a specific path of the store object to map to the state
 * @param {mixed} defaultValue to return if the there is nothing from the store
 * @param {string} statePropertyName the name of the property in the state to bind the data to
 * @param {object} reactComponent whose setState() method will be called with any changed data
 * @returns {number} an ID to use when calling unbind
 */
function bind(keyPattern, path, defaultValue, statePropertyName, reactComponent) {
    const subscriptionID = lastSubscriptionID++;
    callbackToStateMapping[subscriptionID] = {
        regex: RegExp(keyPattern),
        statePropertyName,
        path,
        reactComponent,
        defaultValue,
    };
    return subscriptionID;
}

/**
 * Remove the listener for a react component
 *
 * @param {string} subscriptionID
 */
function unbind(subscriptionID) {
    if (!callbackToStateMapping[subscriptionID]) {
        return;
    }
    delete callbackToStateMapping[subscriptionID];
}

/**
 * When a key change happens, search for any callbacks matching the regex pattern and trigger those callbacks
 *
 * @param {string} key
 * @param {mixed} data
 */
function keyChanged(key, data) {
    console.debug('[STORE] key changed', key, data);

    // Find components that were added with bind() and trigger their setState() method with the new data
    _.each(callbackToStateMapping, (mappedComponent) => {
        if (mappedComponent && mappedComponent.regex.test(key)) {
            const newValue = mappedComponent.path
                ? lodashGet(data, mappedComponent.path, mappedComponent.defaultValue)
                : data || mappedComponent.defaultValue || null;

            // Set the state of the react component with either the pathed data, or the data
            mappedComponent.reactComponent.setState({
                [mappedComponent.statePropertyName]: newValue,
            });
        }
    });
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
 * Get some data from the store
 *
 * @param {string} key
 * @param {string} [extraPath] passed to _.get() in order to return just a piece of the localStorage object
 * @param {mixed} [defaultValue] passed to the second param of _.get() in order to specify a default value if the value
 *      we are looking for doesn't exist in the object yet
 * @returns {*}
 */
function get(key, extraPath, defaultValue) {
    return AsyncStorage.getItem(key)
        .then(val => JSON.parse(val))
        .then((val) => {
            if (extraPath) {
                return lodashGet(val, extraPath, defaultValue);
            }
            return val;
        })
        .catch(err => console.error(`Unable to get item from persistent storage. Key: ${key} Error: ${err}`));
}

/**
 * Get multiple keys of data
 *
 * @param {string[]} keys
 * @returns {Promise}
 */
function multiGet(keys) {
    // AsyncStorage returns the data in an array format like:
    // [ ['@MyApp_user', 'myUserValue'], ['@MyApp_key', 'myKeyValue'] ]
    // This method will transform the data into a better JSON format like:
    // {'@MyApp_user': 'myUserValue', '@MyApp_key': 'myKeyValue'}
    return AsyncStorage.multiGet(keys)
        .then(arrayOfData => _.reduce(arrayOfData, (finalData, keyValuePair) => ({
            ...finalData,
            [keyValuePair[0]]: JSON.parse(keyValuePair[1]),
        }), {}))
        .catch(err => console.error(`Unable to get item from persistent storage. Error: ${err}`, keys));
}

/**
 * Sets multiple keys and values. Example
 * Store.multiSet({'key1': 'a', 'key2': 'b'});
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
    return AsyncStorage.mergeItem(key, JSON.stringify(val));
}

export {
    bind,
    unbind,
    set,
    multiSet,
    get,
    multiGet,
    merge,
    clear,
    init
};
