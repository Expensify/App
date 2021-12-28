import _ from 'underscore';
import Onyx from 'react-native-onyx';

import Log from '../Log';
import ONYXKEYS from '../../ONYXKEYS';
import getPlatform from '../getPlatform';
import CONST from '../../CONST';

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

function migrate() {
    const multiSetData = {};
    const possibleKeys = _.union(_.values(ONYXKEYS), _.values(ONYXKEYS.COLLECTION));

    for (let i = 0; i < window.localStorage.length; i += 1) {
        const key = window.localStorage.key(i);
        if (_.some(possibleKeys, entry => key.startsWith(entry))) {
            const rawValue = window.localStorage.getItem(key);
            multiSetData[key] = rawValue && JSON.parse(rawValue);
        }
    }

    return Onyx.multiSet(multiSetData)
        .then(() => {
            _.each(multiSetData, (value, key) => window.localStorage.removeItem(key));
            Log.info('[Migrate Onyx] Ran migration MoveToIndexedDB');
        })
        .catch((e) => {
            Log.alert('[Migrate Onyx] MoveToIndexedDB failed', {error: e.message, stack: e.stack}, false);
            return Promise.reject(e);
        });
}

/**
 * This migration is only applicable for desktop/web
 * The migration moves user data from local storage to IndexedDb
 *
 * @returns {Promise}
 */
export default function () {
    if (!shouldMigrate()) {
        return Promise.resolve();
    }

    return migrate();
}
