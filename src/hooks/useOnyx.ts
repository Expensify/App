import {useMemo} from 'react';
import {useOnyx as originalUseOnyx} from 'react-native-onyx';
import type {OnyxKey, OnyxValue, UseOnyxResult} from 'react-native-onyx';
import type {DependencyList} from 'react';
import { useRoute } from '@react-navigation/native';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import { AuthScreensParamList } from '@libs/Navigation/types';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';

import SCREENS from '@src/SCREENS';

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

    const route = useRoute<PlatformStackRouteProp<AuthScreensParamList, typeof SCREENS.SEARCH.CENTRAL_PANE>>();
    const {q} = route.params ;
    console.log("[wildebug] ~ file: useOnyx.ts:51 ~ q:", q)
    const queryJSON = useMemo(() => q ? SearchQueryUtils.buildSearchQueryJSON(q) : {} as { hash?: string }, [q]);
    const hashKey = queryJSON?.hash
    const isOnSearch = !!hashKey;
    console.log("[wildebug] ~ file: useOnyx.ts:55 ~ isOnSearch:", isOnSearch)

    // In search mode, get the entire snapshot
    const [snapshotData, metadata] = originalUseOnyx(
        isOnSearch ? `snapshot_${hashKey}` as TKey : key,
        options,
        dependencies,
    );
    console.log("[wildebug] ~ file: useOnyxWithSnapshot.ts:60 ~ hashKey:", hashKey)

    // Extract the specific key data from snapshot if in search mode
    const result = useMemo(() => {
        if (!isOnSearch || !snapshotData) {
            return [snapshotData, metadata] as UseOnyxResult<TReturnValue>;
        }

        const keyData = (snapshotData as Record<string, any>)?.data[key as string];
        return [keyData as TReturnValue | undefined, metadata] as UseOnyxResult<TReturnValue>;
    }, [isOnSearch, key, snapshotData, metadata]);

    return result;
}

export default useOnyx;