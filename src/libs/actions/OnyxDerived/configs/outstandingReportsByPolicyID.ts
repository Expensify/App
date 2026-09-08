import {buildOutstandingReportsByPolicyID} from '@libs/ReportUtils';

import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';

import ONYXKEYS from '@src/ONYXKEYS';

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID,
    dependencies: [ONYXKEYS.COLLECTION.REPORT],
    compute: ([reports]) => buildOutstandingReportsByPolicyID(reports),
});
