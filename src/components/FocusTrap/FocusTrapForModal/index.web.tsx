import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import {hasLauncher, markActivePopoverLauncherDeactivated, pickLauncher, setActivePopoverLauncher} from '@libs/LauncherStack';
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
    // How many traps were already active when we opened. focus-trap pushes us onto the stack *after* onActivate and
    // removes us *before* onPostDeactivate, so comparing against this tells an ancestor trap (was already there) apart
    // from one that opened on top of us while we were open.
    const trapDepthAtActivateRef = useRef(0);

    const onFocusTrapActive = () => {
        trapDepthAtActivateRef.current = sharedTrapStack.length;
        // Capture for nav-back return. This is independent of shouldReturnFocus, which gates only focus-trap-react's same-screen return below.
        const activeElement = document.activeElement;
        blurActiveElement();
        // What actually held focus wins; then the anchor, for triggers that blur themselves before opening.
        // The LauncherStack is the last resort for modals with no anchor at all. For example, the global confirm modal
        // opened from a popover has neither a focused element nor an anchorRef, but the popover that opened
        // it registered its own launcher, and that is the element the user came from.
        const launcher = activeElement instanceof HTMLElement && activeElement !== document.body ? activeElement : (resolveLauncherElement(launcherRef) ?? pickLauncher());
        // Assigned unconditionally so this activation can never inherit a previous one's launcher.
        cachedLauncherRef.current = launcher;
        if (launcher) {
            setActivePopoverLauncher(launcher);
        }
    };

    const onFocusTrapPostDeactivate = () => {
        const launcher = cachedLauncherRef.current;
        cachedLauncherRef.current = null;
        if (!launcher) {
            return;
        }
        // A forward navigation consumes the launcher off the stack (captureTriggerForRoute), handing the
        // restore to NavigationFocusReturn's Back handling. Returning focus here as well would yank it
        // away from the destination screen's own autofocus, for example FAB > Start chat losing its search input.
        const wasClaimedByNavigation = !hasLauncher(launcher);
        // A trap opened on top of us and still owns focus (e.g. selecting "Create report" in the FAB menu
        // opens the empty-report confirm modal). Returning focus to our launcher would pull the focus ring
        // out to the FAB behind that modal, and leave the user nothing to return to when it closes.
        const isCoveredByNewerTrap = sharedTrapStack.length > trapDepthAtActivateRef.current;
        // Mark first so a throw in restoreFocusWithModality can't leak the LauncherStack entry; the deferred clear keeps the post-hide capture window.
        markActivePopoverLauncherDeactivated(launcher);
        if (!wasClaimedByNavigation && !isCoveredByNewerTrap && shouldReturnFocus && !ReportActionComposeFocusManager.isFocused() && document.contains(launcher)) {
            restoreFocusWithModality(launcher, {preventScroll: shouldPreventScroll});
        }
    };

    return (
        <FocusTrap
            active={active}
            focusTrapOptions={{
                onActivate: onFocusTrapActive,
                onPostDeactivate: onFocusTrapPostDeactivate,
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
