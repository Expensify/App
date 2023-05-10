import _ from 'underscore';
import Onyx from 'react-native-onyx';

import Log from '../Log';
import ONYXKEYS from '../../ONYXKEYS';
import getPlatform from '../getPlatform';
import CONST from '../../CONST';

/**
 * Test whether the current platform is eligible for migration
 * This migration is only applicable for desktop/web
 * We're also skipping logged-out users as there would be nothing to migrate
 *
 * @returns {Boolean}
 */
function shouldMigrate() {
    const isTargetPlatform = _.contains([CONST.PLATFORM.WEB, CONST.PLATFORM.DESKTOP], getPlatform());
    if (!isTargetPlatform) {
        Log.info('[Migrate Onyx] Skipped migration MoveToIndexedDB (Not applicable to current platform)');
        return false;
    }

    const session = window.localStorage.getItem(ONYXKEYS.SESSION);
    if (!session || !session.includes('authToken')) {
        Log.info('[Migrate Onyx] Skipped migration MoveToIndexedDB (Not applicable to logged out users)');
        return false;
    }

    return true;
}

/**
 * Find Onyx data and move it from local storage to IndexedDB
 *
 * @returns {Promise<void>}
 */
function applyMigration() {
    const onyxKeys = new Set(_.values(ONYXKEYS));
    const onyxCollections = _.values(ONYXKEYS.COLLECTION);

    // Prepare a key-value dictionary of keys eligible for migration
    // Targeting existing Onyx keys in local storage or any key prefixed by a collection name
    const dataToMigrate = _.chain(window.localStorage)
        .keys()
        .filter(key => onyxKeys.has(key) || _.some(onyxCollections, collectionKey => key.startsWith(collectionKey)))
        .map(key => [key, JSON.parse(window.localStorage.getItem(key))])
        .object()
        .value();

    // Move the data in Onyx and only then delete it from local storage
    return Onyx.multiSet(dataToMigrate)
        .then(() => _.each(dataToMigrate, (value, key) => window.localStorage.removeItem(key)));
}

/**
 * Migrate Web/Desktop storage to IndexedDB
 *
 * @returns {Promise}
 */
export default function () {
    if (!shouldMigrate()) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        applyMigration()
            .then(() => {
                Log.info('[Migrate Onyx] Ran migration MoveToIndexedDB');
                resolve();
            })
            .catch((e) => {
                Log.alert('[Migrate Onyx] MoveToIndexedDB failed', {error: e.message, stack: e.stack}, false);
                reject(e);
            });
    });
}
