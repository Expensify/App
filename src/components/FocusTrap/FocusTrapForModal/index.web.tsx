import {FocusTrap} from 'focus-trap-react';
import React from 'react';
import sharedTrapStack from '@components/FocusTrap/sharedTrapStack';
import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import type FocusTrapForModalProps from './FocusTrapForModalProps';

function FocusTrapForModal({children, active, initialFocus = false, shouldPreventScroll = false, shouldReturnFocus = true}: FocusTrapForModalProps) {
    return (
        <FocusTrap
            active={active}
            focusTrapOptions={{
                onActivate: blurActiveElement,
                preventScroll: shouldPreventScroll,
                trapStack: sharedTrapStack,
                clickOutsideDeactivates: true,
                initialFocus,
                fallbackFocus: document.body,
                setReturnFocus: (element) => {
                    if (ReportActionComposeFocusManager.isFocused()) {
                        return false;
                    }
                    if (shouldReturnFocus) {
                        return element;
                    }
                    return false;
                },
            }}
        >
            {children}
        </FocusTrap>
    );
}

export default FocusTrapForModal;
