import type {DependencyList} from 'react';
import type {OnyxKey, OnyxValue, UseOnyxOptions, UseOnyxResult} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/core';

import useOnyx from './useOnyx';

type UseOnyxFocusedOptions<TKey extends OnyxKey, TReturnValue> = Omit<UseOnyxOptions<TKey, TReturnValue>, 'subscribed'>;

/**
 * `useOnyx` that only re-renders while the screen is focused, by wiring `subscribed` to the
 * navigation focus state. The Onyx connection stays open (cache-warm) while unfocused — only the
 * render trigger is deferred, so the first render after regaining focus reads the latest value.
 *
 * Shorthand for `useOnyx(key, {...options, subscribed: useIsFocused()})`. Goes through the app's
 * `useOnyx` wrapper.
 *
 * The focus signal is always `useIsFocused()` from React Navigation and can't be overridden. If you
 * need to drive `subscribed` from a different signal, use `useOnyx` directly.
 */
function useOnyxFocused<TKey extends OnyxKey, TReturnValue = OnyxValue<TKey>>(
    key: TKey,
    options?: UseOnyxFocusedOptions<TKey, TReturnValue>,
    dependencies?: DependencyList,
): UseOnyxResult<TReturnValue> {
    const isFocused = useIsFocused();
    // eslint-disable-next-line rulesdir/no-useOnyx-dependencies-arg
    return useOnyx(key, {...options, subscribed: isFocused}, dependencies);
}

export default useOnyxFocused;
export type {UseOnyxFocusedOptions};
