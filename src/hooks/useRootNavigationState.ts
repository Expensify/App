import type {EventListenerCallback, NavigationContainerEventMap} from '@react-navigation/native';
import type {NavigationState} from '@react-navigation/routers';
import {useCallback, useSyncExternalStore} from 'react';
import {navigationRef} from '@libs/Navigation/Navigation';

/**
 * This hook is a replacement for `useNavigationState` for nested navigators.
 * If `useNavigationState` is used within a nested navigator then the state that's returned is the state of the nearest parent navigator,
 * not the root navigator state representing the whole app's navigation tree.
 *
 * Use with caution, because re-rendering any component every time the root navigation state changes can be very costly for performance.
 * That's why the selector is mandatory.
 */
function useRootNavigationState<T>(selector: (state: NavigationState) => T): T | undefined {
    const getSnapshot = useCallback(() => {
        if (!navigationRef.current) {
            return;
        }
        return selector(navigationRef.current.getRootState());
    }, [selector]);

    const subscribeToRootState = useCallback((callback: EventListenerCallback<NavigationContainerEventMap, 'state'>) => {
        const unsubscribe = navigationRef?.current?.addListener('state', callback);
        return () => unsubscribe?.();
    }, []);

    return useSyncExternalStore(subscribeToRootState, getSnapshot);
}

export default useRootNavigationState;
