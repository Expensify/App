declare module 'expo-modules-core' {
    import {ExpoProcess} from 'expo-modules-core';

    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-empty-interface
    interface ExpoProcess extends NodeJS.Process {}
}

// We used the export {} line to mark this file as an external module
export {};
