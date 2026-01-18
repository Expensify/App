import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {FocusTrap} from 'focus-trap-react';
import React, {useEffect, useLayoutEffect, useMemo, useRef} from 'react';
import sharedTrapStack from '@components/FocusTrap/sharedTrapStack';
import TOP_TAB_SCREENS from '@components/FocusTrap/TOP_TAB_SCREENS';
import WIDE_LAYOUT_INACTIVE_SCREENS from '@components/FocusTrap/WIDE_LAYOUT_INACTIVE_SCREENS';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {isSidebarScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import NavigationFocusManager from '@libs/NavigationFocusManager';
import CONST from '@src/CONST';
import type FocusTrapProps from './FocusTrapProps';

/**
 * Checks if an element is focusable (visible, not disabled, and in the DOM).
 * This prevents attempting to focus elements that have been hidden or disabled
 * since they were captured.
 */
function isElementFocusable(element: Element | null): boolean {
    if (!element || element === document.body || element === document.documentElement || !document.body.contains(element)) {
        return false;
    }

    // Check if element is hidden (display: none makes offsetParent null, except for body/html/fixed elements)
    // For fixed/absolute positioned elements, we check visibility and dimensions
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
        return false;
    }

    // Check if element has zero dimensions (effectively hidden)
    // Only HTMLElement has offsetWidth/offsetHeight, SVGElement uses getBoundingClientRect
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
        return false;
    }

    // Check for disabled attribute (applies to buttons, inputs, etc.)
    if (element.hasAttribute('disabled')) {
        return false;
    }

    // Check for inert attribute (makes element and descendants non-interactive)
    if (element.hasAttribute('inert') || element.closest('[inert]')) {
        return false;
    }

    return true;
}

