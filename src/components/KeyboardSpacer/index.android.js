/**
 * On Android the keyboard covers the input fields on the bottom of the view. This component moves the
 * view up with the keyboard allowing the user to see what they are typing.
 */
import ReactNativeKeyboardSpacer from 'react-native-keyboard-spacer';
import React from 'react';
import {StatusBar} from 'react-native';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';

const propTypes = {
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    androidEnable: false,
};

const KeyboardSpacer = props => (
    props.androidEnable ? <ReactNativeKeyboardSpacer topSpacing={StatusBar.currentHeight} /> : null
);

KeyboardSpacer.propTypes = propTypes;
KeyboardSpacer.defaultProps = defaultProps;
KeyboardSpacer.displayName = 'KeyboardSpacer';
export default withWindowDimensions(KeyboardSpacer);
