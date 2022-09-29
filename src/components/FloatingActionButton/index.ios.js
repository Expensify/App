import React from 'react';
import {
    KeyboardAvoidingView,
} from 'react-native';

import FloatingActionButtonBase from './FloatingActionButtonBase';
import floatingActionButtonPropTypes from './floatingActionButtonPropTypes';

// KeyboardAvoidingView only need in IOS so that's the reason make platform specific FloatingActionButton component.
const FloatingActionButton = props => (
    <KeyboardAvoidingView behavior="position">
        <FloatingActionButtonBase onPress={props.onPress} isActive={props.isActive} />
    </KeyboardAvoidingView>
);

FloatingActionButton.propTypes = floatingActionButtonPropTypes;
FloatingActionButton.displayName = 'Fab';
export default FloatingActionButton;
