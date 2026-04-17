import {FocusTrap} from 'focus-trap-react';
import React, {useRef} from 'react';
import sharedTrapStack from '@components/FocusTrap/sharedTrapStack';
import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import {scheduleClearActivePopoverLauncher, setActivePopoverLauncher} from '@libs/NavigationFocusReturn';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import type FocusTrapForModalProps from './FocusTrapForModalProps';

function FocusTrapForModal({children, active, initialFocus = false, shouldPreventScroll = false, shouldReturnFocus = true}: FocusTrapForModalProps) {
    // Track this trap's own launcher so onPostDeactivate targets the right stack entry (nested / sequential traps share the stack).
    const cachedLauncherRef = useRef<HTMLElement | null>(null);
    return (
        <FocusTrap
            active={active}
            focusTrapOptions={{
                onActivate: () => {
                    // Capture the launcher before blur — items inside the trap get removed on close.
                    // Coexists with setReturnFocus (below): that handles same-screen close; this cache only fires if a navigation state change follows.
                    const launcher = document.activeElement;
                    blurActiveElement();
                    // Respect shouldReturnFocus={false} (e.g. DatePickerModal) — skip the launcher cache entirely.
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
                    // Defer so popover paths that navigate after modal-hide can still consume the launcher.
                    scheduleClearActivePopoverLauncher(launcher);
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
