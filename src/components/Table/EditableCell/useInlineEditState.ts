import {useCallback, useEffect, useState} from 'react';

/**
 * Hook for managing inline editing state (text, number fields).
 *
 * Handles:
 *   - Local value buffering (so the input doesn't write to parent on every keystroke)
 *   - Save on blur (compares localValue vs original value)
 *   - Cancel (reset to original)
 *   - isEditing toggle
 */
function useInlineEditState<T>(value: T, onSave?: (value: T) => void) {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value);

    // Sync local value when the source-of-truth changes externally
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const startEditing = useCallback(() => {
        setIsEditing(true);
    }, []);

    const save = useCallback(() => {
        if (localValue !== value) {
            onSave?.(localValue);
        }
        setIsEditing(false);
    }, [localValue, value, onSave]);

    const cancelEditing = useCallback(() => {
        setLocalValue(value);
        setIsEditing(false);
    }, [value]);

    return {isEditing, localValue, setLocalValue, startEditing, save, cancelEditing};
}

export default useInlineEditState;
