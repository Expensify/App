import {useState} from 'react';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';

/** Closes the popover only on the false→true transition, so mounting inside an already-open non-popover modal doesn't fire as "just got covered." */
function useCloseOnModalCover(isVisible: boolean, setIsVisible: (visible: boolean) => void): void {
    const [modal] = useOnyx(ONYXKEYS.MODAL);
    const isCovered = !!modal?.willAlertModalBecomeVisible && !modal?.isPopover;
    const [wasCovered, setWasCovered] = useState(isCovered);

    if (wasCovered !== isCovered) {
        setWasCovered(isCovered);
        if (isVisible && isCovered) {
            setIsVisible(false);
        }
    }
}

export default useCloseOnModalCover;
