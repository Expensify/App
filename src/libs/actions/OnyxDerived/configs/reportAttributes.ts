import {generateReportName} from '@libs/ReportUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAttributes} from '@src/types/onyx';

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.REPORT_ATTRIBUTES,
    dependencies: [ONYXKEYS.COLLECTION.REPORT],
    compute: ([reports], {currentValue, sourceValues}) => {
        const reportUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT];
        if (!reports) {
            return {};
        }

        return Object.values(reports).reduce<Record<string, ReportAttributes>>(
            (acc, report) => {
                if (!report) {
                    return acc;
                }

                acc[report.reportID] = {
                    reportName: generateReportName(report),
                };

                return acc;
            },
            reportUpdates && currentValue ? currentValue : {},
        );
    },
});
