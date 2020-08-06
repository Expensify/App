import * as _ from 'lodash';
import * as PersistentStorage from '../lib/PersistentStorage.js';

// Holds all of the callbacks that have registered for a specific key pattern
const callbackMapping = {};

/**
 * Initialize the store with actions and listening for storage events
 */
function init() {
  // Subscribe to the storage event so changes to local storage can be captured
  window.addEventListener('storage', (e) => {
    try {
      keyChanged(e.key, JSON.parse(e.newValue));
    } catch (e) {
      console.error(`Could not parse value from local storage. Key: ${e.key}`);
    }
  });
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
  callbackMapping[keyPattern] = callbackMapping[keyPattern].filter(
    (existingCallback) => existingCallback !== cb,
  );
}

/**
 * When a key change happens, search for any callbacks matching the regex pattern and trigger those callbacks
 *
 * @param {string} key
 * @param {mixed} data
 */
function keyChanged(key, data) {
  for (const [keyPattern, callbacks] of Object.entries(callbackMapping)) {
    const regex = RegExp(keyPattern);

    // If there is a callback whose regex matches the key that was changed, then the callback for that regex
    // is called and passed the data that changed
    if (regex.test(key)) {
      for (let i = 0; i < callbacks.length; i++) {
        const callback = callbacks[i];
        callback(data);
      }
    }
  }
}

/**
 * Write a value to our store with the given key
 *
 * @param {string} key
 * @param {mixed} val
 */
function set(key, val) {
  // Write the thing to local storage, which will trigger a storage event for any other tabs open on this domain
  PersistentStorage.set(key, val);

  // The storage event doesn't trigger for the current window, so just call keyChanged() manually to mimic
  // the storage event
  keyChanged(key, val);
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
  const val = PersistentStorage.get(key);
  if (extraPath) {
    return _.get(val, extraPath, defaultValue);
  }
  return val;
}

export {subscribe, unsubscribe, set, get, init};
