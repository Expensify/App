import {openReport} from '@userActions/Report';
import type {OpenReportActionParams} from '@userActions/Report';

import ONYXKEYS from '@src/ONYXKEYS';

import {guidedSetupAndTourStatusSelector} from '@selectors/Onboarding';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

/** The openReport params this hook reads itself, so callers only pass what is specific to the report being opened */
type SharedOpenReportParams = 'introSelected' | 'conciergeChat' | 'currentUserAccountID' | 'isSelfTourViewed' | 'hasCompletedGuidedSetupFlow';

type UseOpenReportParams = Omit<OpenReportActionParams, SharedOpenReportParams>;

/**
 * Returns a function that calls openReport with the current user's onboarding and Concierge context already filled in.
 * Use it to (re)fetch a report from outside the report screen, e.g. after a flow changes server-owned report fields.
 */
function useOpenReport() {
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const [guidedSetupAndTourStatus] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: guidedSetupAndTourStatusSelector});

    return (params: UseOpenReportParams) => {
        openReport({
            ...params,
            introSelected,
            conciergeChat,
            currentUserAccountID,
            isSelfTourViewed: guidedSetupAndTourStatus?.isSelfTourViewed,
            hasCompletedGuidedSetupFlow: guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow,
        });
    };
}

export default useOpenReport;
export type {UseOpenReportParams};
