import 'react-native';

declare module 'react-native' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface ViewProps {
        fsClass?: string;
        fsAttribute?: Record<string, string>;
        fsTagName?: string;
        dataElement?: string;
        dataSourceFile?: string;
        dataComponent?: string;
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface TextProps {
        fsClass?: string;
        fsAttribute?: Record<string, string>;
        fsTagName?: string;
    }
}
