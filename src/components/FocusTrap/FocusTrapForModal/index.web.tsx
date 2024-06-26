import FocusTrap from 'focus-trap-react';
import React from 'react';
import sharedTrapStack from '@components/FocusTrap/sharedTrapStack';
import type FocusTrapForModalProps from './FocusTrapForModalProps';

function FocusTrapForModal({children, active}: FocusTrapForModalProps) {
    return (
        <FocusTrap
            active={active}
            focusTrapOptions={{
                trapStack: sharedTrapStack,
                clickOutsideDeactivates: true,
                initialFocus: false,
                fallbackFocus: document.body,
            }}
        >
            {children}
        </FocusTrap>
    );
}

FocusTrapForModal.displayName = 'FocusTrapForModal';

export default FocusTrapForModal;
