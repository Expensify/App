import Log from '@libs/Log';

import CONST from '@src/CONST';
import type {SearchSnapshotOnyxKey} from '@src/CONST/runtimeDefaults';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxKey, OnyxValue} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

type SnapshotKey = SearchSnapshotOnyxKey extends infer TPrefix ? (TPrefix extends string ? `${TPrefix}${string}` : never) : never;

type ReadableOnyxKey = Exclude<OnyxKey, SnapshotKey>;

function isSnapshotCompatibleKey(key: OnyxKey): boolean {
    return !key.startsWith(ONYXKEYS.COLLECTION.SNAPSHOT) && CONST.SEARCH.SNAPSHOT_ONYX_KEYS.some((snapshotKey) => key.startsWith(snapshotKey));
}

/**
 * Reads an Onyx key once, without subscribing.
 *
 * The resolved value is the object the Onyx cache holds rather than a copy, so do not mutate it: a write
 * would be seen by every other reader of that key. That is a convention rather than a type rule, matching
 * `useOnyx`, which hands back the same object typed the same way.
 */
function get<TKey extends ReadableOnyxKey>(key: TKey): Promise<OnyxValue<TKey>> {
    if (isSnapshotCompatibleKey(key)) {
        if (__DEV__) {
            throw new Error(`OnyxUtils.get is not allowed for Search snapshot keys such as ${String(key)}. Use useOnyx instead.`);
        }

        Log.alert('OnyxUtils.get read a Search snapshot key, which useOnyx would have redirected', {key: String(key)});
    }

    // eslint-disable-next-line rulesdir/no-unsafe-onyx-read -- safe to call Onyx.get directly here
    return Onyx.get(key);
}

export type {ReadableOnyxKey};

export {isSnapshotCompatibleKey};

export default {
    get,
};
