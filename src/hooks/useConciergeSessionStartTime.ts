import {useIsFocused} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import {setConciergeSessionStartTime, setConciergeShowFullHistory} from '@libs/actions/ConciergeSession';
import DateUtils from '@libs/DateUtils';
import Log from '@libs/Log';
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
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const shouldActivate = isFocused && isConciergeChat && !isInSidePanel;

    const [mainDMSessionStartTime, setMainDMSessionStartTime] = useState<string | null>(null);
    const [prevShouldActivate, setPrevShouldActivate] = useState(false);

    useEffect(() => {
        Log.info(
            '[ConciergeSession] render',
            false,
            {
                isConciergeChat,
                isFocused,
                isInSidePanel,
                shouldActivate,
                persistedTime,
                mainDMSessionStartTime,
                prevShouldActivate,
                conciergeReportID,
            },
        );
    }, [isConciergeChat, isFocused, isInSidePanel, shouldActivate, persistedTime, mainDMSessionStartTime, prevShouldActivate, conciergeReportID]);

    // When this is not the Concierge report, immediately clear the persisted state.
    useEffect(() => {
        if (isConciergeChat) {
            return;
        }
        setConciergeSessionStartTime(null);
        setConciergeShowFullHistory(false);
        Log.info('[ConciergeSession] clear (non-concierge)', false);
    }, [isConciergeChat]);

    if (!shouldActivate || prevShouldActivate) {
        return isInSidePanel ? sidePanelSessionStartTime : mainDMSessionStartTime;
    }

    setPrevShouldActivate(true);
    if (persistedTime) {
        setMainDMSessionStartTime(persistedTime);
        Log.info('[ConciergeSession] restore persisted session time', false, {persistedTime});
    } else {
        const boundary = lastReadTime ?? DateUtils.getDBTime();
        setMainDMSessionStartTime(boundary);
        setConciergeSessionStartTime(boundary);
        Log.info('[ConciergeSession] set new session time', false, {boundary, lastReadTime});
    }

    if (isInSidePanel) {
        return sidePanelSessionStartTime;
    }

    return shouldActivate ? mainDMSessionStartTime : null;
}

export default useConciergeSessionStartTime;
