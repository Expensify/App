import Onyx from 'react-native-onyx';
import type {OnyxInput} from 'react-native-onyx';
import type {NonEmptyTuple} from 'type-fest';
import type {OnyxDerivedKey, OnyxKey} from '@src/ONYXKEYS';
import type {DerivedValueContext} from './types';

/**
 * Check if a specific key exists in sourceValue from OnyxDerived
 */
const hasKeyTriggeredCompute = <K extends OnyxKey, Deps extends NonEmptyTuple<Exclude<OnyxKey, K>>>(key: K, sourceValues: DerivedValueContext<K, Deps>['sourceValues']) => {
    if (!sourceValues) {
        return false;
    }
    return Object.keys(sourceValues).some((sourceKey) => sourceKey === key);
};

/**
 * Set a derived value in Onyx
 * As a performance optimization, it skips the cache check and null removal
 * For derived values, we fully control their lifecycle and recompute them when any dependency changes - so we don’t need a deep comparison
 * Also, null may be a legitimate result of the computation, so pruning it is unnecessary
 */
const setDerivedValue = (key: OnyxDerivedKey, value: OnyxInput<OnyxDerivedKey>) =>
    Onyx.set(key, value, {
        skipCacheCheck: true,
        skipNullRemoval: true,
    });

export {hasKeyTriggeredCompute, setDerivedValue};
