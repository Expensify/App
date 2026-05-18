import type {OnyxCollection} from 'react-native-onyx';
import type {PolicyTagLists} from '@src/types/onyx';

/**
 * A passthrough selector for `useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS)`.
 *
 * This is a workaround for a performance regression introduced in #83545, where subscribing to
 * `POLICY_TAGS` without a `memoizedSelector` causes `useOnyx` to fall back to shallow equality.
 * The `tags` property inside each entry produces a new reference on every render even when empty,
 * invalidating all downstream memoization and cascading unnecessary re-renders through the tree.
 *
 * By supplying this selector, `useOnyx` switches to the memoized comparison path, which returns a
 * stable reference when nothing has changed.
 *
 * @see https://github.com/Expensify/App/pull/86327
 * @see https://github.com/Expensify/App/issues/86181 — tracking issue for the proper fix in Onyx;
 *      once that lands in PROD, all usages of this selector should be reverted.
 */
function passthroughPolicyTagListSelector(tags: OnyxCollection<PolicyTagLists>): OnyxCollection<PolicyTagLists> {
    return tags;
}

export default passthroughPolicyTagListSelector;
