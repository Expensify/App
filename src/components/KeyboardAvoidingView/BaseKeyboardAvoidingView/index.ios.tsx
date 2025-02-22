/*
 * The KeyboardAvoidingView is only used on ios
 */
import React from 'react';
import {KeyboardAvoidingView as KeyboardAvoidingViewComponent} from 'react-native';
import type {KeyboardAvoidingViewProps} from '@components/KeyboardAvoidingView/types';

function BaseKeyboardAvoidingView(props: KeyboardAvoidingViewProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <KeyboardAvoidingViewComponent {...props} />;
}

BaseKeyboardAvoidingView.displayName = 'KeyboardAvoidingView';

export default BaseKeyboardAvoidingView;
