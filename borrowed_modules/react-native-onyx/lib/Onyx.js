import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import lodashMerge from 'lodash/merge';
import lodashGet from 'lodash/get';
import Storage from './storage';
import * as Logger from './Logger';
import cache from './OnyxCache';
import createDeferredTask from './createDeferredTask';
import mergeWithCustomized from './mergeWithCustomized';

// Keeps track of the last connectionID that was used so we can keep incrementing it
let lastConnectionID = 0;

// Holds a mapping of all the react components that want their state subscribed to a store key
const callbackToStateMapping = {};

// Stores all of the keys that Onyx can use. Must be defined in init().
let onyxKeys = {};

// Holds a list of keys that have been directly subscribed to or recently modified from least to most recent
let recentlyAccessedKeys = [];

// Holds a list of keys that are safe to remove when we reach max storage. If a key does not match with
// whatever appears in this list it will NEVER be a candidate for eviction.
let evictionAllowList = [];

// Holds a map of keys and connectionID arrays whose keys will never be automatically evicted as
// long as we have at least one subscriber that returns false for the canEvict property.
const evictionBlocklist = {};

// Optional user-provided key value states set when Onyx initializes or clears
let defaultKeyStates = {};

// Connections can be made before `Onyx.init`. They would wait for this task before resolving
const deferredInitTask = createDeferredTask();

/**
 * Get some data from the store
 *
 * @private
 * @param {string} key
 * @returns {Promise<*>}
 */
function get(key) {
    // When we already have the value in cache - resolve right away
    if (cache.hasCacheForKey(key)) {
        return Promise.resolve(cache.getValue(key));
    }

    const taskName = `get:${key}`;

    // When a value retrieving task for this key is still running hook to it
    if (cache.hasPendingTask(taskName)) {
        return cache.getTaskPromise(taskName);
    }

    // Otherwise retrieve the value from storage and capture a promise to aid concurrent usages
    const promise = Storage.getItem(key)
        .then((val) => {
            cache.set(key, val);
            return val;
        })
        .catch(err => Logger.logInfo(`Unable to get item from persistent storage. Key: ${key} Error: ${err}`));

    return cache.captureTask(taskName, promise);
}

/**
 * Returns current key names stored in persisted storage
 * @private
 * @returns {Promise<string[]>}
 */
function getAllKeys() {
    // When we've already read stored keys, resolve right away
    const storedKeys = cache.getAllKeys();
    if (storedKeys.length > 0) {
        return Promise.resolve(storedKeys);
    }

    const taskName = 'getAllKeys';

    // When a value retrieving task for all keys is still running hook to it
    if (cache.hasPendingTask(taskName)) {
        return cache.getTaskPromise(taskName);
    }

    // Otherwise retrieve the keys from storage and capture a promise to aid concurrent usages
    const promise = Storage.getAllKeys()
        .then((keys) => {
            _.each(keys, key => cache.addKey(key));
            return keys;
        });

    return cache.captureTask(taskName, promise);
}

/**
 * Checks to see if the a subscriber's supplied key
 * is associated with a collection of keys.
 *
 * @private
 * @param {String} key
 * @returns {Boolean}
 */
function isCollectionKey(key) {
    return _.contains(_.values(onyxKeys.COLLECTION), key);
}

/**
 * Checks to see if a given key matches with the
 * configured key of our connected subscriber
 *
 * @private
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
 * @private
 * @param {String} testKey
 * @returns {Boolean}
 */
function isSafeEvictionKey(testKey) {
    return _.some(evictionAllowList, key => isKeyMatch(key, testKey));
}

/**
 * Remove a key from the recently accessed key list.
 *
 * @private
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
 * @private
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
 * @private
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
 * @private
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
 * Take all the keys that are safe to evict and add them to
 * the recently accessed list when initializing the app. This
 * enables keys that have not recently been accessed to be
 * removed.
 *
 * @private
 * @returns {Promise}
 */
function addAllSafeEvictionKeysToRecentlyAccessedList() {
    return getAllKeys()
        .then((keys) => {
            _.each(evictionAllowList, (safeEvictionKey) => {
                _.each(keys, (key) => {
                    if (!isKeyMatch(safeEvictionKey, key)) {
                        return;
                    }
                    addLastAccessedKey(key);
                });
            });
        });
}

/**
 * @private
 * @param {String} collectionKey
 * @returns {Object}
 */
