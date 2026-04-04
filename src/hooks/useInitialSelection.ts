import {useFocusEffect} from '@react-navigation/native';
import type {DependencyList} from 'react';
import {useCallback, useEffect, useRef, useState} from 'react';

type UseInitialSelectionOptions = {
    /** Dependencies that should trigger refreshing the snapshot (e.g., when a modal opens) */
    resetDeps?: DependencyList;

    /** Whether to refresh the snapshot whenever the screen gains focus */
    resetOnFocus?: boolean;
};

/**
 * Keeps an immutable snapshot of the initial selection for the current open/focus cycle.
 * Callers can refresh the snapshot by changing `resetDeps` or via screen focus.
 */
function useInitialSelection<T>(selection: T, options: UseInitialSelectionOptions = {}) {
    const {resetDeps = [], resetOnFocus = false} = options;
    const [initialSelection, setInitialSelection] = useState(selection);
    const latestSelectionRef = useRef(selection);

    const updateInitialSelection = useCallback((nextSelection: T) => {
        setInitialSelection((previousSelection) => (Object.is(previousSelection, nextSelection) ? previousSelection : nextSelection));
    }, []);

    useEffect(() => {
        latestSelectionRef.current = selection;
    }, [selection]);

    useEffect(() => {
        // Intentionally refresh the snapshot only when the caller marks a new open/focus cycle.
        // Live selection changes while the picker stays open should not repin or refocus the list.
        updateInitialSelection(selection);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, resetDeps);

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
