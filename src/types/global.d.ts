declare module '*.png' {
    import type {ImageSourcePropType} from 'react-native';

    const value: ImageSourcePropType;
    export default value;
}

declare module '*.jpg' {
    import type {ImageSourcePropType} from 'react-native';

    const value: ImageSourcePropType;
    export default value;
}

declare module '*.svg' {
    import type React from 'react';
    import type {SvgProps} from 'react-native-svg';

    const content: React.FC<SvgProps>;
    export default content;
}

declare module '*.lottie' {
    import type {LottieViewProps} from 'lottie-react-native';

    const value: LottieViewProps['source'];
    export default value;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface Window {
    setSupportToken: (token: string, email: string, accountID: number) => void;
    markAllPolicyReportsAsRead: (policyID: string) => void;
}

// Allows to add generic type in require
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface NodeRequire {
    // eslint-disable-next-line @typescript-eslint/prefer-function-type, @typescript-eslint/no-explicit-any
    <T = any>(id: string): T;
}

// Define ArrayBuffer.transfer:
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface ArrayBuffer {
    // Might be defined in browsers, in RN hermes it's not implemented yet
    transfer?: (length: number) => ArrayBuffer;
}
