import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ReadonlyDeep} from 'type-fest';

import type OnyxInputOrEntry from './OnyxInputOrEntry';

/**
 * A deeply-immutable view of an Onyx value. `Onyx.get` hands back the cached object itself, not a copy.
 */
type ReadonlyOnyx<TOnyxValue> = ReadonlyDeep<TOnyxValue>;

/**
 * A readonly `OnyxEntry`.
 */
type ReadonlyOnyxEntry<TOnyxValue> = ReadonlyOnyx<OnyxEntry<TOnyxValue>>;

/**
 * A readonly `OnyxInputOrEntry`.
 */
type ReadonlyOnyxInputOrEntry<TOnyxValue> = ReadonlyOnyx<OnyxInputOrEntry<TOnyxValue>>;

/**
 * A readonly `OnyxCollection`.
 */
type ReadonlyOnyxCollection<TOnyxValue> = ReadonlyOnyx<OnyxCollection<TOnyxValue>>;

export default ReadonlyOnyx;
export type {ReadonlyOnyxCollection, ReadonlyOnyxEntry, ReadonlyOnyxInputOrEntry};
