/*
 * The KeyboardAvoidingView is only used on ios
 */
import React from 'react';
import {KeyboardAvoidingView as KeyboardAvoidingViewComponent, KeyboardAvoidingViewProps} from 'react-native';

function KeyboardAvoidingView(props: KeyboardAvoidingViewProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <KeyboardAvoidingViewComponent {...props} />;
}

KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';

export default KeyboardAvoidingView;
