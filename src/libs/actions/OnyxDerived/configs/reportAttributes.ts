import {generateReportName, isEmptyReport, isValidReport} from '@libs/ReportUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAttributesDerivedValue} from '@src/types/onyx';

let isFullyComputed = false;

/**
 * This derived value is used to get the report attributes for the report.
 */

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.REPORT_ATTRIBUTES,
    dependencies: [
        ONYXKEYS.COLLECTION.REPORT,
        ONYXKEYS.NVP_PREFERRED_LOCALE,
        ONYXKEYS.PERSONAL_DETAILS_LIST,
        ONYXKEYS.COLLECTION.TRANSACTION,
        ONYXKEYS.COLLECTION.REPORT_ACTIONS,
        ONYXKEYS.COLLECTION.POLICY,
        ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
    ],
    compute: (dependencies, {currentValue, sourceValues}) => {
        const areAllDependenciesSet = [...dependencies].every((dependency) => dependency !== undefined);
        if (!areAllDependenciesSet) {
            return {
                reports: {},
                locale: null,
            };
        }
        const [reports, preferredLocale] = dependencies;

        // if the preferred locale has changed, reset the isFullyComputed flag
        if (preferredLocale !== currentValue?.locale) {
            isFullyComputed = false;
        }

        const reportUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT];

        // if we already computed the report attributes and there is no new reports data, return the current value
        if ((isFullyComputed && reportUpdates === undefined) || !reports) {
            return currentValue ?? {reports: {}, locale: null};
        }

        const dataToIterate = isFullyComputed && reportUpdates !== undefined ? reportUpdates : reports ?? {};
        const reportAttributes = Object.keys(dataToIterate).reduce<ReportAttributesDerivedValue['reports']>((acc, reportID) => {
            // source value sends partial data, so we need an entire report object to do computations
            const report = reports[reportID];

            if (!report || !isValidReport(report)) {
                return acc;
            }

            acc[report.reportID] = {
                reportName: generateReportName(report),
                isEmpty: isEmptyReport(report),
            };

            return acc;
        }, currentValue?.reports ?? {});

        // mark the report attributes as fully computed after first iteration to avoid unnecessary recomputations on all objects
        if (reportUpdates === undefined && Object.keys(reports ?? {}).length > 0 && !isFullyComputed) {
            isFullyComputed = true;
        }

        return {
            reports: reportAttributes,
            locale: preferredLocale ?? null,
        };
    },
});