function getCachedCollection(collectionKey) {
    const collectionMemberKeys = _.filter(cache.getAllKeys(), (
        storedKey => isKeyMatch(collectionKey, storedKey)
    ));

    return _.reduce(collectionMemberKeys, (prev, curr) => {
        const cachedValue = cache.getValue(curr);
        if (!cachedValue) {
            return prev;
        }

        // eslint-disable-next-line no-param-reassign
        prev[curr] = cachedValue;
        return prev;
    }, {});
}

/**
 * When a collection of keys change, search for any callbacks matching the collection key and trigger those callbacks
 *
 * @private
 * @param {String} collectionKey
 * @param {Object} collection
 */
function keysChanged(collectionKey, collection) {
    // Find all subscribers that were added with connect() and trigger the callback or setState() with the new data
    _.each(callbackToStateMapping, (subscriber) => {
        if (!subscriber) {
            return;
        }

        /**
         * e.g. Onyx.connect({key: ONYXKEYS.COLLECTION.REPORT, callback: ...});
         */
        const isSubscribedToCollectionKey = isKeyMatch(subscriber.key, collectionKey)
            && isCollectionKey(subscriber.key);

        /**
         * e.g. Onyx.connect({key: `${ONYXKEYS.COLLECTION.REPORT}{reportID}`, callback: ...});
         */
        const isSubscribedToCollectionMemberKey = subscriber.key.startsWith(collectionKey);

        if (isSubscribedToCollectionKey) {
            if (_.isFunction(subscriber.callback)) {
                const cachedCollection = getCachedCollection(collectionKey);

                if (subscriber.waitForCollectionCallback) {
                    subscriber.callback(cachedCollection);
                    return;
                }

                _.each(collection, (data, dataKey) => {
                    subscriber.callback(cachedCollection[dataKey], dataKey);
                });
            } else if (subscriber.withOnyxInstance) {
                subscriber.withOnyxInstance.setState((prevState) => {
                    const finalCollection = _.clone(prevState[subscriber.statePropertyName] || {});
                    _.each(collection, (data, dataKey) => {
                        if (finalCollection[dataKey]) {
                            lodashMerge(finalCollection[dataKey], data);
                        } else {
                            finalCollection[dataKey] = data;
                        }
                    });

                    return {
                        [subscriber.statePropertyName]: finalCollection,
                    };
                });
            }
        } else if (isSubscribedToCollectionMemberKey) {
            const dataFromCollection = collection[subscriber.key];

            // If `dataFromCollection` happens to not exist, then return early so that there are no unnecessary
            // re-renderings of the component
            if (_.isUndefined(dataFromCollection)) {
                return;
            }

            subscriber.withOnyxInstance.setState(prevState => ({
                [subscriber.statePropertyName]: _.isObject(dataFromCollection)
                    ? {
                        ...prevState[subscriber.statePropertyName],
                        ...dataFromCollection,
                    }
                    : dataFromCollection,
            }));
        }
    });
}

/**
 * When a key change happens, search for any callbacks matching the key or collection key and trigger those callbacks
 *
 * @private
 * @param {String} key
 * @param {*} data
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
        if (!subscriber || !isKeyMatch(subscriber.key, key)) {
            return;
        }

        if (_.isFunction(subscriber.callback)) {
            if (subscriber.waitForCollectionCallback) {
                const cachedCollection = getCachedCollection(subscriber.key);
                cachedCollection[key] = data;
                subscriber.callback(cachedCollection);
                return;
            }

            subscriber.callback(data, key);
            return;
        }

        if (!subscriber.withOnyxInstance) {
            return;
        }

        // Check if we are subscribing to a collection key and add this item as a collection
        if (isCollectionKey(subscriber.key)) {
            subscriber.withOnyxInstance.setState((prevState) => {
                const collection = _.clone(prevState[subscriber.statePropertyName] || {});
                collection[key] = data;
                return {
                    [subscriber.statePropertyName]: collection,
                };
            });
        } else {
            subscriber.withOnyxInstance.setState({
                [subscriber.statePropertyName]: data,
            });
        }
    });
}

/**
 * Sends the data obtained from the keys to the connection. It either:
 *     - sets state on the withOnyxInstances
 *     - triggers the callback function
 *
 * @private
 * @param {object} config
 * @param {object} [config.withOnyxInstance]
 * @param {string} [config.statePropertyName]
 * @param {function} [config.callback]
 * @param {*|null} val
 * @param {String} key
 */
