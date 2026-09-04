import {dismissOnboardingModalBeforeExit} from '@libs/Navigation/helpers/OnboardingNavigationUtils';
import Navigation from '@libs/Navigation/Navigation';

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
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    return useCallback(() => {
        dismissOnboardingModalBeforeExit();
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(originReportID ?? conciergeReportID));
    }, [originReportID, conciergeReportID]);
}

export default useReturnToOriginReport;
