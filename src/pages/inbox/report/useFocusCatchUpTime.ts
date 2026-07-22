import OnyxFocusDefaultContext from '@components/OnyxFocusBoundary/OnyxFocusDefaultContext';

import DateUtils from '@libs/DateUtils';

import {useIsFocused} from '@react-navigation/native';
import {use, useState} from 'react';

/**
 * DB timestamp of this screen's last blur -> focus transition. On focus-gated screens
 * (`OnyxFocusBoundary`), blurred-period Onyx changes are delivered in one catch-up render after
 * refocus, so actions with `created` at or before this time arrived while the user was not watching.
 * Returns `null` when the screen is not focus-gated or has not been blurred yet, so guards built on
 * it stay inert. Never stamps on mount.
 */
function useFocusCatchUpTime(): string | null {
    const isFocusGated = use(OnyxFocusDefaultContext) !== undefined;
    const isFocused = useIsFocused();

    // State adjusted during render (not a ref) so callers can use the value in the render phase.
    // Skipped entirely when ungated, so those screens pay no render-phase setState re-run.
    const [focusState, setFocusState] = useState<{isFocused: boolean; focusedSince: string | null}>({isFocused, focusedSince: null});
    if (isFocusGated && focusState.isFocused !== isFocused) {
        setFocusState({isFocused, focusedSince: isFocused ? DateUtils.getDBTime() : focusState.focusedSince});
    }

    return isFocusGated ? focusState.focusedSince : null;
}

export default useFocusCatchUpTime;
