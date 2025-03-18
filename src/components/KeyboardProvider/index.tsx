import type {PropsWithChildren} from 'react';
import React from 'react';
import {KeyboardProvider} from 'react-native-keyboard-controller';

function KeyboardProviderWrapper({children}: PropsWithChildren<Record<string, unknown>>) {
    return (
        <KeyboardProvider
            statusBarTranslucent
            navigationBarTranslucent
        >
            {children}
        </KeyboardProvider>
    );
}

export default KeyboardProviderWrapper;
