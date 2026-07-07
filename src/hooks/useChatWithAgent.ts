import {navigateToAndOpenReportWithAccountIDs} from '@libs/actions/Report';

import ONYXKEYS from '@src/ONYXKEYS';

import {hasSeenTourSelector} from '@selectors/Onboarding';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

/**
 * Encapsulates the data fetching and navigation logic for opening a DM chat with an agent.
 * Returns a function that, given an accountID, navigates to the DM report with that agent.
 * Pass `shouldDismissModal` when the caller lives on the RHP/modal stack (e.g. the add-agent
 * flow) so the modal is dismissed before navigating and the new DM is actually shown.
 */
function useChatWithAgent() {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    const chatWithAgent = (accountID: number, {shouldDismissModal = false}: {shouldDismissModal?: boolean} = {}) => {
        navigateToAndOpenReportWithAccountIDs([accountID], currentUserPersonalDetails.accountID, introSelected, isSelfTourViewed, betas, personalDetails, false, shouldDismissModal);
    };

    return chatWithAgent;
}

export default useChatWithAgent;
