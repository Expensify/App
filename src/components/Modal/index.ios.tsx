import React from 'react';
import BaseModal from './BaseModal';
import type BaseModalProps from './types';

function Modal({children, ...rest}: BaseModalProps) {
    return (
        <BaseModal
            useNativeDriver
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        >
            {children}
        </BaseModal>
    );
}

Modal.displayName = 'Modal';
export default Modal;
