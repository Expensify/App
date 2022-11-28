/*
 * This is a KeyboardAvoidingView only enabled for ios && disabled for all other platforms
 */
import React from 'react';
import {KeyboardAvoidingView as KeyboardAvoidingViewComponent} from 'react-native';
import PropTypes from 'prop-types';

const propTypes = {
    children: PropTypes.node,
};
const defaultProps = {
    children: null,
};

const KeyboardAvoidingView = props => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <KeyboardAvoidingViewComponent {...props}>
        {props.children}
    </KeyboardAvoidingViewComponent>
);

KeyboardAvoidingView.propTypes = propTypes;
KeyboardAvoidingView.defaultProps = defaultProps;
KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';

export default KeyboardAvoidingView;
