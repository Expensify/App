/**
 * On iOS the keyboard covers the input fields on the bottom of the view. This component moves the view up with the
 * keyboard allowing the user to see what they are typing.
 */
import ReactNativeKeyboardSpacer from 'react-native-keyboard-spacer';
import React from 'react';

const KeyboardSpacer = () => (
    <ReactNativeKeyboardSpacer topSpacing={-30} />
);

export default KeyboardSpacer;
