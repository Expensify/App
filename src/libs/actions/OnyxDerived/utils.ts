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

/**
 * Returns `previous` when `next` holds the same entries, otherwise `next`. Entries of `next` that equal their previous entry
 * are swapped for the previous reference first, so a changed value still keeps the references of the entries that did not change.
 */
function reuseUnchanged<V>(next: Record<string, V>, previous: Record<string, V>, isEqual: (previousEntry: NonNullable<V>, nextEntry: NonNullable<V>) => boolean): Record<string, V> {
    let hasChanged = false;
    const keys = Object.keys(next);
    for (const key of keys) {
        const entry = next[key];
        const previousEntry = previous[key];
        if (previousEntry === entry && (entry !== undefined || key in previous)) {
            continue;
        }
        if (previousEntry && entry && isEqual(previousEntry, entry)) {
            // eslint-disable-next-line no-param-reassign -- swapping in the previous reference is the purpose of this helper
            next[key] = previousEntry;
            continue;
        }
        hasChanged = true;
    }
    // A removed key leaves the count lower even when every remaining entry is unchanged.
    return hasChanged || keys.length !== Object.keys(previous).length ? next : previous;
}

export {hasKeyTriggeredCompute, setDerivedValue, reuseUnchanged};
