import {useMemo} from 'react';
import {useOnyx as originalUseOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry, OnyxKey, OnyxValue, UseOnyxOptions} from 'react-native-onyx';
import {useSearchContext} from '@components/Search/SearchContext';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

type OriginalUseOnyx = typeof originalUseOnyx;
type OriginalUseOnyxReturnType = ReturnType<OriginalUseOnyx>;

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
const getKeyData = <TKey extends OnyxKey, TReturnValue>(snapshotData: SearchResults, key: TKey, initialValue?: TReturnValue): TReturnValue => {
    if (key.endsWith('_')) {
        // Create object to store matching entries
        const result: OnyxCollection<TKey> = {};
        const prefix = key;

        // Get all keys that start with the prefix
        Object.entries(snapshotData?.data ?? {}).forEach(([dataKey, value]) => {
            if (!dataKey.startsWith(prefix)) {
                return;
            }
            result[dataKey] = value as OnyxEntry<TKey>;
        });
        return (Object.keys(result).length > 0 ? result : initialValue) as TReturnValue;
    }
    return (getDataByPath(snapshotData?.data, key) ?? initialValue) as TReturnValue;
};

/**
 * Custom hook for accessing and subscribing to Onyx data with search snapshot support
 */
const useOnyx: OriginalUseOnyx = (key, options, dependencies) => {
    const {isOnSearch, currentSearchHash} = useSearchContext();
    const useOnyxOptions = options as UseOnyxOptions<OnyxKey, OnyxValue<OnyxKey>> | undefined;
    const {selector: selectorProp, ...optionsWithoutSelector} = useOnyxOptions ?? {};

    // Determine if we should use snapshot data based on search state and key
    const shouldUseSnapshot = useMemo(() => {
        return isOnSearch && !!currentSearchHash && !key.startsWith(ONYXKEYS.COLLECTION.SNAPSHOT) && CONST.SEARCH.SNAPSHOT_ONYX_KEYS.some((snapshotKey) => key.startsWith(snapshotKey));
    }, [isOnSearch, currentSearchHash, key]);

    // Create selector function that handles both regular and snapshot data
    const selector = useMemo(() => {
        if (!selectorProp || !shouldUseSnapshot) {
            return selectorProp;
        }

        return (data: OnyxValue<OnyxKey> | undefined) => selectorProp(getKeyData(data as SearchResults, key));
    }, [selectorProp, shouldUseSnapshot, key]);

    const onyxOptions: UseOnyxOptions<OnyxKey, OnyxValue<OnyxKey>> = {...optionsWithoutSelector, selector, allowDynamicKey: true};
    const snapshotKey = shouldUseSnapshot ? (`${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchHash}` as OnyxKey) : key;

    const originalResult = originalUseOnyx(snapshotKey, onyxOptions, dependencies);

    // Extract and memoize the specific key data from snapshot if in search mode
    const result = useMemo((): OriginalUseOnyxReturnType => {
        // if it has selector, we don't need to use snapshot here
        if (!shouldUseSnapshot || selector) {
            return originalResult as OriginalUseOnyxReturnType;
        }

        const keyData = getKeyData(originalResult[0] as SearchResults, key, onyxOptions?.initialValue);
        return [keyData, originalResult[1]] as OriginalUseOnyxReturnType;
    }, [shouldUseSnapshot, originalResult, key, onyxOptions?.initialValue, selector]);

    return result;
};

export default useOnyx;
