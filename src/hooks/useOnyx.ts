import isEmpty from 'lodash/isEmpty';
import isPlainObject from 'lodash/isPlainObject';
import {use, useMemo} from 'react';
import type {DependencyList} from 'react';
// eslint-disable-next-line no-restricted-imports
import {useOnyx as originalUseOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry, OnyxKey, OnyxValue, UseOnyxOptions, UseOnyxResult} from 'react-native-onyx';
import {SearchContext} from '@components/Search/SearchContext';
import {useIsOnSearch} from '@components/Search/SearchScopeProvider';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

type OriginalUseOnyx = typeof originalUseOnyx;

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
const useOnyx: OriginalUseOnyx = <TKey extends OnyxKey, TReturnValue = OnyxValue<TKey>>(key: TKey, options?: UseOnyxOptions<TKey, TReturnValue>, dependencies?: DependencyList) => {
    const isSnapshotCompatibleKey = useMemo(() => !key.startsWith(ONYXKEYS.COLLECTION.SNAPSHOT) && CONST.SEARCH.SNAPSHOT_ONYX_KEYS.some((snapshotKey) => key.startsWith(snapshotKey)), [key]);
    const isOnSearch = useIsOnSearch();

    let currentSearchHash: number | undefined;
    if (isOnSearch && isSnapshotCompatibleKey) {
        const {currentSearchHash: searchContextCurrentSearchHash} = use(SearchContext);
        currentSearchHash = searchContextCurrentSearchHash;
    }

    const useOnyxOptions = options as UseOnyxOptions<OnyxKey, OnyxValue<OnyxKey>> | undefined;
    const {selector, ...optionsWithoutSelector} = useOnyxOptions ?? {};

    // Original Onyx
    const originalOnyxOptions: UseOnyxOptions<OnyxKey, OnyxValue<OnyxKey>> = {...optionsWithoutSelector, selector, allowDynamicKey: true};
    const originalResult = originalUseOnyx(key, originalOnyxOptions, dependencies);

    // Snapshot Onyx
    /**
     * React hooks cannot be called conditionally. Thus we always subscribe to the snapshot data
     * and if shouldUseSnapshot is false then the selector always returns false as the data so we don't cause unnecessary renders
     * similarly canBeMissing is set to true to avoid falsy warnings.
     */
    const shouldUseSnapshot = isOnSearch && !!currentSearchHash && isSnapshotCompatibleKey;
    const snapshotSelector = useMemo(() => {
        if (!shouldUseSnapshot) {
            return () => false;
        }

        if (!selector) {
            return (data: OnyxValue<OnyxKey> | undefined) => getKeyData(data as SearchResults, key) as OnyxValue<OnyxKey>;
        }

        return (data: OnyxValue<OnyxKey> | undefined) => selector(getKeyData(data as SearchResults, key));
    }, [shouldUseSnapshot, selector, key]);
    const snapshotOnyxOptions: UseOnyxOptions<OnyxKey, OnyxValue<OnyxKey>> = {
        ...optionsWithoutSelector,
        selector: snapshotSelector,
        allowDynamicKey: true,
        canBeMissing: shouldUseSnapshot ? optionsWithoutSelector.canBeMissing : true,
    };
    const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchHash}` as OnyxKey;
    const snapshotResult = originalUseOnyx(snapshotKey, snapshotOnyxOptions, dependencies);

    const result = useMemo((): UseOnyxResult<TReturnValue> => {
        // Merge snapshot data with live data if possible
        if (shouldUseSnapshot) {
            if (isPlainObject(originalResult[0]) && isPlainObject(snapshotResult[0])) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return [{...(snapshotResult[0] as Record<string, any>), ...(originalResult[0] as Record<string, any>)}, originalResult[1]] as UseOnyxResult<TReturnValue>;
            }

            if (isEmpty(snapshotResult[0])) {
                return originalResult as UseOnyxResult<TReturnValue>;
            }

            return snapshotResult as UseOnyxResult<TReturnValue>;
        }

        return originalResult as UseOnyxResult<TReturnValue>;
    }, [shouldUseSnapshot, originalResult, snapshotResult]);

    return result;
};

export default useOnyx;
