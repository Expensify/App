import {useEffect} from 'react';

type UseWindowFocusEventCallback = (event: FocusEvent) => void;
export type {UseWindowFocusEventCallback};

/**
 * Subscribes the given callback to the window's focus event. Web/desktop only. No-op on other platforms.
 *
 * @param callback the function to run when focus event is fired for the window. This should be memoized with `useCallback`.
 */
export default function useWindowFocusEvent(callback: UseWindowFocusEventCallback) {
    useEffect(() => {
        window.addEventListener('focus', callback);

        return () => {
            window.removeEventListener('focus', callback);
        };
    }, [callback]);
}
