import type {OnyxEntry} from 'react-native-onyx';
import type {ReportAttributesDerivedValue} from '@src/types/onyx';
import type {ReportAttributes} from '@src/types/onyx/DerivedValues';

const reportsSelector = (attributes: OnyxEntry<ReportAttributesDerivedValue>) => attributes?.reports;

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

export {reportByIDsSelector};
export default reportsSelector;
