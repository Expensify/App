import {OnyxKey, OnyxCollectionKey, OnyxValues} from './ONYXKEYS';

declare module '*.png' {
    const value: import('react-native').ImageSourcePropType;
    export default value;
}
declare module '*.jpg' {
    const value: import('react-native').ImageSourcePropType;
    export default value;
}
declare module '*.svg' {
    import React from 'react';
    import {SvgProps} from 'react-native-svg';

    const content: React.FC<SvgProps>;
    export default content;
}

declare module 'react-native-device-info/jest/react-native-device-info-mock';

declare module 'react-native-onyx' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface CustomTypeOptions {
        keys: OnyxKey;
        collectionKeys: OnyxCollectionKey;
        values: OnyxValues;
    }
}
