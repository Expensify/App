import type {OnyxCollectionKey, OnyxDerivedKey, OnyxFormDraftKey, OnyxFormKey, OnyxValueKey, OnyxValues} from '@src/ONYXKEYS';

import type Onyx from 'react-native-onyx';
import type {CollectionKeyBase} from 'react-native-onyx/dist/types';

declare module 'react-native-onyx' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface CustomTypeOptions {
        keys: OnyxValueKey | OnyxFormKey | OnyxFormDraftKey | OnyxDerivedKey;
        collectionKeys: OnyxCollectionKey;
        values: OnyxValues;
    }
}
declare global {
    // Global methods for Onyx key management for debugging purposes
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Window {
        // `get` is omitted rather than intersected: the library's own `get` is a synchronous cache read, and this
        // debug helper is a promise-returning subscribe-once. Intersecting the two makes the property uncallable.
        Onyx: Omit<typeof Onyx, 'get'> & {
            get: (key: CollectionKeyBase) => Promise<unknown>;
            log: (key: CollectionKeyBase) => void;
        };
    }
}
