import React from 'react';
import {
    KeyboardAvoidingView,
} from 'react-native';

import FAB from './FAB';
import fabPropTypes from './fabPropTypes';

// KeyboardAvoidingView only need in IOS so that's the reason make platform specific FAB component.
const Fab = props => (
    <KeyboardAvoidingView behavior="position">
        <FAB onPress={props.onPress} isActive={props.isActive} />
    </KeyboardAvoidingView>
);

Fab.propTypes = fabPropTypes;
Fab.displayName = 'Fab';
export default Fab;
