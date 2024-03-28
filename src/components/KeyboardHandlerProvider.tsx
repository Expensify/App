import type {PropsWithChildren} from 'react';
import React from 'react';
import {Platform} from 'react-native';
import {KeyboardProvider} from 'react-native-keyboard-controller';

type Props = PropsWithChildren<unknown>;

function KeyboardHandlerProvider({children}: Props) {
    return <KeyboardProvider enabled={Platform.OS === 'ios'}>{children}</KeyboardProvider>;
}

export default KeyboardHandlerProvider;
