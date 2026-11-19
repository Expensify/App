import {isConciergeThread} from '@libs/isInConciergeConversation';

import ONYXKEYS from '@src/ONYXKEYS';

import {getReportParentReportID} from '@selectors/Report';

import useIsConciergeNewChatOnly from './useIsConciergeNewChatOnly';
import useIsInConciergePage from './useIsInConciergePage';
import useIsInSidePanel from './useIsInSidePanel';
import useOnyx from './useOnyx';
import useResponsiveLayout from './useResponsiveLayout';

type ConciergeHeaderPlacement = {
    /** The header is on the Concierge page in the narrow layout, where the page shows one screen at a time */
    isInNarrowConciergePage: boolean;

    /** The header shows a Concierge conversation in the side panel, where the Concierge DM only starts new conversations */
    isInConciergeSidePanel: boolean;
};

/** Where a report header that may show a Concierge conversation sits, which decides the Concierge controls it offers. */
function useConciergeHeaderPlacement(reportID: string | undefined): ConciergeHeaderPlacement {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isInConciergePage = useIsInConciergePage();
    const isInSidePanel = useIsInSidePanel();
    const isConciergeNewChatOnly = useIsConciergeNewChatOnly();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [parentReportID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: getReportParentReportID});
    const isConciergeConversation = (!!conciergeReportID && reportID === conciergeReportID) || isConciergeThread({parentReportID}, conciergeReportID);

    return {
        isInNarrowConciergePage: isInConciergePage && shouldUseNarrowLayout,
        isInConciergeSidePanel: isInSidePanel && isConciergeNewChatOnly && isConciergeConversation,
    };
}

export default useConciergeHeaderPlacement;
