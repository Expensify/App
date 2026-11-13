import CONST from '@src/CONST';

import useIsInConciergePage from './useIsInConciergePage';
import useIsInSidePanel from './useIsInSidePanel';
import usePermissions from './usePermissions';

/**
 * Whether the Concierge DM here only starts new conversations and shows the welcome screen instead of its history.
 * That is the case on the Concierge page, and in the side panel with the flat navigation, where every conversation with Concierge is its own thread.
 */
function useIsConciergeNewChatOnly(): boolean {
    const isInConciergePage = useIsInConciergePage();
    const isInSidePanel = useIsInSidePanel();
    const {isBetaEnabled} = usePermissions();
    return isInConciergePage || (isInSidePanel && isBetaEnabled(CONST.BETAS.FLAT_NAV));
}

export default useIsConciergeNewChatOnly;
