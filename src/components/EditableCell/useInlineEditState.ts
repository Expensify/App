import {useCallback, useEffect, useRef, useState} from 'react';

import type {InlineEditSaveResult} from './types';

/**
 * Hook for managing inline editing state (text, number fields).
 *
 * Handles:
 *   - Local value buffering (so the input doesn't write to parent on every keystroke)
 *   - Save on blur (compares localValue vs original value)
 *   - Cancel (reset to original)
 *   - isEditing toggle
 *   - Auto-cancel when canEdit becomes false
 *   - Keeping the editor open while onSave waits on a confirm modal, then closing it if the user cancels
 */
function useInlineEditState<T>(
    canEdit: boolean | undefined,
    value: T,
    onSave?: (value: T) => InlineEditSaveResult,
    isEqual?: (newValue: T, originalValue: T) => boolean,
    onKeepEditing?: () => void,
) {
    const [isEditing, setIsEditing] = useState(false);
    const [isAwaitingConfirm, setIsAwaitingConfirm] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    const [prevValue, setPrevValue] = useState(value);
    const hasEndedRef = useRef(false);

    // Hold the buffer only when the user has changed it. An update arriving mid-edit, from Pusher or another admin,
    // would otherwise replace that draft, and the next blur would read the edit as unchanged and drop it.
    // An open editor that still matches what it opened with is not a draft: leaving the stale buffer in place
    // makes blur write it back over the rename. Closing a real draft flips isEditing first, so the next render
    // picks the newer value back up.
    const hasUnsavedEdits = isEditing && (isEqual ? !isEqual(localValue, prevValue) : !Object.is(localValue, prevValue));
    if (prevValue !== value && !hasUnsavedEdits) {
        setPrevValue(value);
        setLocalValue(value);
    }

    const startEditing = useCallback(() => {
        hasEndedRef.current = false;
        setIsAwaitingConfirm(false);
        setIsEditing(true);
    }, []);

    const closeEditing = useCallback(() => {
        setIsAwaitingConfirm(false);
        // Reset to the source of truth when edit mode closes so a rejected save, such as an empty merchant, is not left on screen.
        setLocalValue(value);
        setIsEditing(false);
    }, [value]);

    const keepEditing = useCallback(() => {
        hasEndedRef.current = false;
        setIsAwaitingConfirm(false);
        onKeepEditing?.();
    }, [onKeepEditing]);

    const save = useCallback(() => {
        if (hasEndedRef.current) {
            return;
        }
        hasEndedRef.current = true;

        const shouldSave = isEqual ? !isEqual(localValue, value) : !Object.is(localValue, value);
        if (!shouldSave || !onSave) {
            closeEditing();
            return;
        }

        const result = onSave(localValue);
        if (!(result instanceof Promise)) {
            if (result === false) {
                keepEditing();
                return;
            }
            closeEditing();
            return;
        }

        // The confirm modal blurs this input. Leave it mounted so the typed value stays visible until the modal closes.
        setIsAwaitingConfirm(true);
        result.then(
            () => {
                // Confirm already wrote the value. Cancel did not, and leaving the draft in place would open the same modal on the next blur.
                closeEditing();
            },
            // Confirm and cancel both resolve, so they close above. This runs only when the promise fails, and the draft stays because the save never finished.
            () => {
                keepEditing();
            },
        );
    }, [localValue, value, onSave, isEqual, closeEditing, keepEditing]);

    const cancelEditing = useCallback(() => {
        if (hasEndedRef.current) {
            return;
        }
        hasEndedRef.current = true;
        closeEditing();
    }, [closeEditing]);

    // Cancel editing when permission is revoked (e.g., transaction status changed). A pending save has already
    // claimed the edit, so revocation is applied once the confirm modal releases it rather than under the modal.
    useEffect(() => {
        if (canEdit || !isEditing || isAwaitingConfirm) {
            return;
        }
        cancelEditing();
    }, [canEdit, cancelEditing, isEditing, isAwaitingConfirm]);

    return {isEditing, isAwaitingConfirm, localValue, setLocalValue, startEditing, save, cancelEditing};
}

export default useInlineEditState;
