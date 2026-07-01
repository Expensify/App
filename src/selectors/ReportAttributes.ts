import type {OnyxEntry} from 'react-native-onyx';
import type {ReportNamesByID} from '@libs/ReportAttributesUtils';
import type {ReportAttributesDerivedValue} from '@src/types/onyx';
import type {ReportAttributes} from '@src/types/onyx/DerivedValues';

const reportByIDsSelector = (reportIDs: string[]) => (attributes: OnyxEntry<ReportAttributesDerivedValue>) =>
    reportIDs.reduce(
        (acc, reportID) => {
            const reportAttributes = attributes?.reports?.[reportID];
            if (reportAttributes) {
                acc[reportID] = reportAttributes;
            }
            return acc;
        },
        {} as Record<string, ReportAttributes>,
    );

/**
 * Builds a selector that narrows REPORT_ATTRIBUTES down to just the `reportName` of the given reportIDs.
 */
const reportNamesByReportIDsSelector =
    (reportIDs: Array<string | undefined>) =>
    (attributes: OnyxEntry<ReportAttributesDerivedValue>): ReportNamesByID =>
        reportIDs.reduce<ReportNamesByID>((acc, reportID) => {
            const reportName = reportID ? attributes?.reports?.[reportID]?.reportName : undefined;
            // Only add an entry when the attributes actually exist, so callers keep falling back to `report.reportName`.
            if (reportID && reportName !== undefined) {
                acc[reportID] = {reportName};
            }
            return acc;
        }, {});

function getReportAttributeByID(reportAttributes: OnyxEntry<ReportAttributesDerivedValue['reports']>, reportID: string | undefined): ReportAttributes | undefined {
    return reportID ? reportAttributes?.[reportID] : undefined;
}

const reportNameSelector = (attributes: OnyxEntry<ReportAttributesDerivedValue>, reportID: string | undefined) => (reportID ? attributes?.reports?.[reportID]?.reportName : undefined);

export {getReportAttributeByID, reportNameSelector, reportNamesByReportIDsSelector};
export default reportByIDsSelector;
