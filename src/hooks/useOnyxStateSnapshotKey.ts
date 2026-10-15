import {SearchQueryContext, SearchResultsContext} from '@components/Search/SearchContext';
import {useIsOnSearch} from '@components/Search/SearchScopeProvider';

import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxKey, OnyxStateView, OnyxValue} from 'react-native-onyx';

import {use} from 'react';

type SnapshotKey = `${typeof ONYXKEYS.COLLECTION.SNAPSHOT}${number}`;

/**
 * Returns the Search snapshot key that `@hooks/useOnyx` would read snapshot-compatible keys from, or undefined when
 * live data is used. `useOnyxState` selectors pass it to `getSnapshotAwareValue` to keep the same data source.
 */
function useOnyxStateSnapshotKey(): SnapshotKey | undefined {
    const isOnSearch = useIsOnSearch();
    const {currentSearchHash} = use(SearchQueryContext);
    const {shouldUseLiveData} = use(SearchResultsContext);
    if (!isOnSearch || !currentSearchHash || shouldUseLiveData) {
        return undefined;
    }
    return `${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchHash}`;
}

/** Only for snapshot-compatible member keys (report, report actions, policy, transaction...). */
function getSnapshotAwareValue<TKey extends OnyxKey>(state: OnyxStateView, snapshotKey: SnapshotKey | undefined, key: TKey): OnyxValue<TKey> {
    if (!snapshotKey) {
        return state[key];
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return state[snapshotKey]?.data?.[key as keyof NonNullable<OnyxValue<SnapshotKey>>['data']] as OnyxValue<TKey>;
}

export default useOnyxStateSnapshotKey;
export {getSnapshotAwareValue};
export type {SnapshotKey};
