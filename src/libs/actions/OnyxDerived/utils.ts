import Onyx from 'react-native-onyx';
import type {OnyxInput} from 'react-native-onyx';
import type {NonEmptyTuple} from 'type-fest';
import type {OnyxDerivedKey, OnyxKey} from '@src/ONYXKEYS';
import type {DerivedValueContext} from './types';

const MAX_SOURCE_VALUES_LENGTH_FOR_LOGGING = 5;

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
    });

/**
 * Source values can contain thousands of entries, so
 * we prepare source values for logging by truncating the object to the first 5 entries
 * this way we can see in the logs what payload was sent to the compute function
 */
const prepareSourceValuesForLogging = (sourceValues: Record<string, unknown> | undefined) => {
    if(!sourceValues) {
        return;
    }
    
    const entries = Object.entries(sourceValues);
    const partialSourceValues = Object.fromEntries(entries.slice(0, MAX_SOURCE_VALUES_LENGTH_FOR_LOGGING));
    return partialSourceValues;
};

export {hasKeyTriggeredCompute, setDerivedValue, prepareSourceValuesForLogging};