function sendDataToConnection(config, val, key) {
    // If the mapping no longer exists then we should not send any data.
    // This means our subscriber disconnected or withOnyx wrapped component unmounted.
    if (!callbackToStateMapping[config.connectionID]) {
        return;
    }

    if (config.withOnyxInstance) {
        config.withOnyxInstance.setWithOnyxState(config.statePropertyName, val);
    } else if (_.isFunction(config.callback)) {
        config.callback(val, key);
    }
}

/**
 * Subscribes a react component's state directly to a store key
 *
 * @example
 * const connectionID = Onyx.connect({
 *     key: ONYXKEYS.SESSION,
 *     callback: onSessionChange,
 * });
 *
 * @param {Object} mapping the mapping information to connect Onyx to the components state
 * @param {String} mapping.key ONYXKEY to subscribe to
 * @param {String} [mapping.statePropertyName] the name of the property in the state to connect the data to
 * @param {Object} [mapping.withOnyxInstance] whose setState() method will be called with any changed data
 *      This is used by React components to connect to Onyx
 * @param {Function} [mapping.callback] a method that will be called with changed data
 *      This is used by any non-React code to connect to Onyx
 * @param {Boolean} [mapping.initWithStoredValues] If set to false, then no data will be prefilled into the
 *  component
 * @param {Boolean} [mapping.waitForCollectionCallback] If set to true, it will return the entire collection to the callback as a single object
 * @returns {Number} an ID to use when calling disconnect
 */
function connect(mapping) {
    const connectionID = lastConnectionID++;
    callbackToStateMapping[connectionID] = mapping;
    callbackToStateMapping[connectionID].connectionID = connectionID;

    if (mapping.initWithStoredValues === false) {
        return connectionID;
    }

    // Commit connection only after init passes
    deferredInitTask.promise
        .then(() => {
            // Check to see if this key is flagged as a safe eviction key and add it to the recentlyAccessedKeys list
            if (!isSafeEvictionKey(mapping.key)) {
                return;
            }

            // Try to free some cache whenever we connect to a safe eviction key
            cache.removeLeastRecentlyUsedKeys();

            if (mapping.withOnyxInstance && !isCollectionKey(mapping.key)) {
                // All React components subscribing to a key flagged as a safe eviction
                // key must implement the canEvict property.
                if (_.isUndefined(mapping.canEvict)) {
                    throw new Error(
                        `Cannot subscribe to safe eviction key '${mapping.key}' without providing a canEvict value.`,
                    );
                }

                addLastAccessedKey(mapping.key);
            }
        })
        .then(getAllKeys)
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
            if ((mapping.withOnyxInstance && isCollectionKey(mapping.key)) || mapping.waitForCollectionCallback) {
                Promise.all(_.map(matchingKeys, key => get(key)))
                    .then(values => _.reduce(values, (finalObject, value, i) => {
                        // eslint-disable-next-line no-param-reassign
                        finalObject[matchingKeys[i]] = value;
                        return finalObject;
                    }, {}))
                    .then(val => sendDataToConnection(mapping, val));
            } else {
                _.each(matchingKeys, (key) => {
                    get(key).then(val => sendDataToConnection(mapping, val, key));
                });
            }
        });

    return connectionID;
}

/**
 * Remove the listener for a react component
 * @example
 * Onyx.disconnect(connectionID);
 *
 * @param {Number} connectionID unique id returned by call to Onyx.connect()
 * @param {String} [keyToRemoveFromEvictionBlocklist]
 */
function disconnect(connectionID, keyToRemoveFromEvictionBlocklist) {
    if (!callbackToStateMapping[connectionID]) {
        return;
    }

    // Remove this key from the eviction block list as we are no longer
    // subscribing to it and it should be safe to delete again
    if (keyToRemoveFromEvictionBlocklist) {
        removeFromEvictionBlockList(keyToRemoveFromEvictionBlocklist, connectionID);
    }

    delete callbackToStateMapping[connectionID];
}

/**
 * This method mostly exists for historical reasons as this library was initially designed without a memory cache and one was added later.
 * For this reason, Onyx works more similar to what you might expect from a native AsyncStorage with reads, writes, etc all becoming
 * available async. Since we have code in our main applications that might expect things to work this way it's not safe to change this
 * behavior just yet.
 *
 * @param {String} key
 * @param {*} value
 */
