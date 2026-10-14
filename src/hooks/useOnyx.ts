import {SearchSnapshotHashContext} from '@components/Search/SearchContext';
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
const getDataByPath = (data: SearchResults['data'] | undefined, path: string) => {
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
const getKeyData = <TKey extends OnyxKey, TReturnValue>(snapshotData: OnyxEntry<SearchResults>, key: TKey): TReturnValue => {
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

/** Whether useOnyx reads this key from the active snapshot inside a Search scope */
function isSnapshotCompatibleKey(key: OnyxKey): boolean {
    return !key.startsWith(ONYXKEYS.COLLECTION.SNAPSHOT) && CONST.SEARCH.SNAPSHOT_ONYX_KEYS.some((snapshotKey) => key.startsWith(snapshotKey));
}

/**
 * Resolves the final `useOnyx` result, extracting the specific key's data out of the search snapshot
 * when applicable.
 *
 * This is a standalone top-level function (rather than being inlined in the `useMemo` callback) because
 * OXC's React Compiler currently fails to compile a hook when a generic type cast referencing the hook's
 * own type parameters (e.g. `as UseOnyxResult<TReturnValue>`) appears inside a nested closure. That
 * bailout is silent (no build warning) and disables automatic memoization for the entire file.
 */
function resolveSnapshotAwareResult<TKey extends OnyxKey, TReturnValue>(
    shouldUseSnapshot: boolean,
    hasSelector: boolean,
    originalResult: UseOnyxResult<OnyxValue<OnyxKey>>,
    key: TKey,
): UseOnyxResult<TReturnValue> {
    if (!shouldUseSnapshot || hasSelector) {
        return originalResult as UseOnyxResult<TReturnValue>;
    }

    const keyData = getKeyData(originalResult[0] as SearchResults, key);
    return [keyData, originalResult[1]] as UseOnyxResult<TReturnValue>;
}

/**
 * Custom hook for accessing and subscribing to Onyx data with search snapshot support
 */
const useOnyx: UseOnyxWithoutSnapshots = <TKey extends OnyxKey, TReturnValue = OnyxValue<TKey>>(key: TKey, options?: UseOnyxOptions<TKey, TReturnValue>) => {
    const isSnapshotKey = isSnapshotCompatibleKey(key);
    const isOnSearch = useIsOnSearch();

    // Only a snapshot key inside a Search scope reads the hash, so other calls don't re-render when the search changes
    const snapshotHash = isOnSearch && isSnapshotKey ? use(SearchSnapshotHashContext) : undefined;

    const useOnyxOptions = options as UseOnyxOptions<OnyxKey, OnyxValue<OnyxKey>> | undefined;
    const {selector: selectorProp, ...optionsWithoutSelector} = useOnyxOptions ?? {};

    const shouldUseSnapshot = !!snapshotHash;

    // Create selector function that handles both regular and snapshot data
    const selector = !selectorProp || !shouldUseSnapshot ? selectorProp : (data: OnyxValue<OnyxKey> | undefined) => selectorProp(getKeyData(data as SearchResults, key));

    const onyxOptions: UseOnyxOptions<OnyxKey, OnyxValue<OnyxKey>> = {...optionsWithoutSelector, selector};
    const snapshotKey = shouldUseSnapshot ? (`${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}` as OnyxKey) : key;

    const originalResult = useOnyxWithoutSnapshots(snapshotKey, onyxOptions);

    // Extract the specific key data from snapshot if in search mode
    const result = resolveSnapshotAwareResult<TKey, TReturnValue>(shouldUseSnapshot, !!selector, originalResult, key);

    return result;
};

export default useOnyx;
export {getKeyData, isSnapshotCompatibleKey};
