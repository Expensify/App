import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useRef} from 'react';
import {InteractionManager} from 'react-native';
import type {UseTabFocusFunction, UseTabFocusInputParams} from './types';

/**
 * Custom hook to focus an input when the tab becomes active
 * iOS-specific implementation with conditional delay
 */
export default function useTabFocusInput(focusFunction: UseTabFocusFunction, {enabled = true, shouldDelay = false, focusDelay = 1000}: UseTabFocusInputParams = {}) {
    const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useFocusEffect(
        useCallback(() => {
            if (!enabled || !focusFunction) {
                return;
            }

            if (focusTimeoutRef.current) {
                clearTimeout(focusTimeoutRef.current);
            }

            if (shouldDelay) {
                focusTimeoutRef.current = setTimeout(() => {
                    InteractionManager.runAfterInteractions(() => {
                        focusFunction();
                    });
                }, focusDelay);
                return;
            }

            InteractionManager.runAfterInteractions(() => {
                focusFunction();
            });

            return () => {
                if (!focusTimeoutRef.current) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
        }, [focusFunction, enabled, shouldDelay, focusDelay]),
    );
}
