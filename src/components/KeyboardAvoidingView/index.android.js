import React from 'react';
import {View, KeyboardAvoidingView as KeyboardAvoidingViewComponent} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';

const propTypes = {
    /** In most cases, we do not need to use KeyboardAvoidingView on Android, so it is set to false by default. */
    isApplyToAndroid: PropTypes.bool,
};
const defaultProps = {
    isApplyToAndroid: false,
};

const KeyboardAvoidingView = (props) => {
    if (props.isApplyToAndroid) {
        return (
        // eslint-disable-next-line react/jsx-props-no-spreading
            <KeyboardAvoidingViewComponent {...props} />
        );
    }
    const viewProps = _.omit(props, ['behavior', 'contentContainerStyle', 'enabled', 'keyboardVerticalOffset']);
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <View {...viewProps} />
    );
};

KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';
KeyboardAvoidingView.propTypes = propTypes;
KeyboardAvoidingView.defaultProps = defaultProps;

export default KeyboardAvoidingView;
