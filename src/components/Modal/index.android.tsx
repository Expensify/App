import React from 'react';
import BaseModal from './BaseModal';
import type BaseModalProps from './types';

function Modal({children, ...rest}: BaseModalProps) {
    return <BaseModal {...rest}>{children}</BaseModal>;
}

export default Modal;
