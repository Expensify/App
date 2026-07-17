import type {DependencyList} from 'react';
import type {OnyxKey, OnyxValue, UseOnyxOptions, UseOnyxResult} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/core';

import useOnyx from './useOnyx';

type UseOnyxFocusedOptions<TKey extends OnyxKey, TReturnValue> = Omit<UseOnyxOptions<TKey, TReturnValue>, 'subscribed'> & {
    /**
     * Focus signal that drives `subscribed`. Defaults to `useIsFocused()` from React Navigation.
     * Pass it explicitly when the signal is not navigation focus (e.g. a visibility flag passed via props).
     */
    isFocused?: boolean;
};

/**
 * `useOnyx` that only re-renders while the screen is focused, by wiring `subscribed` to the
 * navigation focus state. The Onyx connection stays open (cache-warm) while unfocused — only the
 * render trigger is deferred, so the first render after regaining focus reads the latest value.
 *
 * Shorthand for `useOnyx(key, {...options, subscribed: useIsFocused()})`. Goes through the app's
 * `useOnyx` wrapper.
 */
function useOnyxFocused<TKey extends OnyxKey, TReturnValue = OnyxValue<TKey>>(
    key: TKey,
    options?: UseOnyxFocusedOptions<TKey, TReturnValue>,
    dependencies?: DependencyList,
): UseOnyxResult<TReturnValue> {
    const isNavigationFocused = useIsFocused();
    const {isFocused = isNavigationFocused, ...onyxOptions} = options ?? {};
    // eslint-disable-next-line rulesdir/no-useOnyx-dependencies-arg
    return useOnyx(key, {...onyxOptions, subscribed: isFocused}, dependencies);
}

export default useOnyxFocused;
export type {UseOnyxFocusedOptions};
