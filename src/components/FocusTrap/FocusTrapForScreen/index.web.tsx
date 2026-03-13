import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {FocusTrap} from 'focus-trap-react';
import React, {useEffect, useLayoutEffect, useMemo, useRef} from 'react';
import type {ViewProps} from 'react-native';
import sharedTrapStack from '@components/FocusTrap/sharedTrapStack';
import TOP_TAB_SCREENS from '@components/FocusTrap/TOP_TAB_SCREENS';
import WIDE_LAYOUT_INACTIVE_SCREENS from '@components/FocusTrap/WIDE_LAYOUT_INACTIVE_SCREENS';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import FocusUtils from '@libs/focusUtils';
import {isSidebarScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import NavigationFocusManager from '@libs/NavigationFocusManager';
import {NAVIGATION_FOCUS_ROUTE_DATASET_KEY} from '@libs/NavigationFocusManager/constants';
import CONST from '@src/CONST';
import type FocusTrapProps from './FocusTrapProps';

type FocusBoundaryChildProps = {
    dataSet?: ViewProps['dataSet'];
};

function FocusTrapForScreen({children, focusTrapSettings}: FocusTrapProps) {
    const isFocused = useIsFocused();
    const route = useRoute();
    const navigation = useNavigation();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    // route.key is required by React Navigation type contracts, but we still guard malformed test mocks.
    const routeKey = typeof route.key === 'string' && route.key.length > 0 ? route.key : undefined;

    // Track previous focus state to detect transitions
    const prevIsFocused = useRef(isFocused);

    // Track if this screen was navigated to (vs initial page load)
    // This prevents focus restoration on initial page load (Issue #46109)
    const wasNavigatedTo = useRef(false);
    const shouldRestoreFocusWithoutTrap = useRef(false);

    // Unregister focused route on unmount
    useEffect(() => {
        return () => {
            if (!routeKey) {
                return;
            }
            NavigationFocusManager.unregisterFocusedRoute(routeKey);
        };
    }, [routeKey]);

    // Register/unregister focused route for immediate capture
    useEffect(() => {
        if (!routeKey) {
            return;
        }
        if (isFocused) {
            NavigationFocusManager.registerFocusedRoute(routeKey);
        } else {
            NavigationFocusManager.unregisterFocusedRoute(routeKey);
        }
    }, [isFocused, routeKey]);

    // Capture focus before screen is removed from navigation stack
    // This handles back navigation where screen may unmount before useLayoutEffect runs
    useEffect(() => {
        if (!routeKey) {
            return;
        }
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            NavigationFocusManager.captureForRoute(routeKey);
        });
        return unsubscribe;
    }, [navigation, routeKey]);

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

    const childrenWithRouteBoundary = useMemo(() => {
        if (!routeKey || !React.isValidElement<FocusBoundaryChildProps>(children) || children.type === React.Fragment) {
            return children;
        }

        const existingDataSet = children.props.dataSet;
        if (existingDataSet?.[NAVIGATION_FOCUS_ROUTE_DATASET_KEY] === routeKey) {
            return children;
        }

        return React.cloneElement(children, {
            dataSet: {
                ...existingDataSet,
                [NAVIGATION_FOCUS_ROUTE_DATASET_KEY]: routeKey,
            },
        });
    }, [children, routeKey]);

    // Capture focus transitions synchronously.
    // Keep this effect minimal to avoid doing deferred restore work in layout phase.
    useLayoutEffect(() => {
        if (!routeKey) {
            prevIsFocused.current = isFocused;
            shouldRestoreFocusWithoutTrap.current = false;
            return;
        }

        const wasFocused = prevIsFocused.current;
        const isNowFocused = isFocused;
        const hasStored = NavigationFocusManager.hasStoredFocus(routeKey);

        // Detect returning to screen: either normal transition or fresh mount with stored focus
        // Fresh mount case: non-persistent screens remount with isFocused=true, so prevIsFocused
        // initializes to true. We use hasStoredFocus to detect this is a "return" not initial load.
        const isTransitionToFocused = !wasFocused && isNowFocused;
        const isFreshMountReturning = wasFocused && isNowFocused && hasStored;
        const isReturningToScreen = isTransitionToFocused || isFreshMountReturning;

        if (wasFocused && !isNowFocused) {
            // Screen is losing focus (forward navigation) - capture the focused element
            NavigationFocusManager.captureForRoute(routeKey);
        }

        if (isReturningToScreen && hasStored) {
            if (!isActive) {
                shouldRestoreFocusWithoutTrap.current = true;
            } else {
                // For active traps, let initialFocus handle it
                wasNavigatedTo.current = true;
                shouldRestoreFocusWithoutTrap.current = false;
            }
        } else {
            shouldRestoreFocusWithoutTrap.current = false;
        }

        prevIsFocused.current = isFocused;
    }, [isFocused, routeKey, isActive]);

    useEffect(() => {
        if (!routeKey || !isFocused || isActive || !shouldRestoreFocusWithoutTrap.current) {
            return;
        }

        shouldRestoreFocusWithoutTrap.current = false;
        const capturedElement = NavigationFocusManager.retrieveForRoute(routeKey);
        if (!capturedElement || !FocusUtils.isElementFocusRestorable(capturedElement)) {
            return;
        }

        requestAnimationFrame(() => {
            capturedElement.focus();
        });
    }, [isActive, isFocused, routeKey]);

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

                    if (!routeKey) {
                        return false;
                    }

                    // Retrieve the element captured when we left this screen
                    const capturedElement = NavigationFocusManager.retrieveForRoute(routeKey);

                    // Use captured element if it's still focusable
                    if (capturedElement && FocusUtils.isElementFocusRestorable(capturedElement)) {
                        return capturedElement;
                    }

                    // Don't focus anything if no valid element
                    return false;
                },

                // setReturnFocus handles non-navigation deactivation (e.g., click outside)
                // It should NOT handle navigation focus restoration
                setReturnFocus: (triggerElement) => {
                    // For click-outside deactivation, return to trigger element if focusable
                    if (FocusUtils.isElementFocusRestorable(triggerElement)) {
                        return triggerElement;
                    }
                    return false;
                },

                ...(focusTrapSettings?.focusTrapOptions ?? {}),
            }}
        >
            {childrenWithRouteBoundary}
        </FocusTrap>
    );
}

export default FocusTrapForScreen;
