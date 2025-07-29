import type {NavigationState} from '@react-navigation/routers';
import {useEffect, useRef, useState} from 'react';
import navigationRef from '@libs/Navigation/navigationRef';

type Selector<T> = (state: NavigationState) => T;

/**
 * Hook to get a value from the current root navigation state using a selector.
 *
 * @param selector Selector function to get a value from the state.
 */
function useRootNavigationState<T>(selector: Selector<T>): T {
    const [result, setResult] = useState(() => selector(navigationRef.getRootState()));

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
