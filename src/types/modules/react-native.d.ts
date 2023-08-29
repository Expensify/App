/* eslint-disable @typescript-eslint/consistent-type-definitions */
import 'react-native';

declare module 'react-native' {
    interface TextInput {
        setSelection: (start: number, end: number) => void;
    }
}
