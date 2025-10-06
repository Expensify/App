import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import {InteractionManager} from 'react-native';

type FocusFunction = () => void;

type UseTabFocusInputParams = {
    enabled?: boolean;
    shouldDelay?: boolean;
    focusDelay?: number;
};

/**
 * Custom hook to focus an input when the tab becomes active
 * Default implementation - no delay (shouldDelay is ignored)
 */
export default function useTabFocusInput(focusFunction: FocusFunction, {enabled = true, shouldDelay = false, focusDelay = 1000}: UseTabFocusInputParams = {}) {
    useFocusEffect(
        useCallback(() => {
            if (!enabled || !focusFunction) return;

            InteractionManager.runAfterInteractions(() => {
                focusFunction();
            });
        }, [focusFunction, enabled]),
    );
}
