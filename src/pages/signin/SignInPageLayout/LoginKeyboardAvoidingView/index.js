import _ from 'underscore';
import React from 'react';
import {KeyboardAvoidingView} from 'react-native';
import PropTypes from 'prop-types';

const propTypes = {
    /** Style for KeyboardAvoidingView */
    style: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),

    /** ContentContainerStyle for KeyboardAvoidingView */
    contentContainerStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

const defaultProps = {
    style: {},
    contentContainerStyle: {},
};

const LoginKeyboardAvoidingView = props => (
    <KeyboardAvoidingView
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        style={[
            ...(_.isArray(props.style) ? props.style : [props.style]),
            ...(_.isArray(props.contentContainerStyle) ? props.contentContainerStyle : [props.contentContainerStyle]),
        ]}
    />
);

LoginKeyboardAvoidingView.propTypes = propTypes;
LoginKeyboardAvoidingView.defaultProps = defaultProps;
LoginKeyboardAvoidingView.displayName = 'LoginKeyboardAvoidingView';

export default LoginKeyboardAvoidingView;
