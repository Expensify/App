import type {OnyxDerivedKey, OnyxKey} from '@src/ONYXKEYS';

import type {OnyxInput} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * Check whether a specific dependency key triggered the current OnyxDerived compute.
 *
 * This reads `triggeredKeys` (every dependency that fired) rather than `sourceValues` (only the ones
 * that produced a non-empty delta), so a dependency cleared to `undefined` — or a collection with no
 * changed members — is still correctly reported as having triggered.
 */
const hasKeyTriggeredCompute = (key: OnyxKey, triggeredKeys: Set<OnyxKey> | undefined): boolean => triggeredKeys?.has(key) ?? false;

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

export {hasKeyTriggeredCompute, setDerivedValue};
