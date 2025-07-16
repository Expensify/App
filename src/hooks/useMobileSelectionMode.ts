import {useEffect, useRef} from 'react';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

export default function useMobileSelectionMode() {
    const [isSelectionModeEnabled] = useOnyx(ONYXKEYS.MOBILE_SELECTION_MODE, {initialValue: false, initWithStoredValues: false, canBeMissing: true});
    const initialSelectionModeValueRef = useRef(isSelectionModeEnabled);

    useEffect(() => {
        // in case the selection mode is already off at the start, we don't need to turn it off again
        if (!initialSelectionModeValueRef.current) {
            return;
        }
        turnOffMobileSelectionMode();
    }, []);

    return !!isSelectionModeEnabled;
}
