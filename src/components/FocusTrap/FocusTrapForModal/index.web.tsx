import FocusTrap from 'focus-trap-react';
import React from 'react';
import sharedTrapStack from '@components/FocusTrap/sharedTrapStack';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import type FocusTrapForModalProps from './FocusTrapForModalProps';

function FocusTrapForModal({children, active, initialFocus = false}: FocusTrapForModalProps) {
    return (
        <FocusTrap
            active={active}
            focusTrapOptions={{
                trapStack: sharedTrapStack,
                clickOutsideDeactivates: true,
                initialFocus,
                fallbackFocus: document.body,
                setReturnFocus: (element) => {
                    if (ReportActionComposeFocusManager.isFocused()) {
                        return false;
                    }
                    return element;
                },
            }}
        >
            {children}
        </FocusTrap>
    );
}

FocusTrapForModal.displayName = 'FocusTrapForModal';

export default FocusTrapForModal;
