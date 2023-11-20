import {OnyxCollectionKey, OnyxKey, OnyxValues} from '@src/ONYXKEYS';

declare module 'react-native-onyx' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface CustomTypeOptions {
        keys: OnyxKey;
        collectionKeys: OnyxCollectionKey;
        values: OnyxValues;
    }
}
