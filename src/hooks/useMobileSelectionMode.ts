import {useEffect, useRef} from 'react';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

export default function useMobileSelectionMode() {
    const [selectionMode] = useOnyx(ONYXKEYS.MOBILE_SELECTION_MODE, {canBeMissing: true});
    const inintialSelectionModeValueRef = useRef(selectionMode);

    useEffect(() => {
        if (!inintialSelectionModeValueRef.current) {
            return;
        }
        turnOffMobileSelectionMode();
    }, []);

    return selectionMode;
}
