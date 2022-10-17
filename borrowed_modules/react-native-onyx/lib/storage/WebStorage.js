import _ from 'underscore';
import Storage from './providers/LocalForage';

const SYNC_ONYX = 'SYNC_ONYX';

/**
 * Raise an event thorough `localStorage` to let other tabs know a value changed
 * @param {String} onyxKey
 */
function raiseStorageSyncEvent(onyxKey) {
    global.localStorage.setItem(SYNC_ONYX, onyxKey);
    global.localStorage.removeItem(SYNC_ONYX, onyxKey);
}

const webStorage = {
    ...Storage,

    /**
     * Contains keys for which we want to disable sync event across tabs.
     * @param {String[]} keysToDisableSyncEvents
     * Storage synchronization mechanism keeping all opened tabs in sync
     * @param {function(key: String, data: *)} onStorageKeyChanged
     */
    keepInstancesSync(keysToDisableSyncEvents, onStorageKeyChanged) {
        // Override set, remove and clear to raise storage events that we intercept in other tabs
        this.setItem = (key, value) => Storage.setItem(key, value)
            .then(() => raiseStorageSyncEvent(key));

        this.removeItem = key => Storage.removeItem(key)
            .then(() => raiseStorageSyncEvent(key));

        // If we just call Storage.clear other tabs will have no idea which keys were available previously
        // so that they can call keysChanged for them. That's why we iterate and remove keys one by one
        this.clear = () => Storage.getAllKeys()
            .then(keys => _.map(keys, key => this.removeItem(key)))
            .then(tasks => Promise.all(tasks));

        // This listener will only be triggered by events coming from other tabs
        global.addEventListener('storage', (event) => {
            // Ignore events that don't originate from the SYNC_ONYX logic
            if (event.key !== SYNC_ONYX || !event.newValue) {
                return;
            }

            const onyxKey = event.newValue;
            if (_.contains(keysToDisableSyncEvents, onyxKey)) {
                return;
            }

            Storage.getItem(onyxKey)
                .then(value => onStorageKeyChanged(onyxKey, value));
        });
    },
};

export default webStorage;
