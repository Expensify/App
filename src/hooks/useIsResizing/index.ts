import debounce from 'lodash/debounce';
import {useEffect, useMemo, useState} from 'react';

/**
 * Custom hook to track if the window is being resized.
 * It sets a state variable `isResizing` to true when a resize event occurs,
 * and sets it back to false after 1 second of inactivity.
 */
function useIsResizing(): boolean {
    const [isResizing, setIsResizing] = useState(false);

    const debouncedSetIsResizing = useMemo(
        () =>
            debounce(() => {
                if (!isResizing) {
                    return;
                }

                // Set isResizing to false after 500 milliseconds of inactivity (no resize events emitted)
                setIsResizing(false);
            }, 500),
        [isResizing],
    );

    useEffect(() => {
        const handleResize = () => {
            if (!isResizing) {
                setIsResizing(true);
            }
            debouncedSetIsResizing();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            debouncedSetIsResizing.cancel();
        };
    }, [isResizing, debouncedSetIsResizing]);

    return isResizing;
}

export default useIsResizing;