function FocusTrapForScreen({children, focusTrapSettings}: FocusTrapProps) {
    const isFocused = useIsFocused();
    const route = useRoute();
    const navigation = useNavigation();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    // Track previous focus state to detect transitions
    const prevIsFocused = useRef(isFocused);

    // Track if this screen was navigated to (vs initial page load)
    // This prevents focus restoration on initial page load (Issue #46109)
    const wasNavigatedTo = useRef(false);

    // Unregister focused route on unmount
    useEffect(() => {
        return () => {
            NavigationFocusManager.unregisterFocusedRoute(route.key);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Register/unregister focused route for immediate capture
    useEffect(() => {
        if (isFocused) {
            NavigationFocusManager.registerFocusedRoute(route.key);
        } else {
            NavigationFocusManager.unregisterFocusedRoute(route.key);
        }
    }, [isFocused, route.key]);

    // Capture focus before screen is removed from navigation stack
    // This handles back navigation where screen may unmount before useLayoutEffect runs
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            NavigationFocusManager.captureForRoute(route.key);
        });
        return unsubscribe;
    }, [navigation, route.key]);

    const isActive = useMemo(() => {
        if (typeof focusTrapSettings?.active !== 'undefined') {
            return focusTrapSettings.active;
        }
        // Focus trap can't be active on sidebar screens because it would block access to the tab bar.
        if (isSidebarScreenName(route.name)) {
            return false;
        }

        // In top tabs only focus trap for currently shown tab should be active
        if (TOP_TAB_SCREENS.find((screen) => screen === route.name)) {
            return isFocused;
        }

        // Focus trap can't be active on these screens if the layout is wide because they may be displayed side by side.
        if (WIDE_LAYOUT_INACTIVE_SCREENS.includes(route.name) && !shouldUseNarrowLayout) {
            return false;
        }
        return isFocused;
    }, [isFocused, shouldUseNarrowLayout, route.name, focusTrapSettings?.active]);

    // Capture focus when screen loses focus (navigating away) and restore when returning
    // useLayoutEffect runs synchronously, minimizing the timing window
    useLayoutEffect(() => {
        const wasFocused = prevIsFocused.current;
        const isNowFocused = isFocused;
        const hasStored = NavigationFocusManager.hasStoredFocus(route.key);

        // Detect returning to screen: either normal transition or fresh mount with stored focus
        // Fresh mount case: non-persistent screens remount with isFocused=true, so prevIsFocused
        // initializes to true. We use hasStoredFocus to detect this is a "return" not initial load.
        const isTransitionToFocused = !wasFocused && isNowFocused;
        const isFreshMountReturning = wasFocused && isNowFocused && hasStored;
        const isReturningToScreen = isTransitionToFocused || isFreshMountReturning;

        if (wasFocused && !isNowFocused) {
            // Screen is losing focus (forward navigation) - capture the focused element
            NavigationFocusManager.captureForRoute(route.key);
        }

        if (isReturningToScreen && hasStored) {
            // For screens where FocusTrap is not active (e.g., wide layout screens in WIDE_LAYOUT_INACTIVE_SCREENS),
            // we need to manually restore focus since initialFocus callback won't be called.
            // For active traps, initialFocus handles focus restoration.
            if (!isActive) {
                const capturedElement = NavigationFocusManager.retrieveForRoute(route.key);
                if (capturedElement && isElementFocusable(capturedElement)) {
                    // Defer focus until after browser paint. useLayoutEffect runs synchronously
                    // before paint, and immediate focus() may not work reliably.
                    // Using requestAnimationFrame (not setTimeout) as it semantically means
                    // "after next paint" - the element is already validated via isElementFocusable().
                    requestAnimationFrame(() => {
                        capturedElement.focus();
                    });
                }
            } else {
                // For active traps, let initialFocus handle it
                wasNavigatedTo.current = true;
            }
        }

        prevIsFocused.current = isFocused;
    }, [isFocused, route.key, isActive]);

    return (
        <FocusTrap
            active={isActive}
            paused={!isFocused}
            containerElements={focusTrapSettings?.containerElements?.length ? focusTrapSettings.containerElements : undefined}
            focusTrapOptions={{
                onActivate: () => {
                    // Blur non-input elements to prevent visual artifacts
                    const activeElement = document?.activeElement as HTMLElement;
                    if (activeElement?.nodeName !== CONST.ELEMENT_NAME.INPUT && activeElement?.nodeName !== CONST.ELEMENT_NAME.TEXTAREA) {
                        activeElement?.blur();
                    }
                },
                trapStack: sharedTrapStack,
                allowOutsideClick: true,
                // Clicking outside should break the trap so side panel can remain interactive.
                clickOutsideDeactivates: true,
                fallbackFocus: document.body,
                delayInitialFocus: CONST.ANIMATED_TRANSITION,

                // initialFocus is called when the trap ACTIVATES (returning to a screen)
                // This is the correct place to restore focus, NOT setReturnFocus
                initialFocus: () => {
                    // Don't restore focus on initial page load (Issue #46109)
                    if (!wasNavigatedTo.current) {
                        return false;
                    }

                    // Reset the flag
                    wasNavigatedTo.current = false;

                    // Retrieve the element captured when we left this screen
                    const capturedElement = NavigationFocusManager.retrieveForRoute(route.key);

                    // Use captured element if it's still focusable
                    if (capturedElement && isElementFocusable(capturedElement)) {
                        return capturedElement;
                    }

                    // Don't focus anything if no valid element
                    return false;
                },

                // setReturnFocus handles non-navigation deactivation (e.g., click outside)
                // It should NOT handle navigation focus restoration
                setReturnFocus: (triggerElement) => {
                    // For click-outside deactivation, return to trigger element if focusable
                    if (isElementFocusable(triggerElement)) {
                        return triggerElement;
                    }
                    return false;
                },

                ...(focusTrapSettings?.focusTrapOptions ?? {}),
            }}
        >
            {children}
        </FocusTrap>
    );
}

export default FocusTrapForScreen;
