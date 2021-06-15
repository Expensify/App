/**
 * This is a KeyboardAvoidingView only enabled for ios && disabled for all other platforms
 * @param {Node}
 */
import React from 'react';
import {KeyboardAvoidingView as RNKeyboardAvoidingView} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';

const propTypes = {
    children: PropTypes.node,
};
const defaultProps = {
    children: null,
};

function KeyboardAvoidingView({children}) {
    return (
        <RNKeyboardAvoidingView
            behavior="padding"
            style={[styles.w100, styles.h100]}
        >
            {children}
        </RNKeyboardAvoidingView>
    );
}

KeyboardAvoidingView.propTypes = propTypes;
KeyboardAvoidingView.defaultProps = defaultProps;
KeyboardAvoidingView.displayName = 'KeyboardAvoidingView';
export default KeyboardAvoidingView;
