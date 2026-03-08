import {useFocusEffect} from '@react-navigation/native';
import type {DependencyList} from 'react';
import {useCallback, useEffect, useRef, useState} from 'react';

type UseInitialSelectionRefOptions = {
    /** Dependencies that should trigger refreshing the snapshot (e.g., when a modal opens) */
    resetDeps?: DependencyList;
    /** Whether to refresh the snapshot whenever the screen gains focus */
    resetOnFocus?: boolean;
};

/**
 * Keeps an immutable snapshot of the initial selection for the current open/focus cycle.
 * Callers can refresh the snapshot by changing `resetDeps` or via screen focus.
 */
function useInitialSelectionRef<T>(selection: T, options: UseInitialSelectionRefOptions = {}) {
    const {resetDeps = [], resetOnFocus = false} = options;
    const [initialSelection, setInitialSelection] = useState(selection);
    const latestSelectionRef = useRef(selection);

    useEffect(() => {
        latestSelectionRef.current = selection;
    }, [selection]);

    useEffect(() => {
        setInitialSelection(selection);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, resetDeps);

    useFocusEffect(
        useCallback(() => {
            if (!resetOnFocus) {
                return;
            }
            setInitialSelection(latestSelectionRef.current);
        }, [resetOnFocus]),
    );

    return initialSelection;
}

export default useInitialSelectionRef;
