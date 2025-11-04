import type {NavigationState} from '@react-navigation/routers';
import {useEffect, useRef, useState} from 'react';
import Log from '@libs/Log';
import navigationRef from '@libs/Navigation/navigationRef';

type Selector<T> = (state: NavigationState | undefined) => T;

/**
 * Hook to get a value from the current root navigation state using a selector.
 *
 * If navigation is not yet initialized, undefined will be passed to the selector function
 * instead of NavigationState. Therefore, the selector must handle undefined
 * and return a safe default value.
 *
 * @param selector Selector function to get a value from the state.
 */
function useRootNavigationState<T>(selector: Selector<T>): T {
    const [result, setResult] = useState<T>(() => {
        if (!navigationRef.isReady()) {
            Log.warn('[src/hooks/useRootNavigationState.ts] NavigationRef is not ready. Returning selector value with undefined.');
            return selector(undefined);
        }
        return selector(navigationRef.getRootState());
    });

    // We store the selector in a ref to avoid re-subscribing listeners every render
    const selectorRef = useRef(selector);

    useEffect(() => {
        selectorRef.current = selector;
    });

    useEffect(() => {
        const unsubscribe = navigationRef.addListener('state', () => {
            // State from the event data may be incomplete. (defined params but no nested state for the route)
            setResult(selectorRef.current(navigationRef.getRootState()));
        });

        return unsubscribe;
    }, []);

    return result;
}

export default useRootNavigationState;
