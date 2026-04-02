import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportsByPolicyIDDerivedValue} from '@src/types/onyx';

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.REPORTS_BY_POLICY_ID,
    dependencies: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.SESSION],
    compute: ([reports, session]) => {
        if (!reports) {
            return {};
        }

        const currentUserAccountID = session?.accountID;

        return Object.entries(reports).reduce<ReportsByPolicyIDDerivedValue>((acc, [reportID, report]) => {
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