// eslint-disable-next-line rulesdir/no-negated-variables
function notifySubscribersOnNextTick(key, value) {
    Promise.resolve().then(() => keyChanged(key, value));
}

/**
 * Remove a key from Onyx and update the subscribers
 *
 * @private
 * @param {String} key
 * @return {Promise}
 */
function remove(key) {
    // Cache the fact that the value was removed
    cache.set(key, null);
    notifySubscribersOnNextTick(key, null);
    return Storage.removeItem(key);
}

/**
 * If we fail to set or merge we must handle this by
 * evicting some data from Onyx and then retrying to do
 * whatever it is we attempted to do.
 *
 * @private
 * @param {Error} error
 * @param {Function} onyxMethod
 * @param  {...any} args
 * @return {Promise}
 */
function evictStorageAndRetry(error, onyxMethod, ...args) {
    Logger.logInfo(`Handled error: ${error}`);

    if (error && Str.startsWith(error.message, 'Failed to execute \'put\' on \'IDBObjectStore\'')) {
        Logger.logAlert('Attempted to set invalid data set in Onyx. Please ensure all data is serializable.');
        throw error;
    }

    // Find the first key that we can remove that has no subscribers in our blocklist
    const keyForRemoval = _.find(recentlyAccessedKeys, key => !evictionBlocklist[key]);

    if (!keyForRemoval) {
        Logger.logAlert('Out of storage. But found no acceptable keys to remove.');
        throw error;
    }

    // Remove the least recently viewed key that is not currently being accessed and retry.
    Logger.logInfo(`Out of storage. Evicting least recently accessed key (${keyForRemoval}) and retrying.`);
    return remove(keyForRemoval)
        .then(() => onyxMethod(...args));
}

/**
 * Write a value to our store with the given key
 *
 * @param {String} key ONYXKEY to set
 * @param {*} value value to store
 *
 * @returns {Promise}
 */
function set(key, value) {
    // Logging properties only since values could be sensitive things we don't want to log
    Logger.logInfo(`set() called for key: ${key}${_.isObject(value) ? ` properties: ${_.keys(value).join(',')}` : ''}`);

    // eslint-disable-next-line no-use-before-define
    if (hasPendingMergeForKey(key)) {
        Logger.logAlert(`Onyx.set() called after Onyx.merge() for key: ${key}. It is recommended to use set() or merge() not both.`);
    }

    // Adds the key to cache when it's not available
    cache.set(key, value);
    notifySubscribersOnNextTick(key, value);

    // Write the thing to persistent storage, which will trigger a storage event for any other tabs open on this domain
    return Storage.setItem(key, value)
        .catch(error => evictStorageAndRetry(error, set, key, value));
}

/**
 * Storage expects array like: [["@MyApp_user", value_1], ["@MyApp_key", value_2]]
 * This method transforms an object like {'@MyApp_user': myUserValue, '@MyApp_key': myKeyValue}
 * to an array of key-value pairs in the above format
 * @private
 * @param {Record} data
 * @return {Array} an array of key - value pairs <[key, value]>
 */
function prepareKeyValuePairsForStorage(data) {
    return _.map(data, (value, key) => [key, value]);
}

/**
 * Sets multiple keys and values
 *
 * @example Onyx.multiSet({'key1': 'a', 'key2': 'b'});
 *
 * @param {Object} data object keyed by ONYXKEYS and the values to set
 * @returns {Promise}
 */
function multiSet(data) {
    const keyValuePairs = prepareKeyValuePairsForStorage(data);

    _.each(data, (val, key) => {
        // Update cache and optimistically inform subscribers on the next tick
        cache.set(key, val);
        notifySubscribersOnNextTick(key, val);
    });

    return Storage.multiSet(keyValuePairs)
        .catch(error => evictStorageAndRetry(error, multiSet, data));
}

// Key/value store of Onyx key and arrays of values to merge
const mergeQueue = {};

/**
 * @private
 * @param {String} key
 * @returns {Boolean}
 */
function hasPendingMergeForKey(key) {
    return Boolean(mergeQueue[key]);
}

/**
 * Given an Onyx key and value this method will combine all queued
 * value updates and return a single value. Merge attempts are
 * batched. They must occur after a single call to get() so we
 * can avoid race conditions.
 *
 * @private
 * @param {String} key
 * @param {*} data
 *
 * @returns {*}
 */
