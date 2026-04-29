import {useIsFocused} from '@react-navigation/native';
import {useState} from 'react';
import DateUtils from '@libs/DateUtils';
import useIsInSidePanel from './useIsInSidePanel';
import useSidePanelState from './useSidePanelState';

/**
 * Returns the session start time for a Concierge chat. Uses the side panel's
 * session time when rendered inside the side panel, otherwise tracks focus
 * transitions and resets the boundary to `DateUtils.getDBTime()` each time
 * the Concierge DM gains focus — mirroring the pattern in SidePanelContextProvider.
 */
function useConciergeSessionStartTime(isConciergeChat: boolean): string | null {
    const isInSidePanel = useIsInSidePanel();
    const isFocused = useIsFocused();
    const {sessionStartTime: sidePanelSessionStartTime} = useSidePanelState();

    const shouldHide = !isFocused || !isConciergeChat || isInSidePanel;
    const [mainDMSessionStartTime, setMainDMSessionStartTime] = useState<string | null>(null);
    const [prevShouldHide, setPrevShouldHide] = useState(true);

    if (prevShouldHide !== shouldHide) {
        setPrevShouldHide(shouldHide);
        if (!shouldHide) {
            setMainDMSessionStartTime(DateUtils.getDBTime());
        }
    }

    return isInSidePanel ? sidePanelSessionStartTime : mainDMSessionStartTime;
}

export default useConciergeSessionStartTime;
