import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useEffect, useRef, useState} from 'react';

type UseInitialSelectionOptions = {
    /** Whether the current cycle is visible; refresh the snapshot when it becomes visible */
    isVisible?: boolean;

    /** Whether to refresh the snapshot whenever the screen gains focus */
    resetOnFocus?: boolean;
};

/**
 * Keeps an immutable snapshot of the initial selection for the current open/focus cycle.
 * Callers can refresh the snapshot when a modal becomes visible or via screen focus.
 */
function useInitialSelection<T>(selection: T, options: UseInitialSelectionOptions = {}) {
    const {isVisible, resetOnFocus = false} = options;
    const [initialSelection, setInitialSelection] = useState(selection);
    const latestSelectionRef = useRef(selection);
    const previousIsVisibleRef = useRef(isVisible);

    const updateInitialSelection = useCallback((nextSelection: T) => {
        setInitialSelection((previousSelection) => (Object.is(previousSelection, nextSelection) ? previousSelection : nextSelection));
    }, []);

    useEffect(() => {
        latestSelectionRef.current = selection;
    }, [selection]);

    useEffect(() => {
        const wasVisible = previousIsVisibleRef.current;
        previousIsVisibleRef.current = isVisible;

        if (isVisible === undefined || !isVisible || wasVisible === isVisible) {
            return;
        }

        // Refresh only when a new visible cycle starts.
        // Live selection changes while the picker stays open should not repin or refocus the list.
        updateInitialSelection(latestSelectionRef.current);
    }, [isVisible, updateInitialSelection]);

    useFocusEffect(
        useCallback(() => {
            if (!resetOnFocus) {
                return;
            }

            updateInitialSelection(latestSelectionRef.current);
        }, [resetOnFocus, updateInitialSelection]),
    );

    return initialSelection;
}

export default useInitialSelection;
