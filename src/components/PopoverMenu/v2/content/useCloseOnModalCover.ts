import {useEffect} from 'react';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';

/** Closes the popover when a non-popover alert modal becomes visible. `useEffect` is appropriate here — Onyx is an external system. */
function useCloseOnModalCover(isVisible: boolean, close: () => void): void {
    const [modal] = useOnyx(ONYXKEYS.MODAL);
    const isCovered = !!modal?.willAlertModalBecomeVisible && !modal?.isPopover;
    useEffect(() => {
        if (!isVisible || !isCovered) {
            return;
        }
        close();
    }, [isCovered, isVisible, close]);
}

export default useCloseOnModalCover;
