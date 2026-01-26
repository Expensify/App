import type {KeyboardEvent} from 'react';
import {useCallback} from 'react';

/**
 * Custom hook that returns a keyboard event handler which triggers a callback
 * when the Enter key is pressed.
 *
 * @param callback - The function to execute when Enter key is pressed
 * @returns A keyboard event handler function
 *
 * @example
 * const handleKeyDown = useEnterKeyHandler(() => navigation.navigate('Home'));
 */
function useEnterKeyHandler(callback: () => void) {
    return useCallback(
        (event: KeyboardEvent) => {
            if (event.key !== 'Enter') {
                return;
            }
            event.preventDefault();
            callback();
        },
        [callback],
    );
}

export default useEnterKeyHandler;
