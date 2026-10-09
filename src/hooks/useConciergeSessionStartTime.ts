import {useConciergeSessionState} from '@pages/inbox/ConciergeSessionContext';

import useIsInSidePanel from './useIsInSidePanel';
import useSidePanelState from './useSidePanelState';

/**
 * Returns the Concierge session start time from the context that actually tracks it: SidePanelStateContext in the
 * side panel, ConciergeSessionContext in the main DM. Each is null on the other surface, so always read via this
 * hook. Only meaningful in a Concierge chat - callers gate with e.g. isConciergeHiddenHistory.
 */
function useConciergeSessionStartTime(): string | null {
    const isInSidePanel = useIsInSidePanel();
    const {sessionStartTime: mainDMSessionStartTime} = useConciergeSessionState();
    const {sessionStartTime: sidePanelSessionStartTime} = useSidePanelState();
    return isInSidePanel ? sidePanelSessionStartTime : mainDMSessionStartTime;
}

export default useConciergeSessionStartTime;
