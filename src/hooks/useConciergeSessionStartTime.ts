import {useIsFocused} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import {setConciergeSessionStartTime, setConciergeShowFullHistory} from '@libs/actions/ConciergeSession';
import DateUtils from '@libs/DateUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useIsInSidePanel from './useIsInSidePanel';
import useOnyx from './useOnyx';
import useSidePanelState from './useSidePanelState';

/**
 * Returns the session start time for a Concierge chat.
 *
 * - **Side panel:** Uses the side panel's own session time (`DateUtils.getDBTime()`
 *   captured when the panel opens).
 * - **Main DM:** Captures `lastReadTime` on the first focus after navigating
 *   to the Concierge DM. Persists via a RAM-only Onyx key so it survives
 *   component unmounts caused by deep navigation (e.g. workspace sub-pages).
 */
function useConciergeSessionStartTime(isConciergeChat: boolean, lastReadTime?: string): string | null {
    const isInSidePanel = useIsInSidePanel();
    const isFocused = useIsFocused();
    const {sessionStartTime: sidePanelSessionStartTime} = useSidePanelState();
    const [persistedTime = null] = useOnyx(ONYXKEYS.RAM_ONLY_CONCIERGE_SESSION_START_TIME);

    const shouldActivate = isFocused && isConciergeChat && !isInSidePanel;

    const [mainDMSessionStartTime, setMainDMSessionStartTime] = useState<string | null>(null);
    const [prevShouldActivate, setPrevShouldActivate] = useState(false);

    // When this is not the Concierge report, immediately clear the persisted state.
    useEffect(() => {
        if (isConciergeChat) {
            return;
        }
        setConciergeSessionStartTime(null);
        setConciergeShowFullHistory(false);
    }, [isConciergeChat]);

    if (!shouldActivate || prevShouldActivate) {
        return isInSidePanel ? sidePanelSessionStartTime : mainDMSessionStartTime;
    }

    setPrevShouldActivate(true);
    if (persistedTime) {
        setMainDMSessionStartTime(persistedTime);
    } else {
        const boundary = lastReadTime ?? DateUtils.getDBTime();
        setMainDMSessionStartTime(boundary);
        setConciergeSessionStartTime(boundary);
    }

    if (isInSidePanel) {
        return sidePanelSessionStartTime;
    }

    return shouldActivate ? mainDMSessionStartTime : null;
}

export default useConciergeSessionStartTime;
