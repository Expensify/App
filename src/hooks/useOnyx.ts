import {useMemo} from 'react';
import type {DependencyList} from 'react';
import {useOnyx as originalUseOnyx} from 'react-native-onyx';
import type {OnyxKey, OnyxValue, UseOnyxResult} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {SearchResults} from '@src/types/onyx';
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
const getKeyData = <TKey extends OnyxKey>(snapshotData: SearchResults, key: TKey) => {
    if (key.endsWith('_')) {
        // Create object to store matching entries
        const result: Record<string, any> = {};
        const prefix = key;

        // Get all keys that start with the prefix
        Object.entries(snapshotData?.data || {}).forEach(([dataKey, value]) => {
            if (dataKey.startsWith(prefix)) {
                result[dataKey] = value;
            }
        });
        return result;
    }
    return getDataByPath(snapshotData?.data, key);
};

function useOnyx<TKey extends OnyxKey, TReturnValue = OnyxValue<TKey>>(
    key: TKey,
    options?: BaseUseOnyxOptions & UseOnyxInitialValueOption<TReturnValue> & Required<UseOnyxSelectorOption<TKey, TReturnValue>>,
    dependencies?: DependencyList,
): UseOnyxResult<TReturnValue>;
function useOnyx<TKey extends OnyxKey, TReturnValue = OnyxValue<TKey>>(
    key: TKey,
    options?: BaseUseOnyxOptions & UseOnyxInitialValueOption<NoInfer<TReturnValue>>,
    dependencies?: DependencyList,
): UseOnyxResult<TReturnValue>;
function useOnyx<TKey extends OnyxKey, TReturnValue = OnyxValue<TKey>>(
    key: TKey,
    options?: UseOnyxOptions<TKey, TReturnValue>,
    dependencies: DependencyList = [],
): UseOnyxResult<TReturnValue> {
    const {isOnSearch, hashKey} = useSearchState();

    // In search mode, get the entire snapshot
    const [snapshotData, metadata] = originalUseOnyx(isOnSearch ? (`snapshot_${hashKey}` as TKey) : key, options as any, dependencies);

    // Extract the specific key data from snapshot if in search mode
    const result = useMemo(() => {
        if (!isOnSearch || !snapshotData || key.startsWith(ONYXKEYS.COLLECTION.SNAPSHOT)) {
            return [snapshotData, metadata] as UseOnyxResult<TReturnValue>;
        }
        const keyData = getKeyData(snapshotData as unknown as SearchResults, key as TKey);
        return [keyData as TReturnValue | undefined, metadata] as UseOnyxResult<TReturnValue>;
    }, [isOnSearch, key, snapshotData, metadata]);

    return result;
}

export default useOnyx;