function applyMerge(key, data) {
    const mergeValues = mergeQueue[key];
    if (_.isArray(data) || _.every(mergeValues, _.isArray)) {
        // Array values will always just concatenate
        // more items onto the end of the array
        return _.reduce(mergeValues, (modifiedData, mergeValue) => [
            ...modifiedData,
            ...mergeValue,
        ], data || []);
    }

    if (_.isObject(data) || _.every(mergeValues, _.isObject)) {
        // Object values are merged one after the other
        return _.reduce(mergeValues, (modifiedData, mergeValue) => {
            const newData = mergeWithCustomized({}, modifiedData, mergeValue);

            // We will also delete any object keys that are undefined or null.
            // Deleting keys is not supported by AsyncStorage so we do it this way.
            // Remove all first level keys that are explicitly set to null.
            return _.omit(newData, (value, finalObjectKey) => _.isNull(mergeValue[finalObjectKey]));
        }, data || {});
    }

    // If we have anything else we can't merge it so we'll
    // simply return the last value that was queued
    return _.last(mergeValues);
}

/**
 * Merge a new value into an existing value at a key.
 *
 * The types of values that can be merged are `Object` and `Array`. To set another type of value use `Onyx.set()`. Merge
 * behavior uses lodash/merge under the hood for `Object` and simple concatenation for `Array`. However, it's important
 * to note that if you have an array value property on an `Object` that the default behavior of lodash/merge is not to
 * concatenate. See here: https://github.com/lodash/lodash/issues/2872
 *
 * Calls to `Onyx.merge()` are batched so that any calls performed in a single tick will stack in a queue and get
 * applied in the order they were called. Note: `Onyx.set()` calls do not work this way so use caution when mixing
 * `Onyx.merge()` and `Onyx.set()`.
 *
 * @example
 * Onyx.merge(ONYXKEYS.EMPLOYEE_LIST, ['Joe']); // -> ['Joe']
 * Onyx.merge(ONYXKEYS.EMPLOYEE_LIST, ['Jack']); // -> ['Joe', 'Jack']
 * Onyx.merge(ONYXKEYS.POLICY, {id: 1}); // -> {id: 1}
 * Onyx.merge(ONYXKEYS.POLICY, {name: 'My Workspace'}); // -> {id: 1, name: 'My Workspace'}
 *
 * @param {String} key ONYXKEYS key
 * @param {(Object|Array)} value Object or Array value to merge
 * @returns {Promise}
 */
function merge(key, value) {
    if (mergeQueue[key]) {
        mergeQueue[key].push(value);
        return Promise.resolve();
    }

    mergeQueue[key] = [value];
    return get(key)
        .then((data) => {
            try {
                const modifiedData = applyMerge(key, data);

                // Clean up the write queue so we
                // don't apply these changes again
                delete mergeQueue[key];

                return set(key, modifiedData);
            } catch (error) {
                Logger.logAlert(`An error occurred while applying merge for key: ${key}, Error: ${error}`);
            }

            return Promise.resolve();
        });
}

/**
 * Merge user provided default key value pairs.
 * @private
 * @returns {Promise}
 */
function initializeWithDefaultKeyStates() {
    return Storage.multiGet(_.keys(defaultKeyStates))
        .then((pairs) => {
            const asObject = _.object(pairs);

            const merged = mergeWithCustomized(asObject, defaultKeyStates);
            cache.merge(merged);
            _.each(merged, (val, key) => keyChanged(key, val));
        });
}

/**
 * Clear out all the data in the store
 *
 * Note that calling Onyx.clear() and then Onyx.set() on a key with a default
 * key state may store an unexpected value in Storage.
 *
 * E.g.
 * Onyx.clear();
 * Onyx.set(ONYXKEYS.DEFAULT_KEY, 'default');
 * Storage.getItem(ONYXKEYS.DEFAULT_KEY)
 *     .then((storedValue) => console.log(storedValue));
 * null is logged instead of the expected 'default'
 *
 * Onyx.set() might call Storage.setItem() before Onyx.clear() calls
 * Storage.setItem(). Use Onyx.merge() instead if possible. Onyx.merge() calls
 * Onyx.get(key) before calling Storage.setItem() via Onyx.set().
 * Storage.setItem() from Onyx.clear() will have already finished and the merged
 * value will be saved to storage after the default value.
 *
 * @returns {Promise<void>}
 */
