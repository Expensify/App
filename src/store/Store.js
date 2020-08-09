import lodashGet from 'lodash.get';
import _ from 'underscore';
import * as PersistentStorage from '../lib/PersistentStorage';
import Guid from '../lib/Guid';

// Holds all of the callbacks that have registered for a specific key pattern
const callbackMapping = {};

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

/**
 * Remove a callback from a regex pattern
 *
 * @param {string} keyPattern
 * @param {function} cb
 */
function unsubscribe(keyPattern, cb) {
    if (!callbackMapping[keyPattern] || !callbackMapping[keyPattern].length) {
        return;
    }
    callbackMapping[keyPattern] = callbackMapping[keyPattern].filter(existingCallback => existingCallback !== cb);
}

/**
 * Subscribe a regex pattern to trigger a callback when a storage event happens for a key matching that regex
 *
 * @param {string} keyPattern
 * @param {function} cb
 */
function subscribe(keyPattern, cb) {
    if (!callbackMapping[keyPattern]) {
        callbackMapping[keyPattern] = [];
    }
    callbackMapping[keyPattern].push(cb);
}

// Holds a mapping of all the react components that want their state subscribed to a store key
const callbackToStateMapping = {};

/**
 * Subscribes a react component's state directly to a store key
 *
 * @param {string} keyPattern
 * @param {string} statePropertyName the name of the property in the state to bind the data to
 * @param {string} path a specific path of the store object to map to the state
 * @param {mixed} defaultValue to return if the there is nothing from the store
 * @param {object} reactComponent whose setState() method will be called with any changed data
 * @returns {string} a guid to use when unsubscribing
 */
function subscribeToState(keyPattern, statePropertyName, path, defaultValue, reactComponent) {
    const subscriptionID = lastSubscriptionID++;
    callbackToStateMapping[subscriptionID] = {
        keyPattern,
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
function unsubscribeFromState(subscriptionID) {
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

    // Trigger any callbacks that were added with subscribe()
    _.each(callbackMapping, (callbacks, keyPattern) => {
        const regex = RegExp(keyPattern);

        // If there is a callback whose regex matches the key that was changed, then the callback for that regex
        // is called and passed the data that changed
        if (regex.test(key)) {
            _.each(callbacks, cb => cb(data));
        }
    });

    // Find components that were added with subscribeToState() and trigger their setState() method with the new data
    _.each(callbackToStateMapping, (mappedComponent) => {
        const regex = RegExp(mappedComponent.keyPattern);

        // If there is a callback whose regex matches the key that was changed, then the callback for that regex
        // is called and passed the data that changed
        if (regex.test(key)) {
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
    // The storage event doesn't trigger for the current window, so just call keyChanged() manually to mimic
    // the storage event
    keyChanged(key, val);

    // Write the thing to persistent storage, which will trigger a storage event for any other tabs open on this domain
    return PersistentStorage.set(key, val);
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
    return PersistentStorage.get(key)
        .then((val) => {
            if (extraPath) {
                return lodashGet(val, extraPath, defaultValue);
            }
            return val;
        });
}

/**
 * Get multiple keys of data
 *
 * @param {string[]} keys
 * @returns {Promise}
 */
function multiGet(keys) {
    return PersistentStorage.multiGet(keys);
}

/**
 * Sets multiple keys and values. Example
 * Store.multiSet({'key1': 'a', 'key2': 'b'});
 *
 * @param {object} data
 * @returns {Promise}
 */
function multiSet(data) {
    return PersistentStorage.multiSet(data)
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
    return PersistentStorage.clear();
}

/**
 * Merge a new value into an existing value at a key
 *
 * @param {string} key
 * @param {string} val
 * @returns {Promise}
 */
function merge(key, val) {
    return PersistentStorage.merge(key, val);
}

export {
    subscribe,
    unsubscribe,
    subscribeToState,
    unsubscribeFromState,
    set,
    multiSet,
    get,
    multiGet,
    merge,
    clear,
    init
};
