import {useIsFocused} from '@react-navigation/native';
import {useState} from 'react';
import DateUtils from '@libs/DateUtils';
import useIsInSidePanel from './useIsInSidePanel';
import useSidePanelState from './useSidePanelState';

/**
 * Returns the session start time for a Concierge chat.
 *
 * - **Side panel:** Uses the side panel's own session time (`DateUtils.getDBTime()`
 *   captured when the panel opens).
 * - **Main DM:** Captures `lastReadTime` on the **first** focus after navigating
 *   to the Concierge DM. This separates *read* messages (hidden behind "Show
 *   history") from *unread* messages (always visible), matching the issue spec.
 *   The value stays stable until the user navigates to a different chat.
 */
function useConciergeSessionStartTime(isConciergeChat: boolean, lastReadTime?: string): string | null {
    const isInSidePanel = useIsInSidePanel();
    const isFocused = useIsFocused();
    const {sessionStartTime: sidePanelSessionStartTime} = useSidePanelState();

    const shouldHide = !isFocused || !isConciergeChat || isInSidePanel;
    const [mainDMSessionStartTime, setMainDMSessionStartTime] = useState<string | null>(null);
    const [prevShouldHide, setPrevShouldHide] = useState(true);
    const [prevIsConciergeChat, setPrevIsConciergeChat] = useState(isConciergeChat);

    if (prevIsConciergeChat !== isConciergeChat) {
        setPrevIsConciergeChat(isConciergeChat);
        if (!isConciergeChat) {
            setMainDMSessionStartTime(null);
            setPrevShouldHide(true);
        }
    }

    // Capture the session boundary on the first hide→show transition per visit.
    // For the main DM we use lastReadTime so that unread messages stay visible
    // while read history is collapsed. Falls back to DateUtils.getDBTime() when
    // lastReadTime is unavailable (e.g. fresh report with no reads).
    if (prevShouldHide !== shouldHide) {
        setPrevShouldHide(shouldHide);
        if (!shouldHide && !mainDMSessionStartTime) {
            setMainDMSessionStartTime(lastReadTime ?? DateUtils.getDBTime());
        }
    }

    return isInSidePanel ? sidePanelSessionStartTime : mainDMSessionStartTime;
}

export default useConciergeSessionStartTime;
