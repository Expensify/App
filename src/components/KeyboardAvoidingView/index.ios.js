/*
 * This is a KeyboardAvoidingView only enabled for ios && disabled for all other platforms
 */
import React from 'react';
import {KeyboardAvoidingView as KeyboardAvoidingViewComponent} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';

const propTypes = {
    children: PropTypes.node,
};
const defaultProps = {
    children: null,
};

const KeyboardAvoidingView = props => (
    <KeyboardAvoidingViewComponent
        behavior="padding"
        style={[styles.w100, styles.h100]}
    >
        {props.children}
    </KeyboardAvoidingViewComponent>
);

KeyboardAvoidingView.propTypes = propTypes;
KeyboardAvoidingView.defaultProps = defaultProps;
KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';
export default KeyboardAvoidingView;
