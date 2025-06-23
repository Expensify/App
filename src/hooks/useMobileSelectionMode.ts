import {useEffect} from 'react';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

export default function useMobileSelectionMode() {
    const [selectionMode] = useOnyx(ONYXKEYS.MOBILE_SELECTION_MODE);

    useEffect(() => {
        turnOffMobileSelectionMode();
    }, []);

    return {selectionMode};
}
