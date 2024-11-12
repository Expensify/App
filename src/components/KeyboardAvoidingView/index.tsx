/*
 * The KeyboardAvoidingView stub implementation for web and other platforms where the keyboard handling is handled automatically.
 */
import React from 'react';
import {View} from 'react-native';
import type {KeyboardAvoidingViewProps} from './types';

function KeyboardAvoidingView(props: KeyboardAvoidingViewProps) {
    const {behavior, contentContainerStyle, enabled, keyboardVerticalOffset, ...rest} = props;
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <View {...rest} />
    );
}

KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';

export default KeyboardAvoidingView;