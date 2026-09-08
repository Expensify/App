import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {useCallback, useState} from 'react';

import useOnyx from './useOnyx';

/**
 * Onboarding screens can be opened from a Concierge task, in which case they are pushed on top of whichever report the
 * user was reading. Closing them has to return the user exactly where they started rather than to a fixed destination,
 * so capture that report on mount and navigate back to it explicitly - goBack() is unreliable from a task link and
 * falls through to Home.
 *
 * Shared by BaseOnboardingPrivateDomain, BaseOnboardingWorkEmail, and BaseOnboardingWorkspaces.
 */
function useReturnToOriginReport() {
    const [originReportID] = useState(() => Navigation.getTopmostReportId());
    const [originReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${originReportID}`);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const originReportType = originReport?.type;
    const originReportParentID = originReport?.parentReportID;

    return useCallback(() => {
        Navigation.dismissModal();
        const returnReportID = originReportType === CONST.REPORT.TYPE.TASK ? originReportParentID : originReportID;
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(returnReportID ?? conciergeReportID));
    }, [originReportParentID, originReportType, originReportID, conciergeReportID]);
}

export default useReturnToOriginReport;
