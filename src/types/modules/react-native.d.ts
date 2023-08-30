/* eslint-disable @typescript-eslint/consistent-type-definitions */
import 'react-native';

declare module 'react-native' {
    interface TextInput {
        // Typescript type declaration is missing in React Native for setting text selection.
        setSelection: (start: number, end: number) => void;
    }
}
