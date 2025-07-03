import {useEffect, useRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import ONYXKEYS from '@src/ONYXKEYS';

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
