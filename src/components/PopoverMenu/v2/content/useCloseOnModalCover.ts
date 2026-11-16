import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';

import {isModalCoveringSelector} from '@selectors/Modal';
import {useEffect, useRef} from 'react';

function useCloseOnModalCover(isVisible: boolean, close: () => void): void {
    const [isCovered] = useOnyx(ONYXKEYS.MODAL, {selector: isModalCoveringSelector});
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
