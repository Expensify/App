import type OnyxInputOrEntry from '@src/types/onyx/OnyxInputOrEntry';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ReadonlyDeep} from 'type-fest';

/**
 * Deeply-readonly variants of the Onyx wrapper types.
 *
 * Values handed back by `Onyx.get()` ARE the cached objects, not copies, so mutating one corrupts the
 * cache for every other reader. Typing a read value with one of these makes that a compile error instead
 * of a convention reviewers have to remember. To get a mutable value back, deep-clone it with
 * `lodash/cloneDeep` and cast the result to the mutable type.
 *
 * For anything that is not an Onyx wrapper type, use `ReadonlyDeep` from `type-fest` directly.
 */

/** A readonly `OnyxEntry`, the shape a `useOnyx` read hands back. */
type ReadonlyOnyxEntry<T> = ReadonlyDeep<OnyxEntry<T>>;

/** A readonly `OnyxInputOrEntry`, a value that may be a write input or a stored entry. */
type ReadonlyOnyxInputOrEntry<T> = ReadonlyDeep<OnyxInputOrEntry<T>>;

/** A readonly `OnyxCollection`, the shape a whole collection key hands back. */
type ReadonlyOnyxCollection<T> = ReadonlyDeep<OnyxCollection<T>>;

export type {ReadonlyOnyxEntry, ReadonlyOnyxInputOrEntry, ReadonlyOnyxCollection};
