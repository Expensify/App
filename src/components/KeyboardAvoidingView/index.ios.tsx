/*
 * The KeyboardAvoidingView is only used on ios
 */
import React from 'react';
import {KeyboardAvoidingView as KeyboardAvoidingViewComponent} from 'react-native';
import type {KeyboardAvoidingViewProps} from './types';

function KeyboardAvoidingView(props: KeyboardAvoidingViewProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <KeyboardAvoidingViewComponent {...props} />;
}

KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';

export default KeyboardAvoidingView;
