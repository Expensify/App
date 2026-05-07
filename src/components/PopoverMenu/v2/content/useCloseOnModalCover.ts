import {useEffect, useRef} from 'react';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';

/** Closes the popover when a non-popover modal is about to cover it. */
function useCloseOnModalCover(isVisible: boolean, close: () => void): void {
    const [modal] = useOnyx(ONYXKEYS.MODAL);
    const isCovered = !!modal?.willAlertModalBecomeVisible && !modal?.isPopover;
    // Initialize to current `isCovered` so a popover mounting inside an already-covered modal isn't mistaken for a fresh cover.
    const wasCoveredRef = useRef(isCovered);
    useEffect(() => {
        const wasCovered = wasCoveredRef.current;
        wasCoveredRef.current = isCovered;
        if (wasCovered || !isCovered || !isVisible) {
            return;
        }
        close();
    }, [isCovered, isVisible, close]);
}

export default useCloseOnModalCover;
