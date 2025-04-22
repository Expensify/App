import {generateReportName, isValidReport} from '@libs/ReportUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAttributes} from '@src/types/onyx';

let isFullyComputed = false;

/**
 * This derived value is used to get the report attributes for the report.
 * It's dependent on all collections that are used to generate the report attributes under the hood.
 */

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.REPORT_ATTRIBUTES,
    dependencies: [ONYXKEYS.COLLECTION.REPORT],
    compute: (dependencies, {currentValue, sourceValues}) => {
        const areAllDependenciesSet = [...dependencies].every((dependency) => dependency !== undefined);
        if (!areAllDependenciesSet) {
            return {};
        }
        const [reports] = dependencies;
        const reportUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT];
        if ((isFullyComputed && reportUpdates === undefined) || !reports) {
            return currentValue ?? {};
        }

        const dataToIterate = isFullyComputed && reportUpdates !== undefined ? reportUpdates : reports ?? {};
        const attributes = Object.keys(dataToIterate).reduce<Record<string, ReportAttributes>>((acc, reportID) => {
            const report = reports[reportID];
            if (!report || !isValidReport(report)) {
                return acc;
            }

            const reportName = generateReportName(report);
            acc[reportID] = {
                reportName,
            };

            return acc;
        }, currentValue ?? {});

        if (reportUpdates === undefined && Object.keys(reports ?? {}).length > 0 && !isFullyComputed) {
            isFullyComputed = true;
        }

        return attributes;
    },
});
