import React from 'react';
import BaseModal from './BaseModal';
import type BaseModalProps from './types';

// Only want to use useNativeDriver on Android. It has strange flashes issue on IOS
// https://github.com/react-native-modal/react-native-modal#the-modal-flashes-in-a-weird-way-when-animating
function Modal({useNativeDriver = true, ...rest}: BaseModalProps) {
    return (
        <BaseModal
            useNativeDriver={useNativeDriver}
            useNativeDriverForBackdrop={false}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        >
            {rest.children}
        </BaseModal>
    );
}

Modal.displayName = 'Modal';
export default Modal;
