import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {FocusTrap} from 'focus-trap-react';
import React, {useEffect, useLayoutEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import sharedTrapStack from '@components/FocusTrap/sharedTrapStack';
import TOP_TAB_SCREENS from '@components/FocusTrap/TOP_TAB_SCREENS';
import WIDE_LAYOUT_INACTIVE_SCREENS from '@components/FocusTrap/WIDE_LAYOUT_INACTIVE_SCREENS';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import focusElementProgrammatically, {isElementFocusRestorable, markElementForProgrammaticFocus} from '@libs/focusUtils/focusElementProgrammatically';
import {isSidebarScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import NavigationFocusManager from '@libs/NavigationFocusManager';
import {NAVIGATION_FOCUS_ROUTE_DATASET_KEY} from '@libs/NavigationFocusManager/constants';
import CONST from '@src/CONST';
import type FocusTrapProps from './FocusTrapProps';

function FocusTrapForScreen({children, focusTrapSettings}: FocusTrapProps) {
    const isFocused = useIsFocused();
    const route = useRoute();
    const navigation = useNavigation();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const routeKey = typeof route.key === 'string' && route.key.length > 0 ? route.key : undefined;
    const prevIsFocused = useRef(isFocused);
    const wasNavigatedTo = useRef(false);
    const shouldRestoreFocusWithoutTrap = useRef(false);

    useEffect(() => {
        return () => {
            if (!routeKey) {
                return;
            }
            NavigationFocusManager.unregisterFocusedRoute(routeKey);
        };
    }, [routeKey]);

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
        if (isSidebarScreenName(route.name)) {
            return false;
        }

        if (TOP_TAB_SCREENS.find((screen) => screen === route.name)) {
            return isFocused;
        }

        if (WIDE_LAYOUT_INACTIVE_SCREENS.includes(route.name) && !shouldUseNarrowLayout) {
            return false;
        }

        return isFocused;
    }, [isFocused, shouldUseNarrowLayout, route.name, focusTrapSettings?.active]);

    const routeBoundaryDataSet = useMemo(
        () =>
            routeKey
                ? {
                      [NAVIGATION_FOCUS_ROUTE_DATASET_KEY]: routeKey,
                  }
                : undefined,
        [routeKey],
    );

    useLayoutEffect(() => {
        if (!routeKey) {
            prevIsFocused.current = isFocused;
            shouldRestoreFocusWithoutTrap.current = false;
            return;
        }

        const wasFocused = prevIsFocused.current;
        const isNowFocused = isFocused;
        const hasStored = NavigationFocusManager.hasKeyboardStoredFocus(routeKey);
        const isTransitionToFocused = !wasFocused && isNowFocused;
        const isFreshMountReturning = wasFocused && isNowFocused && hasStored;
        const isReturningToScreen = isTransitionToFocused || isFreshMountReturning;

        if (wasFocused && !isNowFocused) {
            NavigationFocusManager.captureForRoute(routeKey);
        }

        if (isReturningToScreen && hasStored) {
            if (!isActive) {
                shouldRestoreFocusWithoutTrap.current = true;
            } else {
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
        const capturedElement = NavigationFocusManager.retrieveKeyboardFocusForRoute(routeKey);
        if (!capturedElement || !isElementFocusRestorable(capturedElement)) {
            return;
        }

        requestAnimationFrame(() => {
            focusElementProgrammatically(capturedElement, {preventScroll: true});
        });
    }, [isActive, isFocused, routeKey]);

    return (
        <FocusTrap
            active={isActive}
            paused={!isFocused}
            containerElements={focusTrapSettings?.containerElements?.length ? focusTrapSettings.containerElements : undefined}
            focusTrapOptions={{
                onActivate: () => {
                    const activeElement = document?.activeElement as HTMLElement;
                    if (activeElement?.nodeName !== CONST.ELEMENT_NAME.INPUT && activeElement?.nodeName !== CONST.ELEMENT_NAME.TEXTAREA) {
                        activeElement?.blur();
                    }
                },
                trapStack: sharedTrapStack,
                allowOutsideClick: true,
                clickOutsideDeactivates: true,
                fallbackFocus: document.body,
                delayInitialFocus: CONST.ANIMATED_TRANSITION,
                initialFocus: () => {
                    if (!wasNavigatedTo.current) {
                        return false;
                    }

                    wasNavigatedTo.current = false;

                    if (!routeKey) {
                        return false;
                    }

                    const capturedElement = NavigationFocusManager.retrieveKeyboardFocusForRoute(routeKey);
                    if (capturedElement && isElementFocusRestorable(capturedElement)) {
                        markElementForProgrammaticFocus(capturedElement);
                        return capturedElement;
                    }

                    return false;
                },
                setReturnFocus: (triggerElement) => {
                    if (isElementFocusRestorable(triggerElement)) {
                        return triggerElement;
                    }
                    return false;
                },
                ...(focusTrapSettings?.focusTrapOptions ?? {}),
                preventScroll: true,
            }}
        >
            <View
                style={{flex: 1}}
                dataSet={routeBoundaryDataSet}
            >
                {children}
            </View>
        </FocusTrap>
    );
}

export default FocusTrapForScreen;
