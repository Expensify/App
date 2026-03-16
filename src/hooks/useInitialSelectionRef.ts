import {useFocusEffect} from '@react-navigation/native';
import type {DependencyList} from 'react';
import {useCallback, useEffect, useRef, useState} from 'react';

type UseInitialSelectionRefOptions<T> = {
    /** Dependencies that should trigger refreshing the snapshot (e.g., when a modal opens) */
    resetDeps?: DependencyList;

    /** Whether to refresh the snapshot whenever the screen gains focus */
    resetOnFocus?: boolean;

    /** Whether the snapshot should continue following incoming selection changes */
    shouldSyncSelection?: boolean;

    /** Equality check used to avoid replacing the snapshot with equivalent values */
    isEqual?: (previousSelection: T, nextSelection: T) => boolean;
};

/**
 * Keeps an immutable snapshot of the initial selection for the current open/focus cycle.
 * Callers can refresh the snapshot by changing `resetDeps` or via screen focus.
 */
function useInitialSelectionRef<T>(selection: T, options: UseInitialSelectionRefOptions<T> = {}) {
    const {resetDeps = [], resetOnFocus = false, shouldSyncSelection = false, isEqual = Object.is} = options;
    const [initialSelection, setInitialSelection] = useState(selection);
    const latestSelectionRef = useRef(selection);

    const updateInitialSelection = useCallback(
        (nextSelection: T) => {
            setInitialSelection((previousSelection) => (isEqual(previousSelection, nextSelection) ? previousSelection : nextSelection));
        },
        [isEqual],
    );

    useEffect(() => {
        latestSelectionRef.current = selection;
    }, [selection]);

    useEffect(() => {
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

    useEffect(() => {
        if (!shouldSyncSelection) {
            return;
        }

        updateInitialSelection(selection);
    }, [selection, shouldSyncSelection, updateInitialSelection]);

    return initialSelection;
}

export default useInitialSelectionRef;
