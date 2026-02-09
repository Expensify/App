import debounce from 'lodash/debounce';
import {useEffect, useMemo, useState} from 'react';

/**
 * Custom hook to track if the window is being resized and its current width.
 * It sets a state variable `isResizing` to true when a resize event occurs,
 * and sets it back to false after 1 second of inactivity.
 */
function useIsResizing(): {isResizing: boolean; windowWidth: number} {
    const [isResizing, setIsResizing] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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
            setWindowWidth(window.innerWidth);
            debouncedSetIsResizing();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            debouncedSetIsResizing.cancel();
        };
    }, [isResizing, debouncedSetIsResizing]);

    return {isResizing, windowWidth};
}

export default useIsResizing;
