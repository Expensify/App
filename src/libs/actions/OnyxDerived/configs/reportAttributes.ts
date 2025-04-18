import {generateReportName} from '@libs/ReportUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAttributes} from '@src/types/onyx';

/**
 * This derived value is used to get the report attributes for the report.
 * It's dependent on all collections that are used to generate the report attributes under the hood.
 */

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.REPORT_ATTRIBUTES,
    dependencies: [
        ONYXKEYS.COLLECTION.REPORT,
        ONYXKEYS.PERSONAL_DETAILS_LIST,
        ONYXKEYS.COLLECTION.TRANSACTION,
        ONYXKEYS.COLLECTION.REPORT_ACTIONS,
        ONYXKEYS.COLLECTION.POLICY,
        ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
        ONYXKEYS.NVP_PREFERRED_LOCALE,
    ],
    compute: (dependencies, {currentValue, sourceValues}) => {
        const areAllDependenciesSet = dependencies.every((dependency) => dependency !== undefined);
        if (!areAllDependenciesSet) {
            return {};
        }

        const [reports] = dependencies;
        const reportUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT];

        return Object.values(reportUpdates ?? reports ?? {}).reduce<Record<string, ReportAttributes>>((acc, report) => {
            if (!report) {
                return acc;
            }

            acc[report.reportID] = {
                reportName: generateReportName(report),
            };

            return acc;
        }, currentValue ?? {});
    },
});
