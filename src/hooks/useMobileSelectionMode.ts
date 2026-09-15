import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';

import ONYXKEYS from '@src/ONYXKEYS';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useRef} from 'react';

import useOnyx from './useOnyx';
import usePrevious from './usePrevious';

export default function useMobileSelectionMode(onTurnOffSelectionMode = () => {}) {
    const [isSelectionModeEnabled = false] = useOnyx(ONYXKEYS.RAM_ONLY_MOBILE_SELECTION_MODE);
    const initialSelectionModeValueRef = useRef(isSelectionModeEnabled);
    const prevIsSelectionModeEnabled = usePrevious(isSelectionModeEnabled);
    const isFocused = useIsFocused();

    useEffect(() => {
        // in case the selection mode is already off at the start, we don't need to turn it off again
        if (!initialSelectionModeValueRef.current) {
            return;
        }
        // An unfocused subscriber would wipe the selection a focused screen just enabled.
        if (!isFocused) {
            return;
        }
        initialSelectionModeValueRef.current = false;
        turnOffMobileSelectionMode();
    }, [isFocused]);

    useEffect(() => {
        if (!prevIsSelectionModeEnabled || isSelectionModeEnabled) {
            return;
        }
        onTurnOffSelectionMode();
    }, [prevIsSelectionModeEnabled, isSelectionModeEnabled, onTurnOffSelectionMode]);

    return !!isSelectionModeEnabled;
}
