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
 *   the panel opens so messages arriving while the panel was closed are treated
 *   as "unread" rather than hidden behind the greeting.
 * - **Main DM:** Captures `lastReadTime` the first time the Concierge report
 *   activates. Persists via a RAM-only Onyx key so it survives component
 *   unmounts caused by deep navigation (e.g. workspace sub-pages). The session
 *   is cleared only when a *focused* non-Concierge ReportActionsView mounts
 *   (i.e. the user navigated to a different chat). Settings / profile / workspace
 *   pages don't render ReportActionsView so the session is preserved.
 */
function useConciergeSessionStartTime(isConciergeChat: boolean, lastReadTime?: string): string | null {
    const isInSidePanel = useIsInSidePanel();
    const isFocused = useIsFocused();
    const {sessionStartTime: sidePanelSessionStartTime} = useSidePanelState();
    const [persistedTime = null] = useOnyx(ONYXKEYS.RAM_ONLY_CONCIERGE_SESSION_START_TIME);

    // Write-through cache so the first render after activation already returns
    // the boundary without waiting for the async Onyx.merge round-trip.
    const [localTime, setLocalTime] = useState<string | null>(null);
    const [prevPersistedTime, setPrevPersistedTime] = useState(persistedTime);
    const [prevIsConciergeChat, setPrevIsConciergeChat] = useState(isConciergeChat);

    // --- Side panel: capture boundary at panel-open time ---
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

    // Synchronously clear localTime when navigating away from Concierge within
    // the same component instance (React Navigation reuses the screen with
    // different route params). This eliminates the async gap where localTime
    // would still hold the old boundary.
    if (prevIsConciergeChat !== isConciergeChat) {
        setPrevIsConciergeChat(isConciergeChat);
        if (prevIsConciergeChat && !isConciergeChat && !isInSidePanel) {
            setLocalTime(null);
        }
    }

    // Drop stale write-through cache when Onyx genuinely transitions to null
    // (another instance cleared the session, e.g. after screen unfreeze).
    if (prevPersistedTime !== persistedTime) {
        setPrevPersistedTime(persistedTime);
        if (!persistedTime && localTime) {
            setLocalTime(null);
        }
    }

    // Clear persisted Onyx session when a focused, non-side-panel view renders
    // a non-Concierge chat. Covers fresh mounts (stack navigation) and the
    // same-instance case. The isFocused guard prevents background RHP mounts
    // from wiping the active session.
    useEffect(() => {
        if (isConciergeChat || !isFocused || isInSidePanel) {
            return;
        }
        setConciergeSessionStartTime(null);
        setConciergeShowFullHistory(false);
    }, [isConciergeChat, isFocused, isInSidePanel]);

    if (isInSidePanel) {
        return sidePanelBoundary;
    }

    // Initialize session on first activation (fresh mount or after clear).
    const sessionTime = persistedTime ?? localTime;
    if (isConciergeChat && !sessionTime) {
        const boundary = lastReadTime ?? DateUtils.getDBTime();
        setConciergeSessionStartTime(boundary);
        setLocalTime(boundary);
    }

    return sessionTime;
}

export default useConciergeSessionStartTime;
