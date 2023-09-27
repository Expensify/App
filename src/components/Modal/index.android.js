import React from 'react';
import {AppState} from 'react-native';
import withWindowDimensions from '../withWindowDimensions';
import BaseModal from './BaseModal';
import {propTypes, defaultProps} from './modalPropTypes';
import ComposerFocusManager from '../../libs/ComposerFocusManager';

AppState.addEventListener('focus', () => {
    ComposerFocusManager.setReadyToFocus();
});

AppState.addEventListener('blur', () => {
    ComposerFocusManager.resetReadyToFocus();
});

// Only want to use useNativeDriver on Android. It has strange flashes issue on IOS
// https://github.com/react-native-modal/react-native-modal#the-modal-flashes-in-a-weird-way-when-animating
function Modal(props) {
    return (
        <BaseModal
            useNativeDriver
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {props.children}
        </BaseModal>
    );
}

Modal.propTypes = propTypes;
Modal.defaultProps = defaultProps;
Modal.displayName = 'Modal';
export default withWindowDimensions(Modal);
