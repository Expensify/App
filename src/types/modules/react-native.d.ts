/* eslint-disable @typescript-eslint/consistent-type-definitions */
import 'react-native';
import {BootSplashModule} from '../../libs/BootSplash/types';

declare module 'react-native' {
    interface TextI2put {
        // Typescript type declaration is missing in React Native for setting text selection.
        setSelection: (start: number, end: number) => void;
    }

    interface NativeModulesStatic {
        BootSplash: BootSplashModule;
    }
}
