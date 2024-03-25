import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type {EmptyObject} from '@src/types/utils/EmptyObject';

let allReports: OnyxCollection<Report>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => (allReports = value),
});

/**
 * Get the report given a reportID
 */
function getReport(reportID: string | undefined): OnyxEntry<Report> | EmptyObject {
    if (!allReports) {
        return {};
    }

    return allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] ?? {};
}

/**
 * Get the report policyID given a reportID.
 * We need to define this method in a separate file to avoid cyclic dependency.
 */
function getReportPolicyID(reportID?: string): string | undefined {
    return getReport(reportID)?.policyID;
}

export default getReportPolicyID;
