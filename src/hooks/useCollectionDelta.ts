import getCollectionDelta from '@libs/getCollectionDelta';

import type {OnyxCollection} from 'react-native-onyx';

import {useMemo} from 'react';

import usePrevious from './usePrevious';

/**
 * Given the latest collection value from `useOnyx`, returns the subset of members that changed since
 * the previous render (added, changed, or removed), or `undefined` when nothing changed. Because Onyx
 * structurally shares unchanged members, the underlying diff is a cheap reference-equality scan.
 */
function useCollectionDelta<TValue>(value: OnyxCollection<TValue>): OnyxCollection<TValue> | undefined {
    const previous = usePrevious(value);
    return useMemo(() => getCollectionDelta(value, previous), [value, previous]);
}

export default useCollectionDelta;
