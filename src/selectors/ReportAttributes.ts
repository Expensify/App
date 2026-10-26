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

const reportNamesByIDsSelector = (attributes: OnyxEntry<ReportAttributesDerivedValue>, reportIDs: Array<string | undefined>): ReportNamesDerivedValue => {
    const reportNames: ReportNamesDerivedValue = {};
    for (const reportID of reportIDs) {
        const reportName = reportNameSelector(attributes, reportID);
        if (reportID && reportName !== undefined) {
            reportNames[reportID] = {reportName};
        }
    }
    return reportNames;
};

export {reportNameSelector, reportIsEmptySelector, reportNamesByIDsSelector};
export default reportByIDsSelector;
