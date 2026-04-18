import {FocusTrap} from 'focus-trap-react';
import React, {useRef} from 'react';
import sharedTrapStack from '@components/FocusTrap/sharedTrapStack';
import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import {scheduleClearActivePopoverLauncher, setActivePopoverLauncher} from '@libs/LauncherStack';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import type FocusTrapForModalProps from './FocusTrapForModalProps';

function FocusTrapForModal({children, active, initialFocus = false, shouldPreventScroll = false, shouldReturnFocus = true}: FocusTrapForModalProps) {
    // Track this trap's own launcher so onPostDeactivate targets the right shared-stack entry.
    const cachedLauncherRef = useRef<HTMLElement | null>(null);
    return (
        <FocusTrap
            active={active}
            focusTrapOptions={{
                onActivate: () => {
                    // Capture before blur — items inside the trap get removed on close. Only fires if a nav state change follows; setReturnFocus handles same-screen close.
                    const launcher = document.activeElement;
                    blurActiveElement();
                    if (shouldReturnFocus && launcher instanceof HTMLElement && launcher !== document.body) {
                        cachedLauncherRef.current = launcher;
                        setActivePopoverLauncher(launcher);
                    }
                },
                onPostDeactivate: () => {
                    const launcher = cachedLauncherRef.current;
                    cachedLauncherRef.current = null;
                    if (!shouldReturnFocus || !launcher) {
                        return;
                    }
                    // Deferred so popover paths that navigate after modal-hide can still consume.
                    scheduleClearActivePopoverLauncher(launcher);
                },
                preventScroll: shouldPreventScroll,
                trapStack: sharedTrapStack,
                clickOutsideDeactivates: true,
                initialFocus,
                // Lazy so document.body isn't evaluated at render time (SSR-safe).
                fallbackFocus: () => document.body,
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
