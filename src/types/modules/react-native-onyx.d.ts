import type {OnyxCollectionKey, OnyxDerivedKey, OnyxFormDraftKey, OnyxFormKey, OnyxValueKey, OnyxValues} from '@src/ONYXKEYS';

import type Onyx from 'react-native-onyx';
import type {OnyxKey, OnyxValue} from 'react-native-onyx';
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
        Onyx: typeof Onyx & {
            get: <TKey extends OnyxKey>(key: TKey) => Promise<OnyxValue<TKey>>;
            log: (key: CollectionKeyBase) => void;
        };
    }
}
