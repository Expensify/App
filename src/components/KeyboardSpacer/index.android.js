/**
 * On Android the keyboard covers the input fields on the bottom of the view. This component moves the
 * view up with the keyboard allowing the user to see what they are typing.
 */
import React from 'react';
import {StatusBar} from 'react-native';
import BaseKeyboardSpacer from './BaseKeyboardSpacer';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';

const KeyboardSpacer = () => (
    <BaseKeyboardSpacer
        topSpacing={StatusBar.currentHeight}
        keyboardShowMethod="keyboardDidShow"
        keyboardHideMethod="keyboardDidHide"
    />
);

KeyboardSpacer.propTypes = windowDimensionsPropTypes;
KeyboardSpacer.displayName = 'KeyboardSpacer';

export default withWindowDimensions(KeyboardSpacer);
