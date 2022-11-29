/*
 * The KeyboardAvoidingView is only used on ios
 */
import React from 'react';
import {View} from 'react-native';

const KeyboardAvoidingView = props => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <View {...props} />
);

KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';

export default KeyboardAvoidingView;
