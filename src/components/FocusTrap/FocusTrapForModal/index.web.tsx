import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import {markActivePopoverLauncherDeactivated, setActivePopoverLauncher} from '@libs/LauncherStack';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import restoreFocusWithModality from '@libs/restoreFocusWithModality';
import sharedTrapStack from '@libs/sharedTrapStack';

import {FocusTrap} from 'focus-trap-react';
import React, {useRef} from 'react';

import type FocusTrapForModalProps from './FocusTrapForModalProps';

/** On web an RN `View` ref IS the DOM node, so narrow with `instanceof` rather than casting. A detached anchor can never take focus, so it is no better than nothing. */
function resolveLauncherElement(ref: FocusTrapForModalProps['launcherRef']): HTMLElement | null {
    const node = ref?.current;
    if (!(node instanceof HTMLElement) || !document.contains(node)) {
        return null;
    }
    return node;
}

function FocusTrapForModal({children, active, initialFocus = false, shouldPreventScroll = false, shouldReturnFocus = true, launcherRef}: FocusTrapForModalProps) {
    // Track this trap's own launcher so onPostDeactivate targets the right shared-stack entry.
    const cachedLauncherRef = useRef<HTMLElement | null>(null);
    return (
        <FocusTrap
            active={active}
            focusTrapOptions={{
                onActivate: () => {
                    // Capture for nav-back return — independent of shouldReturnFocus (which gates only focus-trap-react's same-screen return below).
                    const activeElement = document.activeElement;
                    blurActiveElement();
                    // What actually held focus wins; the anchor is the fallback for triggers that blur themselves
                    // before opening, which would otherwise leave us with `body` and no launcher at all.
                    const launcher = activeElement instanceof HTMLElement && activeElement !== document.body ? activeElement : resolveLauncherElement(launcherRef);
                    if (launcher) {
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
