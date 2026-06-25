import React from 'react';
import type {KeyboardAvoidingViewProps} from 'react-native-keyboard-controller';
import {KeyboardAvoidingView as KeyboardAvoidingViewComponent} from 'react-native-keyboard-controller';

function BaseKeyboardAvoidingView(props: KeyboardAvoidingViewProps) {
    return <KeyboardAvoidingViewComponent {...props} />;
}

export default BaseKeyboardAvoidingView;
