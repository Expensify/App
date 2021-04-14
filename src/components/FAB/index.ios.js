import React from 'react';
import {
    KeyboardAvoidingView,
} from 'react-native';

import FAB from './FAB';
import fabPropTypes from './fabPropTypes';

// KeyboardAvoidingView only need in IOS so that's the reason make platform specific FAB component.
function Fab({onPress, isActive}) {
    return (
        <KeyboardAvoidingView behavior="position">
            <FAB onPress={onPress} isActive={isActive} />
        </KeyboardAvoidingView>
    );
}

Fab.propTypes = fabPropTypes;
export default Fab;
