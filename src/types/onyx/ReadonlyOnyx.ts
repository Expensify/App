import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ReadonlyDeep} from 'type-fest';

import type OnyxInputOrEntry from './OnyxInputOrEntry';

/** A readonly `OnyxEntry`. */
type ReadonlyOnyxEntry<TOnyxValue> = ReadonlyDeep<OnyxEntry<TOnyxValue>>;

/** A readonly `OnyxInputOrEntry`. */
type ReadonlyOnyxInputOrEntry<TOnyxValue> = ReadonlyDeep<OnyxInputOrEntry<TOnyxValue>>;

/** A readonly `OnyxCollection`. */
type ReadonlyOnyxCollection<TOnyxValue> = ReadonlyDeep<OnyxCollection<TOnyxValue>>;

export type {ReadonlyOnyxCollection, ReadonlyOnyxEntry, ReadonlyOnyxInputOrEntry};
