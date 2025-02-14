import {useSyncExternalStore} from 'react';
import type {ValueOf} from 'type-fest';
import type {ONYX_DERIVED_VALUES} from '@libs/OnyxDerived';
import OnyxDerived from '@libs/OnyxDerived';

/**
 * Hook that subscribes to a derived Onyx value.
 *
 * Pass in one of the derived configs from ONYX_DERIVED_VALUES.
 * This hook uses React's useSyncExternalStore to subscribe to the derived store,
 * so that your component re-renders only when the derived value changes.
 */
function useDerivedOnyxValue(config: ValueOf<typeof ONYX_DERIVED_VALUES>): ReturnType<typeof config.compute> {
    const store = OnyxDerived.getDerivedValueStore(config);
    return useSyncExternalStore(store.subscribe, () => store.currentValue);
}

export default useDerivedOnyxValue;
