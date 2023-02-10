/**
 * On iOS sometimes the keyboard doesn't dismiss itself
 * when you tap outside of the input that pulled it up.
 * Therefore this component is necessary to ensure users
 * can still dismiss the keyboard on iOS.
 */
import React from 'react';
import {TouchableWithoutFeedback, Keyboard} from 'react-native';
import PropTypes from 'prop-types';
import withKeyboardState, {keyboardStatePropTypes} from '../withKeyboardState';

const propTypes = {
    /** The children which should be contained in this wrapper component. */
    children: PropTypes.node.isRequired,

    ...keyboardStatePropTypes,
};

const TouchableDismissKeyboard = (props) => {
    const dismissKeyboardWhenTappedOutsideOfInput = () => {
        if (!props.isKeyboardShown) {
            return;
        }
        Keyboard.dismiss();
    };

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboardWhenTappedOutsideOfInput}>
            {props.children}
        </TouchableWithoutFeedback>
    );
};

TouchableDismissKeyboard.propTypes = propTypes;
TouchableDismissKeyboard.displayName = 'TouchableDismissKeyboard';

export default withKeyboardState(TouchableDismissKeyboard);
