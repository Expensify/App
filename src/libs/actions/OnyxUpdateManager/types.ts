import type {OnyxUpdatesFromServer} from '@src/types/onyx';

type DeferredUpdatesDictionary = Record<number, OnyxUpdatesFromServer>;

export default DeferredUpdatesDictionary;
