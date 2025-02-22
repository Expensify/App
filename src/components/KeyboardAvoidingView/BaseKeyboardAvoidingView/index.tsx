/*
 * The KeyboardAvoidingView stub implementation for web and other platforms where the keyboard is handled automatically.
 */
import React from 'react';
import {View} from 'react-native';
import type {KeyboardAvoidingViewProps} from '@components/KeyboardAvoidingView/types';

function BaseKeyboardAvoidingView(props: KeyboardAvoidingViewProps) {
    const {behavior, contentContainerStyle, enabled, keyboardVerticalOffset, ...rest} = props;
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <View {...rest} />
    );
}

BaseKeyboardAvoidingView.displayName = 'BaseKeyboardAvoidingView';

export default BaseKeyboardAvoidingView;
