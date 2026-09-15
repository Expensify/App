import {useCallback, useEffect, useRef, useState} from 'react';

/**
 * Hook for managing inline editing state (text, number fields).
 *
 * Handles:
 *   - Local value buffering (so the input doesn't write to parent on every keystroke)
 *   - Save on blur (compares localValue vs original value)
 *   - Cancel (reset to original)
 *   - isEditing toggle
 *   - Auto-cancel when canEdit becomes false
 */
function useInlineEditState<T>(canEdit: boolean | undefined, value: T, onSave?: (value: T) => void, isEqual?: (newValue: T, originalValue: T) => boolean) {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    const [prevValue, setPrevValue] = useState(value);
    const hasEndedRef = useRef(false);

    if (prevValue !== value) {
        setPrevValue(value);
        setLocalValue(value);
    }

    const startEditing = useCallback(() => {
        hasEndedRef.current = false;
        setIsEditing(true);
    }, []);

    const save = useCallback(() => {
        if (hasEndedRef.current) {
            return;
        }
        hasEndedRef.current = true;
        if (onSave) {
            const shouldSave = isEqual ? !isEqual(localValue, value) : !Object.is(localValue, value);
            if (shouldSave) {
                onSave(localValue);
            }
        }
        // Always reset to the source-of-truth so a rejected save (e.g. empty merchant)
        // doesn't leave stale localValue displayed after edit mode closes.
        setLocalValue(value);
        setIsEditing(false);
    }, [localValue, value, onSave, isEqual]);

    const cancelEditing = useCallback(() => {
        if (hasEndedRef.current) {
            return;
        }
        hasEndedRef.current = true;
        setLocalValue(value);
        setIsEditing(false);
    }, [value]);

    // Cancel editing when permission is revoked (e.g., transaction status changed)
    useEffect(() => {
        if (canEdit || !isEditing) {
            return;
        }
        cancelEditing();
    }, [canEdit, cancelEditing, isEditing]);

    return {isEditing, localValue, setLocalValue, startEditing, save, cancelEditing};
}

export default useInlineEditState;
