import type {ReportAttributesDerivedValue} from '@src/types/onyx';
import type {ReportAttributes, ReportNamesDerivedValue} from '@src/types/onyx/DerivedValues';

import type {OnyxEntry} from 'react-native-onyx';

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

const reportNameSelector = (attributes: OnyxEntry<ReportAttributesDerivedValue>, reportID: string | undefined) => (reportID ? attributes?.reports?.[reportID]?.reportName : undefined);

const reportIsEmptySelector = (attributes: OnyxEntry<ReportAttributesDerivedValue>, reportID: string | undefined) => (reportID ? attributes?.reports?.[reportID]?.isEmpty : undefined);

const reportNamesSelector = (attributes: OnyxEntry<ReportAttributesDerivedValue>): ReportNamesDerivedValue | undefined => {
    if (!attributes?.reports) {
        return undefined;
    }
    const reportNames: ReportNamesDerivedValue = {};
    for (const [reportID, reportAttributes] of Object.entries(attributes.reports)) {
        reportNames[reportID] = {reportName: reportAttributes.reportName};
    }
    return reportNames;
};

export {reportNameSelector, reportIsEmptySelector, reportNamesSelector};
export default reportByIDsSelector;
