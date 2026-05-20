import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OpenAndSubmittedReportsByPolicyIDDerivedValue} from '@src/types/onyx';

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.OPEN_AND_SUBMITTED_REPORTS_BY_POLICY_ID,
    dependencies: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.SESSION],
    compute: ([reports, session]) => {
        if (!reports) {
            return {};
        }

        const currentUserAccountID = session?.accountID;

        return Object.entries(reports).reduce<OpenAndSubmittedReportsByPolicyIDDerivedValue>((acc, [reportID, report]) => {
            if (!report) {
                return acc;
            }

            // Get all reports, which are the ones that are:
            // - Owned by the current user
            // - Are either open or submitted
            // - Belong to a workspace
            if (report.policyID && report.ownerAccountID === currentUserAccountID && (report.stateNum ?? 0) <= 1) {
                if (!acc[report.policyID]) {
                    acc[report.policyID] = {};
                }

                acc[report.policyID] = {
                    ...acc[report.policyID],
                    [reportID]: report,
                };
            }

            return acc;
        }, {});
    },
});
