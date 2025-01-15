import {useMemo} from 'react';
import {useOnyx as originalUseOnyx} from 'react-native-onyx';
import type {OnyxKey, OnyxValue, UseOnyxResult} from 'react-native-onyx';
import type {DependencyList} from 'react';
import { useSearchState } from './useSearchState';

// Base options for Onyx hook configuration
type BaseUseOnyxOptions = {
    canEvict?: boolean;
    initWithStoredValues?: boolean;
    allowStaleData?: boolean;
    reuseConnection?: boolean;
};
  
type UseOnyxInitialValueOption<TInitialValue> = {
    initialValue?: TInitialValue;
};
  
type UseOnyxSelector<TKey extends OnyxKey, TReturnValue = OnyxValue<TKey>> = 
    (data: OnyxValue<TKey> | undefined) => TReturnValue;
  
type UseOnyxSelectorOption<TKey extends OnyxKey, TReturnValue> = {
    selector?: UseOnyxSelector<TKey, TReturnValue>;
};

// Helper function to get key data from snapshot
const getKeyData = (snapshotData: Record<string, any>, key: string) => {
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
    return snapshotData?.data?.[key];
};
  
function useOnyx<TKey extends OnyxKey, TReturnValue = OnyxValue<TKey>>(
    key: TKey,
    options?: BaseUseOnyxOptions & UseOnyxInitialValueOption<TReturnValue> & Required<UseOnyxSelectorOption<TKey, TReturnValue>>,
    dependencies?: DependencyList
): UseOnyxResult<TReturnValue>;
  
function useOnyx<TKey extends OnyxKey, TReturnValue = OnyxValue<TKey>>(
    key: TKey,  
    options?: BaseUseOnyxOptions & UseOnyxInitialValueOption<NoInfer<TReturnValue>>,
    dependencies?: DependencyList
): UseOnyxResult<TReturnValue>;

function useOnyx<TKey extends OnyxKey, TReturnValue = OnyxValue<TKey>>(
    key: TKey,
    options?: any,
    dependencies?: DependencyList
): UseOnyxResult<TReturnValue> {
    const {isOnSearch, hashKey} = useSearchState();

    // In search mode, get the entire snapshot
    const [snapshotData, metadata] = originalUseOnyx(
        isOnSearch ? `snapshot_${hashKey}` as TKey : key,
        options,
        dependencies,
    );

    // Extract the specific key data from snapshot if in search mode
    const result = useMemo(() => {
        if (!isOnSearch || !snapshotData) {
            return [snapshotData, metadata] as UseOnyxResult<TReturnValue>;
        }

        const keyData = getKeyData(snapshotData as Record<string, any>, key as string);
        return [keyData as TReturnValue | undefined, metadata] as UseOnyxResult<TReturnValue>;
    }, [isOnSearch, key, snapshotData, metadata]);

    return result;
}

export default useOnyx;