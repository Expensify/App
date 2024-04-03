import FocusTrapOriginal from 'focus-trap-react';
import React from 'react';
import sharedTrapStack from '@components/FocusTrap/sharedTrapStack';
import type FocusTrapForModalProps from './FocusTrapForModalProps';

function FocusTrapForModal({children, active}: FocusTrapForModalProps) {
    return (
        <FocusTrapOriginal
            active={active}
            focusTrapOptions={{
                trapStack: sharedTrapStack,
                allowOutsideClick: true,
                fallbackFocus: document.body,
            }}
        >
            {children}
        </FocusTrapOriginal>
    );
}

FocusTrapForModal.displayName = 'FocusTrapForModal';

export default FocusTrapForModal;
