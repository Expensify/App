import React from 'react';
import withWindowDimensions from '@components/withWindowDimensions';
import BaseModal from './BaseModal';
import BaseModalProps from './types';

function Modal({children, ...rest}: BaseModalProps) {
    return (
        <BaseModal
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        >
            {children}
        </BaseModal>
    );
}

Modal.displayName = 'Modal';
export default withWindowDimensions(Modal);
