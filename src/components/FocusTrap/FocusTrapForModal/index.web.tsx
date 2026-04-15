import {FocusTrap} from 'focus-trap-react';
import React from 'react';
import sharedTrapStack from '@components/FocusTrap/sharedTrapStack';
import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import {scheduleClearActivePopoverLauncher, setActivePopoverLauncher} from '@libs/NavigationFocusReturn';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import type FocusTrapForModalProps from './FocusTrapForModalProps';

function FocusTrapForModal({children, active, initialFocus = false, shouldPreventScroll = false, shouldReturnFocus = true}: FocusTrapForModalProps) {
    return (
        <FocusTrap
            active={active}
            focusTrapOptions={{
                onActivate: () => {
                    // Capture the launcher before blur — items inside the trap get removed on close.
                    const launcher = document.activeElement;
                    blurActiveElement();
                    // Respect shouldReturnFocus={false} (e.g. DatePickerModal) — skip the launcher cache entirely.
                    if (shouldReturnFocus && launcher instanceof HTMLElement && launcher !== document.body) {
                        setActivePopoverLauncher(launcher);
                    }
                },
                onPostDeactivate: () => {
                    if (!shouldReturnFocus) {
                        return;
                    }
                    // Defer so popover paths that navigate after modal-hide can still consume the launcher.
                    scheduleClearActivePopoverLauncher();
                },
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
