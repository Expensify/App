/*
 * The KeyboardAvoidingView is only used on ios and android
 */
import React from 'react';
import {KeyboardAvoidingView as KeyboardAvoidingViewComponent} from 'react-native';

const KeyboardAvoidingView = props => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <KeyboardAvoidingViewComponent {...props} />
);

KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';

export default KeyboardAvoidingView;