function clear() {
    return getAllKeys()
        .then((keys) => {
            _.each(keys, (key) => {
                const resetValue = lodashGet(defaultKeyStates, key, null);
                cache.set(key, resetValue);
                notifySubscribersOnNextTick(key, resetValue);
            });
            return Storage.clear();
        });
}

/**
 * Merges a collection based on their keys
 *
 * @example
 *
 * Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, {
 *     [`${ONYXKEYS.COLLECTION.REPORT}1`]: report1,
 *     [`${ONYXKEYS.COLLECTION.REPORT}2`]: report2,
 * });
 *
 * @param {String} collectionKey e.g. `ONYXKEYS.COLLECTION.REPORT`
 * @param {Object} collection Object collection keyed by individual collection member keys and values
 * @returns {Promise}
 */
function mergeCollection(collectionKey, collection) {
    // Confirm all the collection keys belong to the same parent
    _.each(collection, (data, dataKey) => {
        if (isKeyMatch(collectionKey, dataKey)) {
            return;
        }

        throw new Error(`Provided collection doesn't have all its data belonging to the same parent. CollectionKey: ${collectionKey}, DataKey: ${dataKey}`);
    });

    return getAllKeys()
        .then((persistedKeys) => {
            // Split to keys that exist in storage and keys that don't
            const [existingKeys, newKeys] = _.chain(collection)
                .keys()
                .partition(key => persistedKeys.includes(key))
                .value();

            const existingKeyCollection = _.pick(collection, existingKeys);
            const newCollection = _.pick(collection, newKeys);
            const keyValuePairsForExistingCollection = prepareKeyValuePairsForStorage(existingKeyCollection);
            const keyValuePairsForNewCollection = prepareKeyValuePairsForStorage(newCollection);

            const promises = [];

            // New keys will be added via multiSet while existing keys will be updated using multiMerge
            // This is because setting a key that doesn't exist yet with multiMerge will throw errors
            if (keyValuePairsForExistingCollection.length > 0) {
                promises.push(Storage.multiMerge(keyValuePairsForExistingCollection));
            }

            if (keyValuePairsForNewCollection.length > 0) {
                promises.push(Storage.multiSet(keyValuePairsForNewCollection));
            }

            // Prefill cache if necessary by calling get() on any existing keys and then merge original data to cache
            // and update all subscribers
            Promise.all(_.map(existingKeys, get)).then(() => {
                cache.merge(collection);
                keysChanged(collectionKey, collection);
            });

            return Promise.all(promises)
                .catch(error => evictStorageAndRetry(error, mergeCollection, collection));
        });
}

/**
 * Insert API responses and lifecycle data into Onyx
 *
 * @param {Array} data An array of objects with shape {onyxMethod: oneOf('set', 'merge', 'mergeCollection'), key: string, value: *}
 */
function update(data) {
    // First, validate the Onyx object is in the format we expect
    _.each(data, ({onyxMethod, key}) => {
        if (!_.contains(['clear', 'set', 'merge', 'mergecollection'], onyxMethod)) {
            throw new Error(`Invalid onyxMethod ${onyxMethod} in Onyx update.`);
        }
        if (onyxMethod !== 'clear' && !_.isString(key)) {
            throw new Error(`Invalid ${typeof key} key provided in Onyx update. Onyx key must be of type string.`);
        }
    });

    _.each(data, ({onyxMethod, key, value}) => {
        switch (onyxMethod) {
            case 'set':
                set(key, value);
                break;
            case 'merge':
                merge(key, value);
                break;
            case 'mergecollection':
                mergeCollection(key, value);
                break;
            case 'clear':
                clear();
                break;
            default:
                break;
        }
    });
}

