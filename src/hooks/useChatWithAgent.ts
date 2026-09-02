import {navigateToAndOpenReportWithAccountIDs} from '@libs/actions/Report';

import ONYXKEYS from '@src/ONYXKEYS';

import {guidedSetupAndTourStatusSelector} from '@selectors/Onboarding';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useIsSupportalSession from './useIsSupportalSession';
import useOnyx from './useOnyx';

/**
 * Encapsulates the data fetching and navigation logic for opening a DM chat with an agent.
 * Returns a function that, given an accountID, navigates to the DM report with that agent.
 */
function useChatWithAgent() {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [guidedSetupAndTourStatus] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: guidedSetupAndTourStatusSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const isSupportalSession = useIsSupportalSession();

    const chatWithAgent = (accountID: number) => {
        navigateToAndOpenReportWithAccountIDs({
            participantAccountIDs: [accountID],
            currentUserAccountID: currentUserPersonalDetails.accountID,
            introSelected,
            isSelfTourViewed: guidedSetupAndTourStatus?.isSelfTourViewed,
            hasCompletedGuidedSetupFlow: guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow,
            betas,
            personalDetails,
            conciergeChat,
            isSupportalSession,
        });
    };

    return chatWithAgent;
}

export default useChatWithAgent;
