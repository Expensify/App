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
};

/**
 * When accessing certain report-dependant pages (e.g. Task Title) by deeplink, the OpenReport API is not called,
 * So we need to call OpenReport API here to make sure the report data is loaded if it exists on the Server
 */
function useReportDeepLinkOnOpen({reportID, isReportLoaded, shouldFetchReport}: UseReportDeepLinkOnOpenParams) {
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
        });
        // OpenReport should only fire when the fetch decision or report identity changes; the other args are read at call time.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldFetchReport, isReportLoaded, reportID, currentUserAccountID]);
}

export default useReportDeepLinkOnOpen;
