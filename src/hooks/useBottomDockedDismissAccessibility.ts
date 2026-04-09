import {useCallback, useEffect, useRef, useState} from 'react';
import type {RefObject} from 'react';
import {AccessibilityInfo} from 'react-native';
import type {View as RNView} from 'react-native';
import Accessibility from '@libs/Accessibility';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';

type UseBottomDockedDismissAccessibilityParams = {
    isVisible: boolean;
    shouldActivate: boolean;
    animationDelayMs: number;
    onModalShow?: () => void;
    shouldConfirmFirstItemFocus?: boolean;
    focusedIndex?: number;
    maxFocusRetries?: number;
    nativeFocusRetryDelayMs?: number;
};

type UseBottomDockedDismissAccessibilityResult = {
    firstItemRef: RefObject<RNView | null>;
    handleFirstItemFocus: () => void;
    handleModalShow: () => void;
    shouldEnableBottomDockedDismissAccessibility?: boolean;
};

const DEFAULT_MAX_FIRST_MENU_ITEM_FOCUS_RETRIES = 5;
const DEFAULT_FIRST_MENU_ITEM_NATIVE_FOCUS_RETRY_DELAY_MS = 50;

function useBottomDockedDismissAccessibility({
    isVisible,
    shouldActivate,
    animationDelayMs,
    onModalShow,
    shouldConfirmFirstItemFocus = false,
    focusedIndex,
    maxFocusRetries = DEFAULT_MAX_FIRST_MENU_ITEM_FOCUS_RETRIES,
    nativeFocusRetryDelayMs = DEFAULT_FIRST_MENU_ITEM_NATIVE_FOCUS_RETRY_DELAY_MS,
}: UseBottomDockedDismissAccessibilityParams): UseBottomDockedDismissAccessibilityResult {
    const platform = getPlatform();
    const isWeb = platform === CONST.PLATFORM.WEB;
    const isAndroid = platform === CONST.PLATFORM.ANDROID;
    const isIOS = platform === CONST.PLATFORM.IOS;
    // Active iOS bottom-docked popovers can announce dismiss before the first item unless it stays hidden until focus lands.
    const shouldDeferDismissButtonAccessibility = isIOS && shouldActivate;
    const firstItemRef = useRef<RNView>(null);
    const isVisibleRef = useRef(isVisible);
    const hasFocusedFirstItemOnCurrentOpenRef = useRef(false);
    const firstMenuItemFocusRetryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [shouldEnableBottomDockedDismissAccessibility, setShouldEnableBottomDockedDismissAccessibility] = useState(!shouldDeferDismissButtonAccessibility);

    const clearScheduledFirstMenuItemFocus = useCallback(() => {
        if (!firstMenuItemFocusRetryTimeoutRef.current) {
            return;
        }

        clearTimeout(firstMenuItemFocusRetryTimeoutRef.current);
        firstMenuItemFocusRetryTimeoutRef.current = null;
    }, []);

    const markFirstMenuItemUnfocused = useCallback(() => {
        clearScheduledFirstMenuItemFocus();
        hasFocusedFirstItemOnCurrentOpenRef.current = false;
        if (shouldDeferDismissButtonAccessibility) {
            setShouldEnableBottomDockedDismissAccessibility(false);
        }
    }, [clearScheduledFirstMenuItemFocus, shouldDeferDismissButtonAccessibility]);

    useEffect(() => {
        isVisibleRef.current = isVisible;
        if (isVisible) {
            return;
        }

        const animationFrame = requestAnimationFrame(() => {
            markFirstMenuItemUnfocused();
        });

        return () => cancelAnimationFrame(animationFrame);
    }, [isVisible, markFirstMenuItemUnfocused]);

    useEffect(
        () => () => {
            clearScheduledFirstMenuItemFocus();
        },
        [clearScheduledFirstMenuItemFocus],
    );

    const getFirstMenuItemTarget = useCallback(() => {
        if (!isVisibleRef.current || hasFocusedFirstItemOnCurrentOpenRef.current) {
            return null;
        }

        return firstItemRef.current;
    }, []);

    const markFirstMenuItemFocused = useCallback(() => {
        clearScheduledFirstMenuItemFocus();
        hasFocusedFirstItemOnCurrentOpenRef.current = true;
        if (shouldDeferDismissButtonAccessibility) {
            setShouldEnableBottomDockedDismissAccessibility(true);
        }
    }, [clearScheduledFirstMenuItemFocus, shouldDeferDismissButtonAccessibility]);

    const focusFirstMenuItemOnWeb = useCallback(() => {
        const target = getFirstMenuItemTarget();
        if (!target || !('focus' in target) || typeof target.focus !== 'function') {
            return false;
        }

        target.focus();
        markFirstMenuItemFocused();
        return true;
    }, [getFirstMenuItemTarget, markFirstMenuItemFocused]);

    const focusFirstMenuItemOnNative = useCallback(() => {
        const target = getFirstMenuItemTarget();
        if (!target) {
            return false;
        }

        const sendAccessibilityEvent = AccessibilityInfo.sendAccessibilityEvent;
        if (sendAccessibilityEvent && isAndroid) {
            sendAccessibilityEvent(target, 'viewHoverEnter');
        }

        Accessibility.moveAccessibilityFocus(firstItemRef);
        if (!shouldDeferDismissButtonAccessibility || !shouldConfirmFirstItemFocus) {
            markFirstMenuItemFocused();
        }
        return true;
    }, [getFirstMenuItemTarget, isAndroid, markFirstMenuItemFocused, shouldConfirmFirstItemFocus, shouldDeferDismissButtonAccessibility]);

    const focusFirstMenuItem = useCallback(() => {
        if (isWeb) {
            return focusFirstMenuItemOnWeb();
        }

        return focusFirstMenuItemOnNative();
    }, [focusFirstMenuItemOnNative, focusFirstMenuItemOnWeb, isWeb]);

    const scheduleFocusFirstMenuItemOnWeb = useCallback(() => {
        const focusFirstMenuItemWithRetries = (retries = maxFocusRetries) => {
            if (!isVisibleRef.current || hasFocusedFirstItemOnCurrentOpenRef.current) {
                return;
            }

            if (focusFirstMenuItem()) {
                return;
            }

            if (retries <= 0) {
                return;
            }

            requestAnimationFrame(() => focusFirstMenuItemWithRetries(retries - 1));
        };

        requestAnimationFrame(() => focusFirstMenuItemWithRetries());
    }, [focusFirstMenuItem, maxFocusRetries]);

    const scheduleFocusFirstMenuItemOnNative = useCallback(() => {
        const focusFirstMenuItemWithRetries = (retries = maxFocusRetries) => {
            requestAnimationFrame(() => {
                if (!isVisibleRef.current || hasFocusedFirstItemOnCurrentOpenRef.current) {
                    return;
                }

                focusFirstMenuItem();

                if (!shouldDeferDismissButtonAccessibility || !shouldConfirmFirstItemFocus || hasFocusedFirstItemOnCurrentOpenRef.current) {
                    return;
                }

                if (retries <= 0) {
                    markFirstMenuItemFocused();
                    return;
                }

                firstMenuItemFocusRetryTimeoutRef.current = setTimeout(() => {
                    firstMenuItemFocusRetryTimeoutRef.current = null;
                    focusFirstMenuItemWithRetries(retries - 1);
                }, nativeFocusRetryDelayMs);
            });
        };

        clearScheduledFirstMenuItemFocus();
        firstMenuItemFocusRetryTimeoutRef.current = setTimeout(
            () => {
                firstMenuItemFocusRetryTimeoutRef.current = null;
                focusFirstMenuItemWithRetries();
            },
            shouldDeferDismissButtonAccessibility ? animationDelayMs : 0,
        );
    }, [
        animationDelayMs,
        clearScheduledFirstMenuItemFocus,
        focusFirstMenuItem,
        markFirstMenuItemFocused,
        maxFocusRetries,
        nativeFocusRetryDelayMs,
        shouldConfirmFirstItemFocus,
        shouldDeferDismissButtonAccessibility,
    ]);

    const scheduleFocusFirstMenuItem = useCallback(() => {
        if (isWeb) {
            scheduleFocusFirstMenuItemOnWeb();
            return;
        }

        scheduleFocusFirstMenuItemOnNative();
    }, [isWeb, scheduleFocusFirstMenuItemOnNative, scheduleFocusFirstMenuItemOnWeb]);

    const handleModalShow = useCallback(() => {
        onModalShow?.();
        if (!shouldActivate) {
            return;
        }

        scheduleFocusFirstMenuItem();
    }, [onModalShow, scheduleFocusFirstMenuItem, shouldActivate]);

    useEffect(() => {
        if (!isVisible || !shouldActivate || hasFocusedFirstItemOnCurrentOpenRef.current) {
            return;
        }

        scheduleFocusFirstMenuItem();
    }, [isVisible, scheduleFocusFirstMenuItem, shouldActivate]);

    useEffect(() => {
        if (!isVisible || !shouldDeferDismissButtonAccessibility || !shouldConfirmFirstItemFocus || focusedIndex !== 0 || hasFocusedFirstItemOnCurrentOpenRef.current) {
            return;
        }

        const animationFrame = requestAnimationFrame(() => {
            markFirstMenuItemFocused();
        });

        return () => cancelAnimationFrame(animationFrame);
    }, [focusedIndex, isVisible, markFirstMenuItemFocused, shouldConfirmFirstItemFocus, shouldDeferDismissButtonAccessibility]);

    const handleFirstItemFocus = useCallback(() => {
        if (hasFocusedFirstItemOnCurrentOpenRef.current) {
            return;
        }

        markFirstMenuItemFocused();
    }, [markFirstMenuItemFocused]);

    return {
        firstItemRef,
        handleFirstItemFocus,
        handleModalShow,
        shouldEnableBottomDockedDismissAccessibility: shouldDeferDismissButtonAccessibility ? shouldEnableBottomDockedDismissAccessibility : undefined,
    };
}

export default useBottomDockedDismissAccessibility;
