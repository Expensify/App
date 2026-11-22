import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';

import {openReport} from '@libs/actions/Report';

import ONYXKEYS from '@src/ONYXKEYS';

import {guidedSetupAndTourStatusSelector} from '@selectors/Onboarding';
import {useEffect} from 'react';

type UseReportDeepLinkOnOpenParams = {
    reportID: string | undefined;
    isReportLoaded: boolean;
    shouldFetchReport: boolean;

    /** Whether opening the report should mark it as read. False when the page only needs the report's data */
    shouldMarkAsRead?: boolean;

    /** Keeps a manual unread marker untouched. True when the page reads the report's data without showing the chat */
    shouldKeepManualUnreadMarker?: boolean;
};

/**
 * Calls OpenReport for pages that need a report's data when nothing else has loaded it, such as a deep link or a cache reset
 */
function useReportDeepLinkOnOpen({reportID, isReportLoaded, shouldFetchReport, shouldMarkAsRead, shouldKeepManualUnreadMarker}: UseReportDeepLinkOnOpenParams) {
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const [guidedSetupAndTourStatus] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: guidedSetupAndTourStatusSelector});
    const [hasReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {selector: Boolean});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    useEffect(() => {
        if (isReportLoaded || !shouldFetchReport) {
            // If the report is not required or is already loaded, we don't need to call the API
            return;
        }

        openReport({
            reportID,
            introSelected,
            conciergeChat,
            hasReportActions,
            currentUserAccountID,
            isSelfTourViewed: guidedSetupAndTourStatus?.isSelfTourViewed,
            hasCompletedGuidedSetupFlow: guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow,
            shouldMarkAsRead,
            shouldKeepManualUnreadMarker,
        });
        // OpenReport should only fire when the fetch decision or report identity changes; the other args are read at call time.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldFetchReport, isReportLoaded, reportID, currentUserAccountID]);
}

export default useReportDeepLinkOnOpen;
