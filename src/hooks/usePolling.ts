import Visibility from '@libs/Visibility';

import {useEffect, useRef} from 'react';

import useDebounceNonReactive from './useDebounceNonReactive';

/**
 * Periodically invokes `callback` on a fixed interval, and immediately whenever the app regains visibility/foreground.
 * Useful for detecting state changes that can happen while the user is away, e.g. a permission granted from OS Settings.
 *
 * @param callback - The function to invoke on each tick or visibility change
 * @param interval - The polling interval in milliseconds
 * @param [enabled=true] - Whether polling should be active
 * @param [debounceWait] - If provided, coalesces ticks that land close together (e.g. the interval firing at the same
 * time as a visibility/foreground change) into a single call, instead of invoking `callback` once per trigger.
 */
function usePolling(callback: () => void | Promise<void>, interval: number, enabled = true, debounceWait?: number): void {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const debouncedTick = useDebounceNonReactive(() => {
        callbackRef.current();
    }, debounceWait ?? 0);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const tick = () => {
            if (debounceWait) {
                debouncedTick();
                return;
            }

            callbackRef.current();
        };

        const unsubscribe = Visibility.onVisibilityChange(tick);
        const intervalId = setInterval(tick, interval);
        return () => {
            unsubscribe();
            clearInterval(intervalId);
        };
    }, [enabled, interval, debounceWait, debouncedTick]);
}

export default usePolling;
