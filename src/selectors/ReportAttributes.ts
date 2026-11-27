import type {ReportAttributesDerivedValue} from '@src/types/onyx';
import type {ReportNamesDerivedValue} from '@src/types/onyx/DerivedValues';

import type {OnyxEntry} from 'react-native-onyx';

const reportNameSelector = (attributes: OnyxEntry<ReportAttributesDerivedValue>, reportID: string | undefined) => (reportID ? attributes?.reports?.[reportID]?.reportName : undefined);

const reportIsEmptySelector = (attributes: OnyxEntry<ReportAttributesDerivedValue>, reportID: string | undefined) => (reportID ? attributes?.reports?.[reportID]?.isEmpty : undefined);

const reportNamesByIDsSelector = (attributes: OnyxEntry<ReportAttributesDerivedValue>, reportIDs: Array<string | undefined>): ReportNamesDerivedValue => {
    const reportNames: ReportNamesDerivedValue = {};
    for (const reportID of reportIDs) {
        const reportAttributes = reportID ? attributes?.reports?.[reportID] : undefined;
        if (reportID && reportAttributes?.reportName !== undefined) {
            reportNames[reportID] = {reportName: reportAttributes.reportName, rawReportName: reportAttributes.rawReportName};
        }
    }
    return reportNames;
};

export {reportNameSelector, reportIsEmptySelector, reportNamesByIDsSelector};
