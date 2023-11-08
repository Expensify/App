import React from 'react';
import {AppState} from 'react-native';
import withWindowDimensions from '@components/withWindowDimensions';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import BaseModal from './BaseModal';
import BaseModalProps from './types';

AppState.addEventListener('focus', () => {
    ComposerFocusManager.setReadyToFocus();
});

AppState.addEventListener('blur', () => {
    ComposerFocusManager.resetReadyToFocus();
});

// Only want to use useNativeDriver on Android. It has strange flashes issue on IOS
// https://github.com/react-native-modal/react-native-modal#the-modal-flashes-in-a-weird-way-when-animating
function Modal(props: BaseModalProps) {
    return (
        <BaseModal
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {props.children}
        </BaseModal>
    );
}

Modal.displayName = 'Modal';
export default withWindowDimensions(Modal);
