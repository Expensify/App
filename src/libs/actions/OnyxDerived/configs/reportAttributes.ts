import {generateReportName, isValidReport} from '@libs/ReportUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAttributes} from '@src/types/onyx';

let isFullyComputed = false;

/**
 * This derived value is used to get the report attributes for the report.
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

        // if we already computed the report attributes and there is no new reports data, return the current value
        if ((isFullyComputed && reportUpdates === undefined) || !reports) {
            return currentValue ?? {};
        }

        const dataToIterate = isFullyComputed && reportUpdates !== undefined ? reportUpdates : reports ?? {};
        const attributes = Object.keys(dataToIterate).reduce<Record<string, ReportAttributes>>((acc, reportID) => {
            // source value sends partial data, so we need an entire report object to do computations
            const report = reports[reportID];

            if (!report || !isValidReport(report)) {
                return acc;
            }

            acc[reportID] = {
                reportName: generateReportName(report),
            };

            return acc;
        }, currentValue ?? {});

        // mark the report attributes as fully computed after first iteration to avoid unnecessary recomputations on all objects
        if (reportUpdates === undefined && Object.keys(reports ?? {}).length > 0 && !isFullyComputed) {
            isFullyComputed = true;
        }

        return attributes;
    },
});
