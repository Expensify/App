import {SearchQueryContext, SearchShouldUseLiveDataContext} from '@components/Search/SearchContext';
import {useIsOnSearch} from '@components/Search/SearchScopeProvider';

import isSnapshotCompatibleKey from '@libs/SnapshotUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry, OnyxKey, OnyxValue, UseOnyxOptions, UseOnyxResult} from 'react-native-onyx';

import {use} from 'react';
// eslint-disable-next-line no-restricted-imports
import {useOnyx as useOnyxWithoutSnapshots} from 'react-native-onyx';

type UseOnyxWithoutSnapshots = typeof useOnyxWithoutSnapshots;

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
    return snapshotData?.data?.[key as keyof SearchResults['data']] as TReturnValue;
};

/**
 * Custom hook for accessing and subscribing to Onyx data with search snapshot support
 */
const useOnyx: UseOnyxWithoutSnapshots = <TKey extends OnyxKey, TReturnValue = OnyxValue<TKey>>(key: TKey, options?: UseOnyxOptions<TKey, TReturnValue>) => {
    const isSnapshotCompatible = isSnapshotCompatibleKey(key, CONST.SEARCH.SNAPSHOT_ONYX_KEYS);
    const isOnSearch = useIsOnSearch();

    let currentSearchHash: number | undefined;
    let shouldUseLiveData = false;
    if (isOnSearch && isSnapshotCompatible) {
        const {currentSearchHash: searchContextCurrentSearchHash} = use(SearchQueryContext);
        currentSearchHash = searchContextCurrentSearchHash;
        shouldUseLiveData = use(SearchShouldUseLiveDataContext);
    }

    const useOnyxOptions = options as UseOnyxOptions<OnyxKey, OnyxValue<OnyxKey>> | undefined;
    const {selector: selectorProp, ...optionsWithoutSelector} = useOnyxOptions ?? {};

    // Determine if we should use snapshot data based on search state and key
    const shouldUseSnapshot = isOnSearch && !!currentSearchHash && isSnapshotCompatible && !shouldUseLiveData;

    // Selects the key out of the snapshot, so a write to another snapshot key does not re-render the reader.
    const selector = !shouldUseSnapshot
        ? selectorProp
        : (data: OnyxValue<OnyxKey> | undefined) => {
              const keyData = getKeyData<OnyxKey, OnyxValue<OnyxKey>>(data as SearchResults, key);
              return selectorProp ? selectorProp(keyData) : keyData;
          };

    const onyxOptions: UseOnyxOptions<OnyxKey, OnyxValue<OnyxKey>> = {...optionsWithoutSelector, selector};
    const snapshotKey = shouldUseSnapshot ? (`${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchHash}` as OnyxKey) : key;

    return useOnyxWithoutSnapshots(snapshotKey, onyxOptions) as UseOnyxResult<TReturnValue>;
};

export default useOnyx;
