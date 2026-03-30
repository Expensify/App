import {useIsFocused} from '@react-navigation/native';
import {useCallback, useEffect, useRef} from 'react';
import {DeviceEventEmitter, Platform} from 'react-native';
import Accessibility from '@libs/Accessibility';
import type {FocusTarget} from '@libs/Accessibility/moveAccessibilityFocus/types';
import {isFocusTargetRef} from '@libs/Accessibility/moveAccessibilityFocus/utils';
import CONST from '@src/CONST';

const FOCUS_RESTORE_MAX_RETRIES = 10;
const FOCUS_RESTORE_RETRY_INTERVAL = 100;
const WEB_FOCUS_RESTORE_DELAY = CONST.ANIMATED_TRANSITION + 50;
const IOS_FOCUS_RESTORE_DELAY = 100;

type FocusTargetEvent = {
    currentTarget?: unknown;
};

function isFocusTargetEvent(focusTarget: unknown): focusTarget is FocusTargetEvent {
    return typeof focusTarget === 'object' && focusTarget !== null && 'currentTarget' in focusTarget;
}

function resolveFocusTarget(focusTarget: FocusTarget): FocusTarget | null {
    if (!isFocusTargetRef(focusTarget)) {
        return focusTarget;
    }

    return (focusTarget.current as FocusTarget | null | undefined) ?? null;
}

function useAccessibilityFocusOnReturn() {
    const isFocused = useIsFocused();
    const isFocusedRef = useRef(isFocused);
    const focusTargetRef = useRef<FocusTarget | null>(null);
    const retryCountRef = useRef(0);
    const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const deferredRestoreTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const deferredIOSRestoreTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearPendingFocusRestore = useCallback(() => {
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }

        if (deferredRestoreTimeoutRef.current) {
            clearTimeout(deferredRestoreTimeoutRef.current);
            deferredRestoreTimeoutRef.current = null;
        }

        if (!deferredIOSRestoreTimeoutRef.current) {
            return;
        }

        clearTimeout(deferredIOSRestoreTimeoutRef.current);
        deferredIOSRestoreTimeoutRef.current = null;
    }, []);

    const setFocusTarget = useCallback((focusTarget?: FocusTarget | FocusTargetEvent | null) => {
        const nextFocusTarget = isFocusTargetEvent(focusTarget) ? (focusTarget.currentTarget as FocusTarget | null | undefined) : focusTarget;
        focusTargetRef.current = nextFocusTarget ?? null;
    }, []);

    const restoreFocusOnReturn = useCallback(() => {
        if (!isFocusedRef.current || !focusTargetRef.current) {
            return;
        }

        clearPendingFocusRestore();
        retryCountRef.current = 0;

        const tryRestoreFocus = () => {
            const currentFocusTarget = focusTargetRef.current;
            if (!currentFocusTarget) {
                return;
            }

            const resolvedFocusTarget = resolveFocusTarget(currentFocusTarget);
            if (resolvedFocusTarget) {
                Accessibility.moveAccessibilityFocus(resolvedFocusTarget);
                focusTargetRef.current = null;
                return;
            }

            retryCountRef.current += 1;
            if (retryCountRef.current >= FOCUS_RESTORE_MAX_RETRIES) {
                focusTargetRef.current = null;
                return;
            }

            retryTimeoutRef.current = setTimeout(tryRestoreFocus, FOCUS_RESTORE_RETRY_INTERVAL);
        };

        if (Platform.OS === 'android') {
            tryRestoreFocus();
            return;
        }

        if (Platform.OS === 'ios') {
            deferredIOSRestoreTimeoutRef.current = setTimeout(() => {
                tryRestoreFocus();
            }, IOS_FOCUS_RESTORE_DELAY);
            return;
        }

        deferredRestoreTimeoutRef.current = setTimeout(() => {
            tryRestoreFocus();
        }, WEB_FOCUS_RESTORE_DELAY);
    }, [clearPendingFocusRestore]);

    useEffect(() => {
        isFocusedRef.current = isFocused;
    }, [isFocused]);

    useEffect(() => {
        if (Platform.OS !== 'web') {
            return;
        }

        // Web can return to the parent screen through navigator transitions or modal dismissal,
        // so we listen to both shared events and let restoreFocusOnReturn guard redundant calls.
        const transitionEndSubscription = DeviceEventEmitter.addListener(CONST.EVENTS.TRANSITION_END_SCREEN_WRAPPER, restoreFocusOnReturn);
        const modalClosedSubscription = DeviceEventEmitter.addListener(CONST.MODAL_EVENTS.CLOSED, restoreFocusOnReturn);

        return () => {
            transitionEndSubscription.remove();
            modalClosedSubscription.remove();
        };
    }, [restoreFocusOnReturn]);

    useEffect(() => {
        if (Platform.OS !== 'web' || !isFocused || !focusTargetRef.current) {
            return;
        }

        restoreFocusOnReturn();
    }, [isFocused, restoreFocusOnReturn]);

    useEffect(() => clearPendingFocusRestore, [clearPendingFocusRestore]);

    return {
        setFocusTarget,
        restoreFocusOnReturn,
    };
}

export default useAccessibilityFocusOnReturn;
export {FOCUS_RESTORE_MAX_RETRIES, FOCUS_RESTORE_RETRY_INTERVAL};
