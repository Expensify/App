import {SearchQueryContext} from '@components/Search/SearchContext';
import {useIsOnSearch} from '@components/Search/SearchScopeProvider';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry, OnyxKey, OnyxValue, UseOnyxOptions, UseOnyxResult} from 'react-native-onyx';

import {use} from 'react';
// eslint-disable-next-line no-restricted-imports
import {useOnyx as useOnyxWithoutSnapshots} from 'react-native-onyx';

type UseOnyxWithoutSnapshots = typeof useOnyxWithoutSnapshots;

const COLLECTION_VALUES = Object.values(ONYXKEYS.COLLECTION);
const getDataByPath = (data: SearchResults['data'], path: string) => {
    // Handle prefixed collections
    for (const collection of COLLECTION_VALUES) {
        if (path.startsWith(collection)) {
            const key = `${collection}${path.slice(collection.length)}`;
            return data?.[key as keyof typeof data];
        }
    }

    // Handle direct keys
    return data?.[path as keyof typeof data];
};

// Helper function to get key data from snapshot
const getKeyData = <TKey extends OnyxKey, TReturnValue>(snapshotData: SearchResults, key: TKey): TReturnValue => {
    if (key.endsWith('_')) {
        // Create object to store matching entries
        const result: OnyxCollection<TKey> = {};
        const prefix = key;

        // Get all keys that start with the prefix
        for (const [dataKey, value] of Object.entries(snapshotData?.data ?? {})) {
            if (!dataKey.startsWith(prefix)) {
                continue;
            }
            result[dataKey] = value as OnyxEntry<TKey>;
        }
        return (Object.keys(result).length > 0 ? result : undefined) as TReturnValue;
    }
    return getDataByPath(snapshotData?.data, key) as TReturnValue;
};

/**
 * Custom hook for accessing and subscribing to Onyx data with search snapshot support
 */
const useOnyx: UseOnyxWithoutSnapshots = <TKey extends OnyxKey, TReturnValue = OnyxValue<TKey>>(key: TKey, options?: UseOnyxOptions<TKey, TReturnValue>) => {
    const isSnapshotCompatibleKey = !key.startsWith(ONYXKEYS.COLLECTION.SNAPSHOT) && CONST.SEARCH.SNAPSHOT_ONYX_KEYS.some((snapshotKey) => key.startsWith(snapshotKey));
    const isOnSearch = useIsOnSearch();

    let currentSearchHash: number | undefined;
    let shouldUseLiveData = false;
    if (isOnSearch && isSnapshotCompatibleKey) {
        // Only the query context: reading the results context here would make every snapshot-keyed reader in Search
        // re-render on every snapshot write.
        const {currentSearchHash: searchContextCurrentSearchHash, shouldUseLiveData: contextShouldUseLiveData} = use(SearchQueryContext);
        currentSearchHash = searchContextCurrentSearchHash;
        shouldUseLiveData = !!contextShouldUseLiveData;
    }

    const useOnyxOptions = options as UseOnyxOptions<OnyxKey, OnyxValue<OnyxKey>> | undefined;
    const {selector: selectorProp, ...optionsWithoutSelector} = useOnyxOptions ?? {};

    // Determine if we should use snapshot data based on search state and key
    const shouldUseSnapshot = isOnSearch && !!currentSearchHash && isSnapshotCompatibleKey && !shouldUseLiveData;

    // A snapshot-routed read always hands Onyx a selector that extracts this key's slice, so Onyx compares that slice
    // (deep equality) and notifies the subscriber only when it changed. Subscribing to the whole snapshot and extracting
    // afterwards re-rendered every reader on every snapshot write, whether or not its own key had changed.
    let selector = selectorProp;
    if (shouldUseSnapshot) {
        selector = selectorProp
            ? (data: OnyxValue<OnyxKey> | undefined) => selectorProp(getKeyData(data as SearchResults, key))
            : (data: OnyxValue<OnyxKey> | undefined) => getKeyData(data as SearchResults, key);
    }

    const onyxOptions: UseOnyxOptions<OnyxKey, OnyxValue<OnyxKey>> = {...optionsWithoutSelector, selector};
    const snapshotKey = shouldUseSnapshot ? (`${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchHash}` as OnyxKey) : key;

    // With the selector above the snapshot-routed result is already this key's slice, so no extraction is needed here.
    return useOnyxWithoutSnapshots(snapshotKey, onyxOptions) as UseOnyxResult<TReturnValue>;
};

export default useOnyx;
