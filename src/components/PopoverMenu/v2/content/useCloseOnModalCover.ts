import {useEffect, useRef} from 'react';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';

function useCloseOnModalCover(isVisible: boolean, close: () => void): void {
    const [modal, modalMeta] = useOnyx(ONYXKEYS.MODAL);
    const isLoaded = modalMeta.status === 'loaded';
    const isCovered = !!modal?.willAlertModalBecomeVisible && !modal?.isPopover;
    // Seed with current value: mounting inside an already-covered modal isn't a fresh cover.
    const wasCoveredRef = useRef(isCovered);
    useEffect(() => {
        // Onyx hydration can flip undefined→true with a stale cover from a prior modal; wait for the loaded snapshot.
        if (!isLoaded) {
            return;
        }
        const wasCovered = wasCoveredRef.current;
        wasCoveredRef.current = isCovered;
        if (wasCovered || !isCovered || !isVisible) {
            return;
        }
        close();
    }, [isCovered, isVisible, close, isLoaded]);
}

export default useCloseOnModalCover;
