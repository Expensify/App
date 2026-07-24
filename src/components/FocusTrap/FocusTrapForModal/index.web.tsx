import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import {markActivePopoverLauncherDeactivated, setActivePopoverLauncher} from '@libs/LauncherStack';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import restoreFocusWithModality from '@libs/restoreFocusWithModality';
import sharedTrapStack from '@libs/sharedTrapStack';

import {FocusTrap} from 'focus-trap-react';
import React, {useRef} from 'react';

import type FocusTrapForModalProps from './FocusTrapForModalProps';

function FocusTrapForModal({children, active, initialFocus = false, shouldPreventScroll = false, shouldReturnFocus = true, launcherRef}: FocusTrapForModalProps) {
    // Track this trap's own launcher so onPostDeactivate targets the right shared-stack entry.
    const cachedLauncherRef = useRef<HTMLElement | null>(null);
    return (
        <FocusTrap
            active={active}
            focusTrapOptions={{
                onActivate: () => {
                    // Capture for nav-back return — independent of shouldReturnFocus (which gates only focus-trap-react's same-screen return below).
                    // Prefer document.activeElement (user's current focus), fall back to launcherRef
                    // for components that blur their trigger before opening the popover.
                    const active = document.activeElement;
                    const fromActive = active instanceof HTMLElement && active !== document.body ? active : null;
                    const fromRef = launcherRef?.current instanceof HTMLElement ? launcherRef.current : null;
                    const launcher = fromActive ?? fromRef;
                    blurActiveElement();
                    if (launcher instanceof HTMLElement && launcher !== document.body) {
                        cachedLauncherRef.current = launcher;
                        setActivePopoverLauncher(launcher);
                    }
                },
                onPostDeactivate: () => {
                    const launcher = cachedLauncherRef.current;
                    cachedLauncherRef.current = null;
                    if (!launcher) {
                        return;
                    }
                    // Mark first so a throw in restoreFocusWithModality can't leak the LauncherStack entry; the deferred clear keeps the post-hide capture window.
                    markActivePopoverLauncherDeactivated(launcher);
                    if (shouldReturnFocus && !ReportActionComposeFocusManager.isFocused() && document.contains(launcher)) {
                        restoreFocusWithModality(launcher, {preventScroll: shouldPreventScroll});
                    }
                },
                preventScroll: shouldPreventScroll,
                trapStack: sharedTrapStack,
                clickOutsideDeactivates: true,
                initialFocus,
                // Lazy so document.body isn't evaluated at render time (SSR-safe).
                fallbackFocus: () => document.body,
                setReturnFocus: false,
            }}
        >
            {children}
        </FocusTrap>
    );
}

export default FocusTrapForModal;
