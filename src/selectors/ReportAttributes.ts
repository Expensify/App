import type {ReportAttributesDerivedValue} from '@src/types/onyx';
import type {ReportAttributes} from '@src/types/onyx/DerivedValues';

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

export {reportNameSelector};
export default reportByIDsSelector;
