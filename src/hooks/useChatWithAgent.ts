import {navigateToAndOpenReportWithAccountIDs} from '@libs/actions/Report';

import ONYXKEYS from '@src/ONYXKEYS';

import {guidedSetupAndTourStatusSelector} from '@selectors/Onboarding';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
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
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    const chatWithAgent = (accountID: number) => {
        navigateToAndOpenReportWithAccountIDs(
            [accountID],
            currentUserPersonalDetails.accountID,
            introSelected,
            guidedSetupAndTourStatus?.isSelfTourViewed,
            guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow,
            betas,
            personalDetails,
        );
    };

    return chatWithAgent;
}

export default useChatWithAgent;
