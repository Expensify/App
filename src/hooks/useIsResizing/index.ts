import {useEffect, useState} from 'react';

/** How long to wait after the last resize event before treating the layout as settled. */
const RESIZE_SETTLE_DELAY = 500;

/**
 * Custom hook to track if the window is being resized.
 * It reports true while resize events are arriving and settles once they stop, e.g. once the window has
 * finished being dragged or the device has finished rotating.
 */
function useIsResizing(): boolean {
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        let settleTimeoutID: ReturnType<typeof setTimeout> | undefined;

        const handleResize = () => {
            setIsResizing(true);

            // Each event pushes the settle deadline back, so a burst resolves once. The deadline is kept
            // here rather than in a callback that closes over isResizing: an orientation change can emit
            // a single resize event, and a callback reading a stale isResizing would never settle at all.
            clearTimeout(settleTimeoutID);
            settleTimeoutID = setTimeout(() => setIsResizing(false), RESIZE_SETTLE_DELAY);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(settleTimeoutID);
        };
    }, []);

    return isResizing;
}

export default useIsResizing;
