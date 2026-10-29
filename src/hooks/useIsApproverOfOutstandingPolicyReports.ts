import {isApproverOfOutstandingPolicyReports} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';
import usePrivateIsArchivedMap from './usePrivateIsArchivedMap';

/**
 * Whether the current user is the approver of any report in the workspace that is waiting for their approval,
 * including the ones they were assigned to through "Change approver".
 */
function useIsApproverOfOutstandingPolicyReports(policyID: string | undefined): boolean {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    // Subscribing without a selector keeps the change detection a reference compare, and the reports are reduced to a boolean below.
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
    const privateIsArchivedMap = usePrivateIsArchivedMap();

    return isApproverOfOutstandingPolicyReports(currentUserPersonalDetails.accountID, outstandingReportsByPolicyID?.[policyID ?? CONST.DEFAULT_NUMBER_ID], privateIsArchivedMap);
}

export default useIsApproverOfOutstandingPolicyReports;
