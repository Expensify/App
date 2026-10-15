import type {RestoreFocus} from '@components/MoneyRequestConfirmationFields/context';

import TransitionTracker from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';

import {useEffect, useRef} from 'react';

type RestoreFocusAfterDiscard = {
    captureFocusedInput: (restoreFocus: RestoreFocus) => void;
    clearDiscardFocus: () => void;
    clearFocusedInput: () => void;
    prepareForDiscardNavigation: () => void;
    reset: () => void;
    restoreLastFocusedInput: () => void;
    setDiscardModalVisibility: (isVisible: boolean) => void;
};

function useRestoreFocusAfterDiscard(): RestoreFocusAfterDiscard {
    // Live focus target, updated as fields gain or lose focus.
    const lastFocusedInputRef = useRef<RestoreFocus | null>(null);
    // Keeps a recent target alive during delayed blur cleanup so a blur-to-modal transition can still restore it.
    const lastFocusedInputCandidateRef = useRef<RestoreFocus | null>(null);
    // Snapshot taken when the discard modal opens and restored if the user cancels.
    const focusToRestoreAfterDiscardRef = useRef<RestoreFocus | null>(null);
    const isDiscardModalOpenRef = useRef(false);
    const isDiscardNavigationPendingRef = useRef(false);
    const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const focusRestoreGenerationRef = useRef(0);
    const blurCleanupTaskRef = useRef<ReturnType<typeof TransitionTracker.runAfterTransitions> | null>(null);

    const cancelBlurCleanup = () => {
        if (!blurCleanupTaskRef.current) {
            return;
        }

        blurCleanupTaskRef.current.cancel();
        blurCleanupTaskRef.current = null;
    };

    const cancelPendingFocusRestore = (shouldInvalidate = true) => {
        if (focusTimeoutRef.current) {
            clearTimeout(focusTimeoutRef.current);
            focusTimeoutRef.current = null;
        }
        if (shouldInvalidate) {
            focusRestoreGenerationRef.current += 1;
        }
    };

    const reset = () => {
        cancelPendingFocusRestore();
        cancelBlurCleanup();
        lastFocusedInputRef.current = null;
        lastFocusedInputCandidateRef.current = null;
        focusToRestoreAfterDiscardRef.current = null;
    };

    const clearFocusedInput = () => {
        if (isDiscardModalOpenRef.current || isDiscardNavigationPendingRef.current) {
            return;
        }

        cancelBlurCleanup();
        blurCleanupTaskRef.current = TransitionTracker.runAfterTransitions({
            // A native keyboard or discard-modal transition can start in the same tick as the blur.
            // Wait for it to finish before clearing the input that may need focus restored on Cancel.
            waitForUpcomingTransition: true,
            callback: () => {
                blurCleanupTaskRef.current = null;
                if (isDiscardModalOpenRef.current || isDiscardNavigationPendingRef.current) {
                    return;
                }
                lastFocusedInputRef.current = null;
                lastFocusedInputCandidateRef.current = null;
            },
        });
    };

    const captureFocusedInput = (restoreFocus: RestoreFocus) => {
        cancelBlurCleanup();
        lastFocusedInputRef.current = restoreFocus;
        lastFocusedInputCandidateRef.current = restoreFocus;
    };

    const restoreLastFocusedInput = () => {
        const restoreFocus = focusToRestoreAfterDiscardRef.current ?? lastFocusedInputRef.current;
        focusToRestoreAfterDiscardRef.current = null;
        lastFocusedInputCandidateRef.current = null;
        if (!restoreFocus) {
            isDiscardNavigationPendingRef.current = false;
            return;
        }

        cancelPendingFocusRestore(false);
        const focusRestoreGeneration = ++focusRestoreGenerationRef.current;
        focusTimeoutRef.current = setTimeout(() => {
            focusTimeoutRef.current = null;
            TransitionTracker.runAfterTransitions({
                callback: () => {
                    if (focusRestoreGeneration !== focusRestoreGenerationRef.current || isDiscardModalOpenRef.current) {
                        return;
                    }
                    restoreFocus();
                    isDiscardNavigationPendingRef.current = false;
                },
            });
        }, CONST.ANIMATED_TRANSITION);
    };

    const setDiscardModalVisibility = (isVisible: boolean) => {
        isDiscardModalOpenRef.current = isVisible;
        if (!isVisible) {
            return;
        }

        // Native keyboard dismissal can blur an input before React Navigation exposes the blocked action.
        // Keep the most recently focused input as the restoration target for this discard attempt.
        focusToRestoreAfterDiscardRef.current = lastFocusedInputCandidateRef.current;
        cancelPendingFocusRestore();
        cancelBlurCleanup();
    };

    const prepareForDiscardNavigation = () => {
        // Pressing the header button blurs the active field before the discard modal has mounted.
        // Preserve the field's restore callback through that transition so Cancel can reliably restore focus.
        isDiscardNavigationPendingRef.current = true;
        cancelBlurCleanup();
    };

    const clearDiscardFocus = () => {
        focusToRestoreAfterDiscardRef.current = null;
        lastFocusedInputCandidateRef.current = null;
    };

    useEffect(
        () => () => {
            if (focusTimeoutRef.current) {
                clearTimeout(focusTimeoutRef.current);
                focusTimeoutRef.current = null;
            }
            focusRestoreGenerationRef.current += 1;
            if (blurCleanupTaskRef.current) {
                blurCleanupTaskRef.current.cancel();
                blurCleanupTaskRef.current = null;
            }
            lastFocusedInputRef.current = null;
            lastFocusedInputCandidateRef.current = null;
            focusToRestoreAfterDiscardRef.current = null;
        },
        [],
    );

    return {
        clearDiscardFocus,
        clearFocusedInput,
        captureFocusedInput,
        prepareForDiscardNavigation,
        reset,
        restoreLastFocusedInput,
        setDiscardModalVisibility,
    };
}

export default useRestoreFocusAfterDiscard;
