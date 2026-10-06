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
 *   - Keeping the editor open when onSave defers the write behind a confirm modal
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

    if (prevValue !== value) {
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

        const shouldSave = !!onSave && (isEqual ? !isEqual(localValue, value) : !Object.is(localValue, value));
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
            (shouldClose) => {
                if (shouldClose === false) {
                    keepEditing();
                    return;
                }
                closeEditing();
            },
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
