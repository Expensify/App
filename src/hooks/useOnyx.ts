import {useMemo} from 'react';
import {useOnyx as originalUseOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry, OnyxKey, OnyxValue} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';
import useSearchState from './useSearchState';

type BaseUseOnyxOptions = {
    /**
     * Determines if this key in this subscription is safe to be evicted.
     */
    canEvict?: boolean;

    /**
     * If set to `false`, then no data will be prefilled into the component.
     */
    initWithStoredValues?: boolean;

    /**
     * If set to `true`, data will be retrieved from cache during the first render even if there is a pending merge for the key.
     */
    allowStaleData?: boolean;

    /**
     * If set to `false`, the connection won't be reused between other subscribers that are listening to the same Onyx key
     * with the same connect configurations.
     */
    reuseConnection?: boolean;
};

type UseOnyxInitialValueOption<TInitialValue> = {
    /**
     * This value will be returned by the hook on the first render while the data is being read from Onyx.
     */
    initialValue?: TInitialValue;
};

type UseOnyxSelector<TKey extends OnyxKey, TReturnValue = OnyxValue<TKey>> = (data: OnyxValue<TKey> | undefined) => TReturnValue;

type UseOnyxSelectorOption<TKey extends OnyxKey, TReturnValue> = {
    /**
     * This will be used to subscribe to a subset of an Onyx key's data.
     * Using this setting can have very positive performance benefits because the component will only re-render
     * when the subset of data changes.
     */
    selector?: UseOnyxSelector<TKey, TReturnValue>;
};

type UseOnyxOptions<TKey extends OnyxKey, TReturnValue> = BaseUseOnyxOptions & UseOnyxInitialValueOption<TReturnValue> & UseOnyxSelectorOption<TKey, TReturnValue>;

type OriginalUseOnyx = typeof originalUseOnyx;
type OriginalUseOnyxReturnType = ReturnType<OriginalUseOnyx>;

const getDataByPath = (data: SearchResults['data'], path: string) => {
    // Handle prefixed collections
    for (const collection of Object.values(ONYXKEYS.COLLECTION)) {
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
    const {isOnSearch, hashKey} = useSearchState();
    const useOnyxOptions = options as UseOnyxOptions<OnyxKey, OnyxValue<OnyxKey>>;
    const {selector: selectorProp, ...optionsWithoutSelector} = useOnyxOptions ?? {};

    // Determine if we should use snapshot data based on search state and key
    const shouldUseSnapshot = isOnSearch && !key.startsWith(ONYXKEYS.COLLECTION.SNAPSHOT) && CONST.SEARCH.SNAPSHOT_ONYX_KEYS.some((snapshotKey) => key.startsWith(snapshotKey));

    // Create selector function that handles both regular and snapshot data
    const selector = selectorProp ? (data: OnyxValue<OnyxKey> | undefined) => selectorProp(shouldUseSnapshot ? getKeyData(data as SearchResults, key) : data) : undefined;

    const onyxOptions = {...optionsWithoutSelector, selector};
    const snapshotKey = shouldUseSnapshot ? (`${ONYXKEYS.COLLECTION.SNAPSHOT}${hashKey}` as OnyxKey) : key;

    const [data, metadata] = originalUseOnyx(snapshotKey, onyxOptions, dependencies);

    // Extract and memoize the specific key data from snapshot if in search mode
    const result = useMemo((): OriginalUseOnyxReturnType => {
        if (!shouldUseSnapshot || !data) {
            return [data, metadata] as OriginalUseOnyxReturnType;
        }

        const keyData = getKeyData(data as SearchResults, key, useOnyxOptions?.initialValue);
        return [keyData, metadata] as OriginalUseOnyxReturnType;
    }, [shouldUseSnapshot, data, metadata, key, useOnyxOptions?.initialValue]);

    return result;
};

export default useOnyx;
