import {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import ONYXKEYS from '@src/ONYXKEYS';

export default function useMobileSelectionMode(shouldAutoTurnOff = true) {
    const [selectionMode] = useOnyx(ONYXKEYS.MOBILE_SELECTION_MODE);

    useEffect(() => {
        if (!shouldAutoTurnOff) {
            return;
        }
        turnOffMobileSelectionMode();
    }, [shouldAutoTurnOff]);

    return {selectionMode};
}
