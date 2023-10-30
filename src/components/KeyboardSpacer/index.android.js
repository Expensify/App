/**
 * On Android the keyboard covers the input fields on the bottom of the view. This component moves the
 * view up with the keyboard allowing the user to see what they are typing.
 */
import React from 'react';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import StatusBar from '@libs/StatusBar';
import BaseKeyboardSpacer from './BaseKeyboardSpacer';

function KeyboardSpacer() {
    return (
        <BaseKeyboardSpacer
            topSpacing={StatusBar.currentHeight}
            keyboardShowMethod="keyboardDidShow"
            keyboardHideMethod="keyboardDidHide"
        />
    );
}

KeyboardSpacer.propTypes = windowDimensionsPropTypes;
KeyboardSpacer.displayName = 'KeyboardSpacer';

export default withWindowDimensions(KeyboardSpacer);
