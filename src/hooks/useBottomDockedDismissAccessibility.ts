import {useCallback, useEffect, useRef, useState} from 'react';
import type {RefObject} from 'react';
import {AccessibilityInfo} from 'react-native';
import type {ReactNativeElement, View as RNView} from 'react-native';
import type BaseModalProps from '@components/Modal/types';
import Accessibility from '@libs/Accessibility';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';

type WebFocusMode = 'manual' | 'initialFocus' | 'none';
type DismissAccessibilityMode = 'none' | 'focusConfirmation' | 'timer';
type DismissAccessibilityPlatforms = 'ios' | 'native';
type FocusableElement = {focus: () => void};

type UseBottomDockedDismissAccessibilityParams = {
    isVisible: boolean;
    shouldActivate: boolean;
    animationDelayMs: number;
    onModalShow?: () => void;
    shouldConfirmFirstItemFocus?: boolean;
    focusedIndex?: number;
    maxFocusRetries?: number;
    nativeFocusRetryDelayMs?: number;
    focusTargetRef?: RefObject<unknown>;
    webFocusMode?: WebFocusMode;
    dismissAccessibilityMode?: DismissAccessibilityMode;
    dismissAccessibilityPlatforms?: DismissAccessibilityPlatforms;
    dismissAccessibilityDelayMs?: number;
};

type UseBottomDockedDismissAccessibilityResult = {
    firstItemRef: RefObject<RNView | null>;
    handleFirstItemFocus: () => void;
    handleModalShow: () => void;
    shouldEnableBottomDockedDismissAccessibility?: boolean;
    initialFocus?: BaseModalProps['initialFocus'];
};

const DEFAULT_MAX_FIRST_MENU_ITEM_FOCUS_RETRIES = 5;
const DEFAULT_FIRST_MENU_ITEM_NATIVE_FOCUS_RETRY_DELAY_MS = 50;
const DEFAULT_WEB_FOCUS_MODE: WebFocusMode = 'manual';
const DEFAULT_DISMISS_ACCESSIBILITY_PLATFORMS: DismissAccessibilityPlatforms = 'ios';

function isFocusableElement(target: unknown): target is FocusableElement {
    return typeof target === 'object' && target !== null && 'focus' in target && typeof target.focus === 'function';
}

