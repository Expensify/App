/**
 * On iOS the keyboard covers the input fields on the bottom of the view. This component moves the view up with the
 * keyboard allowing the user to see what they are typing.
 */
import ReactNativeKeyboardSpacer from 'react-native-keyboard-spacer';
import React from 'react';
import {Dimensions} from 'react-native';

function hasSafeAreas() {
    const dims = Dimensions.get('window');
    const heightsIphonesWithNotches = [812, 896, 844, 926];
    return (heightsIphonesWithNotches.includes(dims.height) || heightsIphonesWithNotches.includes(dims.width));
}

const KeyboardSpacer = () => (
    <ReactNativeKeyboardSpacer topSpacing={hasSafeAreas() ? -30 : 0} />
);

export default KeyboardSpacer;
