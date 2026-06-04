import {useState} from 'react';
import type {OnyxKey, OnyxValue} from 'react-native-onyx';
import useOnyx from './useOnyx';

/**
 * Returns the Onyx value captured at the moment Onyx first reports 'loaded',
 * then never updates again. Useful when you need a stable snapshot of Onyx
 * data at mount time without being affected by initial hydration timing.
 */
export default function useInitialOnyxValue<TKey extends OnyxKey>(onyxKey: TKey): OnyxValue<TKey> | undefined {
    const [value, {status}] = useOnyx(onyxKey);
    const [prevStatus, setPrevStatus] = useState(status);
    const [result, setResult] = useState(value);
    if (prevStatus !== status) {
        setPrevStatus(status);
        if (status === 'loaded') {
            setResult(value);
        }
    }
    return result;
}
