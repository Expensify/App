import {openReport} from '@userActions/Report';
import type {OpenReportActionParams} from '@userActions/Report';

import ONYXKEYS from '@src/ONYXKEYS';

import {guidedSetupAndTourStatusSelector} from '@selectors/Onboarding';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

/** Params this hook fills in itself */
type SharedOpenReportParams = 'introSelected' | 'conciergeChat' | 'currentUserAccountID' | 'isSelfTourViewed' | 'hasCompletedGuidedSetupFlow';

type UseOpenReportParams = Omit<OpenReportActionParams, SharedOpenReportParams>;

/** Returns openReport with the current user's context already filled in */
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
