import type Onyx from 'react-native-onyx';
import type {OnyxCollectionKey, OnyxFormDraftKey, OnyxFormKey, OnyxValueKey, OnyxValues} from '@src/ONYXKEYS';

declare module 'react-native-onyx' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface CustomTypeOptions {
        keys: OnyxValueKey | OnyxFormKey | OnyxFormDraftKey;
        collectionKeys: OnyxCollectionKey;
        values: OnyxValues;
    }
}

declare global {
    // Global methods for Onyx key management for debugging purposes
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Window {
        Onyx: typeof Onyx;
    }
}
