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
 * - **Side panel:** Captures `min(sidePanelSessionStartTime, lastReadTime)` when
 *   the panel opens. This ensures messages arriving while the panel was closed
 *   are treated as "unread" rather than hidden behind the greeting.
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

    // Capture side panel boundary at panel-open time so later lastReadTime
    // updates (auto-read) don't shift the boundary.
    const [sidePanelBoundary, setSidePanelBoundary] = useState<string | null>(() => {
        if (!sidePanelSessionStartTime) {
            return null;
        }
        return lastReadTime && lastReadTime < sidePanelSessionStartTime ? lastReadTime : sidePanelSessionStartTime;
    });
    const [prevSidePanelStartTime, setPrevSidePanelStartTime] = useState(sidePanelSessionStartTime);

    if (sidePanelSessionStartTime !== prevSidePanelStartTime) {
        setPrevSidePanelStartTime(sidePanelSessionStartTime);
        if (sidePanelSessionStartTime) {
            const boundary = lastReadTime && lastReadTime < sidePanelSessionStartTime ? lastReadTime : sidePanelSessionStartTime;
            setSidePanelBoundary(boundary);
        } else {
            setSidePanelBoundary(null);
        }
    }

    // Reset local activation state only when navigating to a different chat
    // (isConciergeChat flips to false), not when merely losing focus to
    // settings/profile/workspaces. Without this, the reused route component
    // would keep prevShouldActivate=true and skip re-activation.
    if (prevShouldActivate && !shouldActivate && !isConciergeChat) {
        setPrevShouldActivate(false);
        setMainDMSessionStartTime(null);
    }

    // Clear persisted state only when a focused, non-side-panel view navigates
    // away from Concierge. Without the isFocused guard, an RHP report mounting
    // in the background would wipe the active Concierge session.
    useEffect(() => {
        if (isConciergeChat || !isFocused || isInSidePanel) {
            return;
        }
        setConciergeSessionStartTime(null);
        setConciergeShowFullHistory(false);
    }, [isConciergeChat, isFocused, isInSidePanel]);

    if (!shouldActivate || prevShouldActivate) {
        return isInSidePanel ? sidePanelBoundary : mainDMSessionStartTime;
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
        return sidePanelBoundary;
    }

    return shouldActivate ? mainDMSessionStartTime : null;
}

export default useConciergeSessionStartTime;
