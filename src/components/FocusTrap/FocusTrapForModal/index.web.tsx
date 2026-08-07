import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import {markActivePopoverLauncherDeactivated, setActivePopoverLauncher} from '@libs/LauncherStack';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import restoreFocusWithModality from '@libs/restoreFocusWithModality';
import sharedTrapStack from '@libs/sharedTrapStack';

import {FocusTrap} from 'focus-trap-react';
import React, {useRef} from 'react';

import type FocusTrapForModalProps from './FocusTrapForModalProps';

function FocusTrapForModal({
    children,
    active,
    initialFocus = false,
    shouldPreventScroll = false,
    shouldReturnFocus = true,
    clickOutsideDeactivates,
    allowOutsideClick,
}: FocusTrapForModalProps) {
    // Track this trap's own launcher so onPostDeactivate targets the right shared-stack entry.
    const cachedLauncherRef = useRef<HTMLElement | null>(null);
    return (
        <FocusTrap
            active={active}
            focusTrapOptions={{
                onActivate: () => {
                    const launcher = document.activeElement;
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
                clickOutsideDeactivates: clickOutsideDeactivates ?? true,
                allowOutsideClick,
                initialFocus,
                fallbackFocus: () => document.body,
                setReturnFocus: false,
            }}
        >
            {children}
        </FocusTrap>
    );
}

export default FocusTrapForModal;
