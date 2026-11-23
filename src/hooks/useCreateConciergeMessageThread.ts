import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import {createConciergeMessageThread} from '@userActions/ConciergeThreads';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import {getStableReportSelector} from '@selectors/Report';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useDelegateAccountID from './useDelegateAccountID';
import useOnyx from './useOnyx';
import {usePersonalDetailsByIDs} from './usePersonalDetails';

/** Returns a function that creates a thread on a Concierge message that has none yet, and gives the thread's reportID. */
function useCreateConciergeMessageThread() {
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(conciergeReportID)}`, {selector: getStableReportSelector});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const [participantsPersonalDetails] = usePersonalDetailsByIDs([currentUserAccountID, CONST.ACCOUNT_ID.CONCIERGE]);

    return (message: ReportAction) =>
        createConciergeMessageThread({
            message,
            conciergeReport,
            currentUserAccountID,
            introSelected,
            isSelfTourViewed,
            participantsPersonalDetails,
            delegateAccountID,
        });
}

export default useCreateConciergeMessageThread;
