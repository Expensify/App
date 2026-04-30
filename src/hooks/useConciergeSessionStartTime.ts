import {useIsFocused} from '@react-navigation/native';
import {useState} from 'react';
import DateUtils from '@libs/DateUtils';
import useIsInSidePanel from './useIsInSidePanel';
import useSidePanelState from './useSidePanelState';

/**
 * Returns the session start time for a Concierge chat. Uses the side panel's
 * session time when rendered inside the side panel, otherwise captures
 * `DateUtils.getDBTime()` on the **first** focus after mount/navigating to
 * the Concierge DM and keeps that value stable until the user navigates to a
 * different chat. This avoids resetting the welcome state when the user
 * navigates to a child report (e.g. an onboarding task) and comes back.
 */
function useConciergeSessionStartTime(isConciergeChat: boolean): string | null {
    const isInSidePanel = useIsInSidePanel();
    const isFocused = useIsFocused();
    const {sessionStartTime: sidePanelSessionStartTime} = useSidePanelState();

    const shouldHide = !isFocused || !isConciergeChat || isInSidePanel;
    const [mainDMSessionStartTime, setMainDMSessionStartTime] = useState<string | null>(null);
    const [prevShouldHide, setPrevShouldHide] = useState(true);
    const [prevIsConciergeChat, setPrevIsConciergeChat] = useState(isConciergeChat);

    // When the user navigates away from Concierge to a different chat,
    // isConciergeChat flips to false. Reset so the next visit to Concierge
    // gets a fresh session.
    if (prevIsConciergeChat !== isConciergeChat) {
        setPrevIsConciergeChat(isConciergeChat);
        if (!isConciergeChat) {
            setMainDMSessionStartTime(null);
            setPrevShouldHide(true);
        }
    }

    // Set the session time only on the first hide→show transition per visit.
    // Subsequent focus regains (e.g. returning from a child task thread)
    // keep the existing session time so the welcome state doesn't flash.
    if (prevShouldHide !== shouldHide) {
        setPrevShouldHide(shouldHide);
        if (!shouldHide && !mainDMSessionStartTime) {
            setMainDMSessionStartTime(DateUtils.getDBTime());
        }
    }

    return isInSidePanel ? sidePanelSessionStartTime : mainDMSessionStartTime;
}

export default useConciergeSessionStartTime;