function useBottomDockedDismissAccessibility({
    isVisible,
    shouldActivate,
    animationDelayMs,
    onModalShow,
    shouldConfirmFirstItemFocus = false,
    focusedIndex,
    maxFocusRetries = DEFAULT_MAX_FIRST_MENU_ITEM_FOCUS_RETRIES,
    nativeFocusRetryDelayMs = DEFAULT_FIRST_MENU_ITEM_NATIVE_FOCUS_RETRY_DELAY_MS,
    focusTargetRef,
    webFocusMode = DEFAULT_WEB_FOCUS_MODE,
    dismissAccessibilityMode,
    dismissAccessibilityPlatforms = DEFAULT_DISMISS_ACCESSIBILITY_PLATFORMS,
    dismissAccessibilityDelayMs,
}: UseBottomDockedDismissAccessibilityParams): UseBottomDockedDismissAccessibilityResult {
    const platform = getPlatform();
    const isWeb = platform === CONST.PLATFORM.WEB;
    const isAndroid = platform === CONST.PLATFORM.ANDROID;
    const isIOS = platform === CONST.PLATFORM.IOS;
    const resolvedDismissAccessibilityMode = dismissAccessibilityMode ?? (shouldConfirmFirstItemFocus ? 'focusConfirmation' : 'none');
    const shouldUseManualWebFocus = isWeb && shouldActivate && webFocusMode === 'manual';
    const shouldUseInitialWebFocus = isWeb && shouldActivate && webFocusMode === 'initialFocus';
    const shouldUseNativeFocusHandoff = !isWeb && shouldActivate && resolvedDismissAccessibilityMode !== 'timer';
    const shouldDeferDismissButtonAccessibility =
        shouldActivate &&
        resolvedDismissAccessibilityMode !== 'none' &&
        ((dismissAccessibilityPlatforms === 'native' && (isIOS || isAndroid)) || (dismissAccessibilityPlatforms === 'ios' && isIOS));
    const firstItemRef = useRef<RNView>(null);
    const isVisibleRef = useRef(isVisible);
    const hasFocusedTargetOnCurrentOpenRef = useRef(false);
    const scheduledFocusRetryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dismissAccessibilityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [shouldEnableBottomDockedDismissAccessibility, setShouldEnableBottomDockedDismissAccessibility] = useState(!shouldDeferDismissButtonAccessibility);

    const clearScheduledFocusTarget = useCallback(() => {
        if (!scheduledFocusRetryTimeoutRef.current) {
            return;
        }

        clearTimeout(scheduledFocusRetryTimeoutRef.current);
        scheduledFocusRetryTimeoutRef.current = null;
    }, []);

    const clearDismissAccessibilityTimeout = useCallback(() => {
        if (!dismissAccessibilityTimeoutRef.current) {
            return;
        }

        clearTimeout(dismissAccessibilityTimeoutRef.current);
        dismissAccessibilityTimeoutRef.current = null;
    }, []);

    const markTargetUnfocused = useCallback(() => {
        clearScheduledFocusTarget();
        clearDismissAccessibilityTimeout();
        hasFocusedTargetOnCurrentOpenRef.current = false;
        setShouldEnableBottomDockedDismissAccessibility(!shouldDeferDismissButtonAccessibility);
    }, [clearDismissAccessibilityTimeout, clearScheduledFocusTarget, shouldDeferDismissButtonAccessibility]);

    useEffect(() => {
        isVisibleRef.current = isVisible;
        if (isVisible) {
            return;
        }

        const animationFrame = requestAnimationFrame(() => {
            markTargetUnfocused();
        });

        return () => cancelAnimationFrame(animationFrame);
    }, [isVisible, markTargetUnfocused]);

    useEffect(
        () => () => {
            clearScheduledFocusTarget();
            clearDismissAccessibilityTimeout();
        },
        [clearDismissAccessibilityTimeout, clearScheduledFocusTarget],
    );

    const getFocusTarget = useCallback(() => {
        if (!isVisibleRef.current || hasFocusedTargetOnCurrentOpenRef.current) {
            return null;
        }

        return (focusTargetRef ?? firstItemRef).current;
    }, [focusTargetRef]);

    const markTargetFocused = useCallback(() => {
        clearScheduledFocusTarget();
        clearDismissAccessibilityTimeout();
        hasFocusedTargetOnCurrentOpenRef.current = true;
        setShouldEnableBottomDockedDismissAccessibility(true);
    }, [clearDismissAccessibilityTimeout, clearScheduledFocusTarget]);

    const focusTargetOnWeb = useCallback(() => {
        const target = getFocusTarget();
        if (!isFocusableElement(target)) {
            return false;
        }

        target.focus();
        markTargetFocused();
        return true;
    }, [getFocusTarget, markTargetFocused]);

    const focusTargetOnNative = useCallback(() => {
        const target = getFocusTarget();
        if (!target) {
            return false;
        }

        const accessibilityFocusTargetRef = (focusTargetRef ?? firstItemRef) as RefObject<RNView | null>;
        const sendAccessibilityEvent = AccessibilityInfo.sendAccessibilityEvent;
        if (sendAccessibilityEvent && isAndroid) {
            sendAccessibilityEvent(target as ReactNativeElement, 'viewHoverEnter');
        }

        Accessibility.moveAccessibilityFocus(accessibilityFocusTargetRef);
        if (!shouldDeferDismissButtonAccessibility || resolvedDismissAccessibilityMode !== 'focusConfirmation' || !shouldConfirmFirstItemFocus) {
            markTargetFocused();
        }
        return true;
    }, [focusTargetRef, getFocusTarget, isAndroid, markTargetFocused, resolvedDismissAccessibilityMode, shouldConfirmFirstItemFocus, shouldDeferDismissButtonAccessibility]);

    const focusTarget = useCallback(() => {
        if (isWeb) {
            return focusTargetOnWeb();
        }

        return focusTargetOnNative();
    }, [focusTargetOnNative, focusTargetOnWeb, isWeb]);

    const scheduleFocusTargetOnWeb = useCallback(() => {
        const focusTargetWithRetries = (retries = maxFocusRetries) => {
            if (!isVisibleRef.current || hasFocusedTargetOnCurrentOpenRef.current) {
                return;
            }

            if (focusTarget()) {
                return;
            }

            if (retries <= 0) {
                return;
            }

            requestAnimationFrame(() => focusTargetWithRetries(retries - 1));
        };

        requestAnimationFrame(() => focusTargetWithRetries());
    }, [focusTarget, maxFocusRetries]);

    const scheduleFocusTargetOnNative = useCallback(() => {
        const focusTargetWithRetries = (retries = maxFocusRetries) => {
            requestAnimationFrame(() => {
                if (!isVisibleRef.current || hasFocusedTargetOnCurrentOpenRef.current) {
                    return;
                }

                focusTarget();

                if (
                    !shouldDeferDismissButtonAccessibility ||
                    resolvedDismissAccessibilityMode !== 'focusConfirmation' ||
                    !shouldConfirmFirstItemFocus ||
                    hasFocusedTargetOnCurrentOpenRef.current
                ) {
                    return;
                }

                if (retries <= 0) {
                    markTargetFocused();
                    return;
                }

                scheduledFocusRetryTimeoutRef.current = setTimeout(() => {
                    scheduledFocusRetryTimeoutRef.current = null;
                    focusTargetWithRetries(retries - 1);
                }, nativeFocusRetryDelayMs);
            });
        };

        clearScheduledFocusTarget();
        scheduledFocusRetryTimeoutRef.current = setTimeout(
            () => {
                scheduledFocusRetryTimeoutRef.current = null;
                focusTargetWithRetries();
            },
            shouldDeferDismissButtonAccessibility ? animationDelayMs : 0,
        );
    }, [
        animationDelayMs,
        clearScheduledFocusTarget,
        focusTarget,
        markTargetFocused,
        maxFocusRetries,
        nativeFocusRetryDelayMs,
        resolvedDismissAccessibilityMode,
        shouldConfirmFirstItemFocus,
        shouldDeferDismissButtonAccessibility,
    ]);

    const scheduleDismissAccessibilityTimer = useCallback(() => {
        if (!shouldDeferDismissButtonAccessibility || resolvedDismissAccessibilityMode !== 'timer') {
            return;
        }

        clearDismissAccessibilityTimeout();
        setShouldEnableBottomDockedDismissAccessibility(false);
        dismissAccessibilityTimeoutRef.current = setTimeout(() => {
            setShouldEnableBottomDockedDismissAccessibility(true);
            dismissAccessibilityTimeoutRef.current = null;
        }, dismissAccessibilityDelayMs ?? animationDelayMs);
    }, [animationDelayMs, clearDismissAccessibilityTimeout, dismissAccessibilityDelayMs, resolvedDismissAccessibilityMode, shouldDeferDismissButtonAccessibility]);

    const shouldScheduleFocusTargetOnOpen = shouldUseManualWebFocus || shouldUseNativeFocusHandoff;

    const scheduleFocusTargetOnOpen = useCallback(() => {
        if (shouldUseManualWebFocus) {
            scheduleFocusTargetOnWeb();
            return;
        }

        if (shouldUseNativeFocusHandoff) {
            scheduleFocusTargetOnNative();
        }
    }, [scheduleFocusTargetOnNative, scheduleFocusTargetOnWeb, shouldUseManualWebFocus, shouldUseNativeFocusHandoff]);

    const handleModalShow = useCallback(() => {
        onModalShow?.();
        if (!shouldActivate) {
            return;
        }

        if (resolvedDismissAccessibilityMode === 'timer') {
            scheduleDismissAccessibilityTimer();
            return;
        }

        scheduleFocusTargetOnOpen();
    }, [onModalShow, resolvedDismissAccessibilityMode, scheduleDismissAccessibilityTimer, scheduleFocusTargetOnOpen, shouldActivate]);

    useEffect(() => {
        if (!isVisible || !shouldActivate || hasFocusedTargetOnCurrentOpenRef.current || !shouldScheduleFocusTargetOnOpen) {
            return;
        }

        scheduleFocusTargetOnOpen();
    }, [isVisible, scheduleFocusTargetOnOpen, shouldActivate, shouldScheduleFocusTargetOnOpen]);

    useEffect(() => {
        if (
            !isVisible ||
            !shouldDeferDismissButtonAccessibility ||
            resolvedDismissAccessibilityMode !== 'focusConfirmation' ||
            !shouldConfirmFirstItemFocus ||
            focusedIndex !== 0 ||
            hasFocusedTargetOnCurrentOpenRef.current
        ) {
            return;
        }

        const animationFrame = requestAnimationFrame(() => {
            markTargetFocused();
        });

        return () => cancelAnimationFrame(animationFrame);
    }, [focusedIndex, isVisible, markTargetFocused, resolvedDismissAccessibilityMode, shouldConfirmFirstItemFocus, shouldDeferDismissButtonAccessibility]);

    const handleFirstItemFocus = useCallback(() => {
        if (hasFocusedTargetOnCurrentOpenRef.current) {
            return;
        }

        markTargetFocused();
    }, [markTargetFocused]);

    const initialFocus = shouldUseInitialWebFocus ? () => (focusTargetRef ?? firstItemRef).current as NonNullable<UseBottomDockedDismissAccessibilityResult['initialFocus']> : undefined;

    return {
        firstItemRef,
        handleFirstItemFocus,
        handleModalShow,
        shouldEnableBottomDockedDismissAccessibility: shouldDeferDismissButtonAccessibility ? shouldEnableBottomDockedDismissAccessibility : undefined,
        initialFocus,
    };
}

export default useBottomDockedDismissAccessibility;
