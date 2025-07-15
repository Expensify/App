import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useRef} from 'react';
import {InteractionManager} from 'react-native';
import Navigation from '@libs/Navigation/Navigation';

/**
 * Hook that creates a callback which only executes if the user is still on the same route
 * where the callback was initially triggered. Prevents stale actions after navigation.
 */
export default function useRouteValidatedCallback<T extends unknown[]>(
    callback: (...args: T) => void,
): (...args: T) => void {
    const triggerRouteRef = useRef<string>('');

    useFocusEffect(
        useCallback(() => {
            InteractionManager.runAfterInteractions(() => {
                triggerRouteRef.current = Navigation.getActiveRouteWithoutParams();
            });
        }, []),
    );

    return useCallback(
        (...args: T) => {
            const currentRoute = Navigation.getActiveRouteWithoutParams();
            
            // Only execute if we're still on the same route
            if (currentRoute === triggerRouteRef.current) {
                callback(...args);
            }
        },
        [callback],
    );
}