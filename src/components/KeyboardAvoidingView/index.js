/*
 * The KeyboardAvoidingView is only used on ios
 */
import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';

const KeyboardAvoidingView = (props) => {
    const viewProps = _.omit(props, ['behavior', 'contentContainerStyle', 'enabled', 'keyboardVerticalOffset']);
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <View {...viewProps} />
    );
};

KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';

export default KeyboardAvoidingView;
