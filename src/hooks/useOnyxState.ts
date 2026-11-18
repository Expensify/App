import {SearchQueryContext, SearchResultsContext} from '@components/Search/SearchContext';
import {useIsOnSearch} from '@components/Search/SearchScopeProvider';

import isSnapshotCompatibleKey from '@libs/SnapshotUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

import type {OnyxKey, OnyxStateView, UseOnyxStateOptions, UseOnyxStateSelector} from 'react-native-onyx';

import {use} from 'react';
// eslint-disable-next-line no-restricted-imports -- this wrapper is the one place that may import the Onyx hook
import {useOnyxState as useOnyxStateWithoutSnapshots} from 'react-native-onyx';

import {getKeyData} from './useOnyx';

type SnapshotKey = `${typeof ONYXKEYS.COLLECTION.SNAPSHOT}${string}`;

const collectionsBySnapshotData = new WeakMap<NonNullable<SearchResults['data']>, Map<OnyxKey, unknown>>();

function getSnapshotKeyData(snapshot: SearchResults | undefined, key: OnyxKey): unknown {
    const data = snapshot?.data;
    if (!snapshot || !data) {
        return undefined;
    }
    if (!key.endsWith('_')) {
        return getKeyData<OnyxKey, unknown>(snapshot, key);
    }

    let collections = collectionsBySnapshotData.get(data);
    if (!collections) {
        collections = new Map();
        collectionsBySnapshotData.set(data, collections);
    }
    if (!collections.has(key)) {
        collections.set(key, getKeyData<OnyxKey, unknown>(snapshot, key));
    }
    return collections.get(key);
}

function createSnapshotStateView(state: OnyxStateView, snapshotKey: SnapshotKey): OnyxStateView {
    const read = (key: string | symbol): unknown => {
        if (typeof key !== 'string') {
            return undefined;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- a state view takes any string and returns undefined for a key Onyx does not hold
        const onyxKey = key as OnyxKey;
        if (!isSnapshotCompatibleKey(onyxKey, CONST.SEARCH.SNAPSHOT_ONYX_KEYS)) {
            return state[onyxKey];
        }
        return getSnapshotKeyData(state[snapshotKey], onyxKey);
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the Proxy answers every key, which the type of its empty target cannot express
    return new Proxy(
        {},
        {
            get: (_target, key) => read(key),
            has: (_target, key) => read(key) !== undefined,
            set: () => false,
            deleteProperty: () => false,
        },
    ) as OnyxStateView;
}

function useSearchSnapshotKey(shouldUseLiveData: boolean): SnapshotKey | undefined {
    const isOnSearch = useIsOnSearch();
    if (!isOnSearch || shouldUseLiveData) {
        return undefined;
    }

    const {currentSearchHash} = use(SearchQueryContext);
    const {shouldUseLiveData: shouldScreenUseLiveData} = use(SearchResultsContext);
    if (!currentSearchHash || shouldScreenUseLiveData) {
        return undefined;
    }
    return `${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchHash}`;
}

type UseOnyxStateWithSnapshotsOptions<T> = UseOnyxStateOptions<T> & {
    shouldUseLiveData?: boolean;
};

function useOnyxState<T>(selector: UseOnyxStateSelector<T>, options?: UseOnyxStateWithSnapshotsOptions<T>): T {
    const {shouldUseLiveData = false, ...onyxOptions} = options ?? {};
    const snapshotKey = useSearchSnapshotKey(shouldUseLiveData);

    const snapshotAwareSelector: UseOnyxStateSelector<T> = snapshotKey
        ? (state, previousState) => selector(createSnapshotStateView(state, snapshotKey), previousState && createSnapshotStateView(previousState, snapshotKey))
        : selector;

    return useOnyxStateWithoutSnapshots(snapshotAwareSelector, onyxOptions);
}

export default useOnyxState;
