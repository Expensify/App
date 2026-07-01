import type {OnyxEntry} from 'react-native-onyx';
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

function getReportAttributeByID(reportAttributes: OnyxEntry<ReportAttributesDerivedValue['reports']>, reportID: string | undefined): ReportAttributes | undefined {
    return reportID ? reportAttributes?.[reportID] : undefined;
}

const reportNameSelector = (attributes: OnyxEntry<ReportAttributesDerivedValue>, reportID: string | undefined) => (reportID ? attributes?.reports?.[reportID]?.reportName : undefined);

export {reportNameSelector, getReportAttributeByID};
export default reportByIDsSelector;
