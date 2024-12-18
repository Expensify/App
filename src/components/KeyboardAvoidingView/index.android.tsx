/*
 * The KeyboardAvoidingView is only used on ios
 */
import React from 'react';
import type {KeyboardAvoidingViewProps} from 'react-native-keyboard-controller';
import {KeyboardAvoidingView as KeyboardAvoidingViewComponent} from 'react-native-keyboard-controller';

function KeyboardAvoidingView(props: KeyboardAvoidingViewProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <KeyboardAvoidingViewComponent {...props} />;
}

KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';

export default KeyboardAvoidingView;
