import React from 'react';
import {KeyboardAvoidingView as KeyboardAvoidingViewComponent} from 'react-native';
import type {KeyboardAvoidingViewProps} from '@components/KeyboardAvoidingView/types';

function BaseKeyboardAvoidingView(props: KeyboardAvoidingViewProps) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <KeyboardAvoidingViewComponent {...props} />;
}

BaseKeyboardAvoidingView.displayName = 'BaseKeyboardAvoidingView';

export default BaseKeyboardAvoidingView;
