/*
 * The KeyboardAvoidingView is only used on ios
 */
import React from 'react';
import {View} from 'react-native';
import Props from './types';

function KeyboardAvoidingView(props: Props) {
    const {behavior, contentContainerStyle, enabled, keyboardVerticalOffset, ...rest} = props;
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <View {...rest} />
    );
}

KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';

export default KeyboardAvoidingView;
