import {useEffect, useRef} from 'react';
import Onyx from 'react-native-onyx';
import type {OnyxKey, OnyxSetInput, OnyxValue, UseOnyxResult} from 'react-native-onyx';
import useOnyx from './useOnyx';

/**
 * Wraps `useOnyx` to guarantee a fresh start on every component mount.
 *
 * On the first render after mount, the hook returns `resetValue` instead of
 * whatever is in the Onyx cache. A mount effect then calls `Onyx.set` to
 * align the cache with `resetValue`, so subsequent renders read the correct
 * value from `useOnyx`.
 *
 * This replaces `initWithStoredValues: false` for keys that must reset to a
 * known value on every mount (e.g. IS_CHECKING_PUBLIC_ROOM must start as
 * `true` so NavigationRoot doesn't render before the initial URL is resolved).
 */
function useOnyxWithMountReset<TKey extends OnyxKey>(key: TKey, resetValue: NonNullable<OnyxValue<TKey>>): UseOnyxResult<OnyxValue<TKey>> {
    const hasResetRef = useRef(false);
    const result = useOnyx(key);

    useEffect(() => {
        hasResetRef.current = true;
        Onyx.set(key, resetValue as OnyxSetInput<TKey>);
    }, [key, resetValue]);

    if (!hasResetRef.current) {
        return [resetValue, {status: 'loaded'}];
    }

    return result;
}

export default useOnyxWithMountReset;
