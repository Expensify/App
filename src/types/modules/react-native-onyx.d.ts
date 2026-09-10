import type {OnyxCollectionKey, OnyxDerivedKey, OnyxFormDraftKey, OnyxFormKey, OnyxValueKey, OnyxValues} from '@src/ONYXKEYS';

declare module 'react-native-onyx' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface CustomTypeOptions {
        keys: OnyxValueKey | OnyxFormKey | OnyxFormDraftKey | OnyxDerivedKey;
        collectionKeys: OnyxCollectionKey;
        values: OnyxValues;
    }
}

export {};
