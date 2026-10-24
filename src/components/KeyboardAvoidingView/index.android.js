import React from 'react';
import {KeyboardAvoidingView as RNKeyboardAvoidingView} from 'react-native';
import PropTypes from 'prop-types';

/**
 * Android-specific KeyboardAvoidingView to handle landscape layout shifts
 * and ensure inputs remain visible when the keyboard is active.
 */
function KeyboardAvoidingView({children, style, ...props}) {
    return (
        <RNKeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={0}
            style={[{flex: 1}, style]}
            {...props}
        >
            {children}
        </RNKeyboardAvoidingView>
    );
}

KeyboardAvoidingView.propTypes = {
    children: PropTypes.node.isRequired,
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

KeyboardAvoidingView.defaultProps = {
    style: {},
};

export default KeyboardAvoidingView;