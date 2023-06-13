/*
 * The KeyboardAvoidingView is only used on ios
 */
import React from 'react';
import {KeyboardAvoidingView as KeyboardAvoidingViewComponent} from 'react-native';

function KeyboardAvoidingView(props) {
    return <KeyboardAvoidingViewComponent {...props} />;
}

KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';

export default KeyboardAvoidingView;
