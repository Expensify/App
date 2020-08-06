/**
 * This module is an abstraction around a persistent storage system. This file can be modified to use whatever
 * persistent storage method is desired.
 */

/**
 * Get a key from storage
 *
 * @param {string} key
 */
function get(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {
    console.error(`Could not parse value from local storage. Key: ${key}`);
  }
}

/**
 * Write a key to storage
 *
 * @param {string} key
 * @param {mixed} val
 */
function set(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

/**
 * Empty out the storage (like when the user signs out)
 */
function clear() {
  localStorage.clear();
}

export {get, set, clear};
