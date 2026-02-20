import {useCallback, useEffect, useRef} from 'react';
import {InteractionManager} from 'react-native';
import Accessibility from '@libs/Accessibility';
import type {FocusTarget} from '@libs/Accessibility/moveAccessibilityFocus/types';

const FOCUS_RESTORE_RETRY_INTERVAL = 100;
const FOCUS_RESTORE_MAX_RETRIES = 10;

type FocusTargetEvent = {
    currentTarget?: unknown;
};

type FocusTargetRef = {
    current: unknown;
};

function isFocusTargetEvent(focusTarget: unknown): focusTarget is FocusTargetEvent {
    return typeof focusTarget === 'object' && focusTarget !== null && 'currentTarget' in focusTarget;
}

function isFocusTargetRef(focusTarget: FocusTarget): focusTarget is FocusTargetRef {
    return typeof focusTarget === 'object' && focusTarget !== null && 'current' in focusTarget;
}

function resolveFocusTarget(focusTarget: FocusTarget): FocusTarget | null {
    if (!isFocusTargetRef(focusTarget)) {
        return focusTarget;
    }

    return (focusTarget.current as FocusTarget | null | undefined) ?? null;
}

function useAccessibilityFocusOnReturn() {
    const focusTargetRef = useRef<FocusTarget | null>(null);
    const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const interactionHandleRef = useRef<ReturnType<typeof InteractionManager.runAfterInteractions> | null>(null);

    const clearPendingFocusRestore = useCallback(() => {
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }

        interactionHandleRef.current?.cancel();
        interactionHandleRef.current = null;
    }, []);

    const restoreFocusOnReturn = useCallback(() => {
        if (!focusTargetRef.current) {
            return;
        }

        clearPendingFocusRestore();

        const restoreFocusWhenTargetExists = (retryCount: number) => {
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

            if (retryCount >= FOCUS_RESTORE_MAX_RETRIES) {
                focusTargetRef.current = null;
                return;
            }

            retryTimeoutRef.current = setTimeout(() => {
                restoreFocusWhenTargetExists(retryCount + 1);
            }, FOCUS_RESTORE_RETRY_INTERVAL);
        };

        interactionHandleRef.current = InteractionManager.runAfterInteractions(() => restoreFocusWhenTargetExists(0));
    }, [clearPendingFocusRestore]);

    const setFocusTarget = useCallback((focusTarget?: FocusTarget | FocusTargetEvent | null) => {
        const nextFocusTarget = isFocusTargetEvent(focusTarget) ? (focusTarget.currentTarget as FocusTarget | null | undefined) : focusTarget;
        focusTargetRef.current = nextFocusTarget ?? null;
    }, []);

    useEffect(() => clearPendingFocusRestore, [clearPendingFocusRestore]);

    return {
        restoreFocusOnReturn,
        setFocusTarget,
    };
}

export default useAccessibilityFocusOnReturn;
export {FOCUS_RESTORE_MAX_RETRIES, FOCUS_RESTORE_RETRY_INTERVAL};
