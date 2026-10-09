import {SearchSnapshotHashContext} from '@components/Search/SearchContext';
import {useIsOnSearch} from '@components/Search/SearchScopeProvider';

import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxKey, OnyxValue} from 'react-native-onyx';

import {use} from 'react';
import Onyx from 'react-native-onyx';

import {getKeyData, isSnapshotCompatibleKey} from './useOnyx';

/**
 * Returns a reader for Search snapshot keys (CONST.SEARCH.SNAPSHOT_ONYX_KEYS) to call from event handlers such as `onPress`.
 * Inside a Search scope it reads the key from the active snapshot, as useOnyx does, without subscribing to it. The component
 * re-renders only when the active snapshot hash changes.
 *
 * Read other keys with Onyx.get(). Don't call the reader during render or in an effect: it reads once and never updates.
 * no-unsafe-onyx-read flags both.
 */
function useSnapshotOnyxGet() {
    const isOnSearch = useIsOnSearch();
    // Outside a Search scope, skip the context so a search change doesn't re-render the component
    const snapshotHash = isOnSearch ? use(SearchSnapshotHashContext) : undefined;

    return async <TKey extends OnyxKey>(key: TKey): Promise<OnyxValue<TKey>> => {
        if (!snapshotHash || !isSnapshotCompatibleKey(key)) {
            return Onyx.get(key);
        }

        const snapshot = await Onyx.get(`${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}`);
        return getKeyData<TKey, OnyxValue<TKey>>(snapshot, key);
    };
}

export default useSnapshotOnyxGet;
