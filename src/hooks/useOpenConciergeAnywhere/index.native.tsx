import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByIDs} from '@hooks/usePersonalDetails';

import {navigateToConciergeChat} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {hasSeenTourSelector} from '@selectors/Onboarding';

/**
 * Returns a callback that navigates to the Concierge chat on native (opens the side panel on web instead),
 * and a flag indicating that the concierge is not opened in the side panel.
 */
function useOpenConciergeAnywhere() {
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [conciergePersonalDetails] = usePersonalDetailsByIDs([CONST.ACCOUNT_ID.CONCIERGE]);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const openConciergeAnywhere = (_options?: {forceConcierge?: boolean; reportID?: string}) => {
        navigateToConciergeChat({conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas, personalDetails: conciergePersonalDetails});
    };

    return {openConciergeAnywhere, isInSidePanel: false};
}

export default useOpenConciergeAnywhere;
