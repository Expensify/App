import {useEffect} from 'react';
import {UseWindowFocusEvent, UseWindowFocusEventCallback} from './types';

/**
 * Subscribes the given callback to the window's focus event. Web/desktop only. No-op on native.
 *
 * @param callback the function to run when focus event is fired for the window. This should be memoized with `useCallback`.
 */
const useWindowFocusEvent: UseWindowFocusEvent = (callback: UseWindowFocusEventCallback) => {
    useEffect(() => {
        window.addEventListener('focus', callback);

        return () => {
            window.removeEventListener('focus', callback);
        };
    }, [callback]);
};

export default useWindowFocusEvent;
