import {useEffect, useRef} from 'react';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

export default function useMobileSelectionMode() {
    const [selectionMode] = useOnyx(ONYXKEYS.MOBILE_SELECTION_MODE, {canBeMissing: true});
    const initialSelectionModeValueRef = useRef(selectionMode);

    useEffect(() => {
        // in case the selection mode is already off at the start, we don't need to turn it off again
        if (!initialSelectionModeValueRef.current) {
            return;
        }
        turnOffMobileSelectionMode();
    }, []);

    return selectionMode;
}
