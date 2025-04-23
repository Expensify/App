import {generateReportName, isValidReport} from '@libs/ReportUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import hasKeyTriggeredCompute from '@userActions/OnyxDerived/utils';
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
        // transactions are undefined by default so it needs to be set to an empty object as default
        const [reports, preferredLocale, personalDetails, transactions = {}, ...rest] = dependencies;

        const areAllDependenciesSet = [reports, preferredLocale, personalDetails, transactions, ...rest].every((dependency) => dependency !== undefined);
        if (!areAllDependenciesSet) {
            return {
                reports: {},
                locale: null,
            };
        }
        // if any of those keys changed, reset the isFullyComputed flag to recompute all reports
        if (hasKeyTriggeredCompute(ONYXKEYS.NVP_PREFERRED_LOCALE, sourceValues) || hasKeyTriggeredCompute(ONYXKEYS.PERSONAL_DETAILS_LIST, sourceValues)) {
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
