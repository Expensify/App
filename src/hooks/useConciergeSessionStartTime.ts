import {useState} from 'react';
import DateUtils from '@libs/DateUtils';
import useIsInSidePanel from './useIsInSidePanel';
import useSidePanelState from './useSidePanelState';

/**
 * Returns the session start time for a Concierge chat.
 *
 * Both the side panel and main DM use the same pattern: a local useState
 * boundary that is set on activation and cleared on deactivation. No Onyx
 * keys are involved — no cross-instance conflicts are possible.
 *
 * - **Side panel:** boundary = min(sidePanelSessionStartTime, lastReadTime)
 * - **Main DM:** boundary = lastReadTime captured on first activation,
 *   cleared when isConciergeChat transitions to false.
 */
function useConciergeSessionStartTime(isConciergeChat: boolean, lastReadTime?: string): string | null {
    const isInSidePanel = useIsInSidePanel();
    const {sessionStartTime: sidePanelSessionStartTime} = useSidePanelState();

    // --- Side panel ---
    const [sidePanelBoundary, setSidePanelBoundary] = useState<string | null>(() => {
        if (!sidePanelSessionStartTime) {
            return null;
        }
        return lastReadTime && lastReadTime < sidePanelSessionStartTime ? lastReadTime : sidePanelSessionStartTime;
    });
    const [prevSidePanelStartTime, setPrevSidePanelStartTime] = useState(sidePanelSessionStartTime);

    // --- Main DM ---
    const [boundary, setBoundary] = useState<string | null>(() => {
        if (isInSidePanel || !isConciergeChat) {
            return null;
        }
        return lastReadTime ?? DateUtils.getDBTime();
    });
    const [prevIsConciergeChat, setPrevIsConciergeChat] = useState(isConciergeChat);

    if (sidePanelSessionStartTime !== prevSidePanelStartTime) {
        setPrevSidePanelStartTime(sidePanelSessionStartTime);
        if (sidePanelSessionStartTime) {
            const newBoundary = lastReadTime && lastReadTime < sidePanelSessionStartTime ? lastReadTime : sidePanelSessionStartTime;
            setSidePanelBoundary(newBoundary);
        } else {
            setSidePanelBoundary(null);
        }
    }

    if (isInSidePanel) {
        return sidePanelBoundary;
    }

    if (prevIsConciergeChat !== isConciergeChat) {
        setPrevIsConciergeChat(isConciergeChat);
        if (!isConciergeChat) {
            setBoundary(null);
        }
    }

    if (!isConciergeChat) {
        return null;
    }

    if (!boundary) {
        const newBoundary = lastReadTime ?? DateUtils.getDBTime();
        setBoundary(newBoundary);
        return newBoundary;
    }

    return boundary;
}

export default useConciergeSessionStartTime;
