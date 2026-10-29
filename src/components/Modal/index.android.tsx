import React from 'react';

import type BaseModalProps from './types';

import BaseModal from './BaseModal';

function Modal({children, ...rest}: BaseModalProps) {
    return <BaseModal {...rest}>{children}</BaseModal>;
}

export default Modal;
