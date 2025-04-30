import {useNavigation} from '@react-navigation/native';
import type {NavigationState} from '@react-navigation/native';
import {useCallback, useEffect, useRef} from 'react';
import Navigation from '@libs/Navigation/Navigation';

/**
 * Options for configuring the custom history hook
 */
type UseCustomHistoryOptions = {
    /** Unique identifier for this history entry */
    id: string;
    /** Callback function to execute when the history entry is pushed */
    onPush: () => void;
    /** Callback function to execute when the history entry is popped */
    onPop: () => void;
};

/**
 * Custom hook for managing navigation history entries
 * It allows component to track and manage their presence in the navigation history stack
 * that is not determined by the routes of navigator.
 *
 * @param options - Configuration options for the custom history
 * @returns Object containing functions to manually push and pop the history entry
 */
function useCustomHistory({id, onPush, onPop}: UseCustomHistoryOptions) {
    const navigation = useNavigation();
    const previousStateRef = useRef<NavigationState | null>(null);

    useEffect(() => {
        /**
         * Handles changes to the navigation state
         * Compares the current state with the previous state to determine if our custom history entry
         * was added or removed from the navigation stack. It will call the onPush or onPop callback accordingly.
         */
        const handleStateChange = (state: NavigationState) => {
            const previousState = previousStateRef.current;
            previousStateRef.current = state;

            if (!previousState) {
                // First render - check if our custom history entry exists. If yes, open entry.
                const hasEntry = state.history?.some((entry) => entry === id);
                if (hasEntry) {
                    onPush();
                }
                return;
            }

            // Check if our custom history entry was added or removed
            const wasInHistory = previousState.history?.some((entry) => entry === id);
            const isInHistory = state.history?.some((entry) => entry === id);

            if (wasInHistory && !isInHistory) {
                onPop();
            } else if (!wasInHistory && isInHistory) {
                onPush();
            }
        };

        // Subscribe to navigation state changes
        const unsubscribe = navigation.addListener('state', (e) => {
            handleStateChange(e.data.state);
        });

        return () => unsubscribe();
    }, [navigation, id, onPush, onPop]);

    /**
     * Manually pushes this history entry to the navigator history.
     * It will also call the onPush callback.
     */
    const pushHistoryEntry = useCallback(() => {
        Navigation.pushHistoryEntry(id);
    }, [id]);

    /**
     * Manually pops this history entry from the navigator history.
     * It will also call the onPop callback.
     */
    const popHistoryEntry = useCallback(() => {
        Navigation.popHistoryEntry(id);
    }, [id]);

    return {pushHistoryEntry, popHistoryEntry};
}

export default useCustomHistory;
