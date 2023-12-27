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

    const content: React.FC<SvgProps> | import('react-native').ImageSourcePropType;
    export default content;
}

declare module '*.lottie' {
    const value: import('lottie-react-native').LottieViewProps.source;
    export default value;
}

declare module 'react-native-device-info/jest/react-native-device-info-mock';

// Global methods for Onyx key management for debugging purposes
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface Window {
    enableMemoryOnlyKeys: () => void;
    disableMemoryOnlyKeys: () => void;
}
