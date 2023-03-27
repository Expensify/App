import React from 'react';
import {KeyboardAvoidingView as KeyboardAvoidingViewComponent} from 'react-native';

const KeyboardAvoidingView = props => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <KeyboardAvoidingViewComponent {...props} />
);

KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';

export default KeyboardAvoidingView;
