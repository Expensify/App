import React from 'react';
import {View, KeyboardAvoidingView as KeyboardAvoidingViewComponent} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';

const propTypes = {
    /** In most cases, we do not need to use KeyboardAvoidingView on Android, so it is set to false by default. */
    shouldApplyToAndroid: PropTypes.bool,
};
const defaultProps = {
    shouldApplyToAndroid: false,
};

const KeyboardAvoidingView = (props) => {
    if (props.shouldApplyToAndroid) {
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
