/**
 * On iOS the keyboard covers the input fields on the bottom of the view. This component moves the view up with the
 * keyboard allowing the user to see what they are typing.
 */
import React from 'react';
import BaseKeyboardSpacer from './BaseKeyboardSpacer';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';
import * as StyleUtils from '../../styles/StyleUtils';

const defaultProps = {
    keyboardShowMethod: '',
    keyboardHideMethod: '',
    iOSAnimated: false,
    topSpacing:{}
};

const KeyboardSpacer = props => (
    <BaseKeyboardSpacer
        style={props.style}
        topSpacing={StyleUtils.hasSafeAreas(props.windowWidth, props.windowHeight) ? -30 : 0}
        keyboardShowMethod="keyboardWillShow"
        keyboardHideMethod="keyboardWillHide"
        iOSAnimated
    />
);

KeyboardSpacer.propTypes = windowDimensionsPropTypes;
KeyboardSpacer.defaultProps = defaultProps;
KeyboardSpacer.displayName = 'KeyboardSpacer';

export default withWindowDimensions(KeyboardSpacer);
