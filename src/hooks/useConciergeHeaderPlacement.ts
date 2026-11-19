import {isConciergePageThread} from '@libs/isInConciergeConversation';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

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

function parentAndTypeSelector(report: OnyxEntry<Report>) {
    return report ? {parentReportID: report.parentReportID, type: report.type} : undefined;
}

/** Where a report header that may show a Concierge conversation sits, which decides the Concierge controls it offers. */
function useConciergeHeaderPlacement(reportID: string | undefined): ConciergeHeaderPlacement {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isInConciergePage = useIsInConciergePage();
    const isInSidePanel = useIsInSidePanel();
    const isConciergeNewChatOnly = useIsConciergeNewChatOnly();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [parentAndType] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: parentAndTypeSelector});
    // Support tickets stay in the Inbox, so they don't get the Concierge page controls
    const isConciergeConversation = (!!conciergeReportID && reportID === conciergeReportID) || isConciergePageThread(parentAndType, conciergeReportID);

    return {
        isInNarrowConciergePage: isInConciergePage && shouldUseNarrowLayout,
        isInConciergeSidePanel: isInSidePanel && isConciergeNewChatOnly && isConciergeConversation,
    };
}

export default useConciergeHeaderPlacement;
