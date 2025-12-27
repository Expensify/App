import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import {InteractionManager} from 'react-native';
import type {UseTabFocusFunction, UseTabFocusInputParams} from './types';

/**
 * Custom hook to focus an input when the tab becomes active
 * Default implementation - no delay (shouldDelay is ignored)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function useTabFocusInput(focusFunction: UseTabFocusFunction, {enabled = true, ...options}: UseTabFocusInputParams = {}) {
    useFocusEffect(
        useCallback(() => {
            if (!enabled || !focusFunction) {
                return;
            }

            InteractionManager.runAfterInteractions(() => {
                focusFunction();
            });
        }, [focusFunction, enabled]),
    );
}