/**
 * Initialize the store with actions and listening for storage events
 *
 * @param {Object} [options={}] config object
 * @param {Object} [options.keys={}] `ONYXKEYS` constants object
 * @param {Object} [options.initialKeyStates={}] initial data to set when `init()` and `clear()` is called
 * @param {String[]} [options.safeEvictionKeys=[]] This is an array of keys
 * (individual or collection patterns) that when provided to Onyx are flagged
 * as "safe" for removal. Any components subscribing to these keys must also
 * implement a canEvict option. See the README for more info.
 * @param {Number} [options.maxCachedKeysCount=55] Sets how many recent keys should we try to keep in cache
 * Setting this to 0 would practically mean no cache
 * We try to free cache when we connect to a safe eviction key
 * @param {Boolean} [options.captureMetrics] Enables Onyx benchmarking and exposes the get/print/reset functions
 * @param {Boolean} [options.shouldSyncMultipleInstances] Auto synchronize storage events between multiple instances
 * of Onyx running in different tabs/windows. Defaults to true for platforms that support local storage (web/desktop)
 * @param {String[]} [option.keysToDisableSyncEvents=[]] Contains keys for which
 * we want to disable sync event across tabs.
 * @example
 * Onyx.init({
 *     keys: ONYXKEYS,
 *     initialKeyStates: {
 *         [ONYXKEYS.SESSION]: {loading: false},
 *     },
 * });
 */
function init({
    keys = {},
    initialKeyStates = {},
    safeEvictionKeys = [],
    maxCachedKeysCount = 1000,
    captureMetrics = false,
    shouldSyncMultipleInstances = Boolean(global.localStorage),
    keysToDisableSyncEvents = [],
} = {}) {
    if (captureMetrics) {
        // The code here is only bundled and applied when the captureMetrics is set
        // eslint-disable-next-line no-use-before-define
        applyDecorators();
    }

    if (maxCachedKeysCount > 0) {
        cache.setRecentKeysLimit(maxCachedKeysCount);
    }

    // Let Onyx know about all of our keys
    onyxKeys = keys;

    // Set our default key states to use when initializing and clearing Onyx data
    defaultKeyStates = initialKeyStates;

    // Let Onyx know about which keys are safe to evict
    evictionAllowList = safeEvictionKeys;

    // Initialize all of our keys with data provided then give green light to any pending connections
    Promise.all([
        addAllSafeEvictionKeysToRecentlyAccessedList(),
        initializeWithDefaultKeyStates(),
    ])
        .then(deferredInitTask.resolve);

    if (shouldSyncMultipleInstances && _.isFunction(Storage.keepInstancesSync)) {
        Storage.keepInstancesSync(keysToDisableSyncEvents, (key, value) => {
            cache.set(key, value);
            keyChanged(key, value);
        });
    }
}

const Onyx = {
    connect,
    disconnect,
    set,
    multiSet,
    merge,
    mergeCollection,
    update,
    clear,
    init,
    registerLogger: Logger.registerLogger,
    addToEvictionBlockList,
    removeFromEvictionBlockList,
    isSafeEvictionKey,
};

/**
 * Apply calls statistic decorators to benchmark Onyx
 *
 * @private
 */
function applyDecorators() {
    // We're requiring the script dynamically here so that it's only evaluated when decorators are used
    const decorate = require('./metrics');

    // Re-assign with decorated functions
    /* eslint-disable no-func-assign */
    get = decorate.decorateWithMetrics(get, 'Onyx:get');
    set = decorate.decorateWithMetrics(set, 'Onyx:set');
    multiSet = decorate.decorateWithMetrics(multiSet, 'Onyx:multiSet');
    clear = decorate.decorateWithMetrics(clear, 'Onyx:clear');
    merge = decorate.decorateWithMetrics(merge, 'Onyx:merge');
    mergeCollection = decorate.decorateWithMetrics(mergeCollection, 'Onyx:mergeCollection');
    getAllKeys = decorate.decorateWithMetrics(getAllKeys, 'Onyx:getAllKeys');
    initializeWithDefaultKeyStates = decorate.decorateWithMetrics(initializeWithDefaultKeyStates, 'Onyx:defaults');
    update = decorate.decorateWithMetrics(update, 'Onyx:update');
    /* eslint-enable */

    // Re-expose decorated methods
    /* eslint-disable rulesdir/prefer-actions-set-data */
    Onyx.set = set;
    Onyx.multiSet = multiSet;
    Onyx.clear = clear;
    Onyx.merge = merge;
    Onyx.mergeCollection = mergeCollection;
    Onyx.update = update;
    /* eslint-enable */

    // Expose stats methods on Onyx
    Onyx.getMetrics = decorate.getMetrics;
    Onyx.resetMetrics = decorate.resetMetrics;
    Onyx.printMetrics = decorate.printMetrics;
}

export default Onyx;
