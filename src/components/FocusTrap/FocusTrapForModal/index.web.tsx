import useThemeStyles from '@hooks/useThemeStyles';

import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import {markActivePopoverLauncherDeactivated, pickActiveLauncher, pickLauncher, setActivePopoverLauncher} from '@libs/LauncherStack';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import resolveFocusTrapLauncher from '@libs/resolveFocusTrapLauncher';
import restoreFocusWithModality from '@libs/restoreFocusWithModality';
import sharedTrapStack from '@libs/sharedTrapStack';

import {FocusTrap} from 'focus-trap-react';
import React, {useRef} from 'react';
import {View} from 'react-native';

import type FocusTrapForModalProps from './FocusTrapForModalProps';

function FocusTrapForModal({children, active, initialFocus = false, shouldPreventScroll = false, shouldReturnFocus = true}: FocusTrapForModalProps) {
    const styles = useThemeStyles();
    // Track this trap's own launcher so onPostDeactivate targets the right shared-stack entry.
    const cachedLauncherRef = useRef<HTMLElement | null>(null);
    // Host we own (same pattern as FormElement) — dContents so it does not affect modal layout/alignment.
    const trapContainerRef = useRef<View | null>(null);

    return (
        <FocusTrap
            active={active}
            focusTrapOptions={{
                onActivate: () => {
                    const activeElement = document.activeElement;
                    const fromActive = activeElement instanceof HTMLElement && activeElement !== document.body ? activeElement : null;
                    const container = trapContainerRef.current instanceof HTMLElement ? trapContainerRef.current : null;
                    const launcher = resolveFocusTrapLauncher(fromActive, pickActiveLauncher(), container, pickLauncher());
                    blurActiveElement();
                    if (launcher && document.contains(launcher)) {
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
            <View
                ref={trapContainerRef}
                style={styles.dContents}
            >
                {children}
            </View>
        </FocusTrap>
    );
}

export default FocusTrapForModal;
