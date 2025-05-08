import {generateReportAttributes, generateReportName, isValidReport} from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import hasKeyTriggeredCompute from '@userActions/OnyxDerived/utils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAttributesDerivedValue} from '@src/types/onyx';

let isFullyComputed = false;
let recentlyUpdated: string[] = [];

const prepareReportKeys = (keys: string[]) => {
    return [
        ...new Set(
            keys.map((key) =>
                key
                    .replace(ONYXKEYS.COLLECTION.REPORT_METADATA, ONYXKEYS.COLLECTION.REPORT)
                    .replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, ONYXKEYS.COLLECTION.REPORT)
                    .replace(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, ONYXKEYS.COLLECTION.REPORT),
            ),
        ),
    ];
};

/**
 * This derived value is used to get the report attributes for the report.
 */

export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.REPORT_ATTRIBUTES,
    dependencies: [
        ONYXKEYS.COLLECTION.REPORT,
        ONYXKEYS.NVP_PREFERRED_LOCALE,
        ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
        ONYXKEYS.COLLECTION.REPORT_ACTIONS,
        ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
        ONYXKEYS.PERSONAL_DETAILS_LIST,
        ONYXKEYS.COLLECTION.TRANSACTION,
        ONYXKEYS.COLLECTION.POLICY,
        ONYXKEYS.COLLECTION.REPORT_METADATA,
    ],
    compute: ([reports, preferredLocale, transactionViolations, reportActions, reportNameValuePairs], {currentValue, sourceValues, areAllConnectionsSet}) => {
        if (!areAllConnectionsSet) {
            return {
                reports: {},
                locale: null,
            };
        }
        // if any of those keys changed, reset the isFullyComputed flag to recompute all reports
        // we need to recompute all report attributes on locale change becuase the report names are locale dependent
        if (hasKeyTriggeredCompute(ONYXKEYS.NVP_PREFERRED_LOCALE, sourceValues)) {
            isFullyComputed = false;
        }

        const reportUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT] ?? {};
        const reportMetadataUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT_METADATA] ?? {};
        const reportActionsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT_ACTIONS] ?? {};
        const reportNameValuePairsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS] ?? {};
        const transactionsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.TRANSACTION];
        const transactionViolationsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS];
        // if we already computed the report attributes and there is no new reports data, return the current value
        if ((isFullyComputed && !sourceValues) || !reports) {
            return currentValue ?? {reports: {}, locale: null};
        }

        let dataToIterate = Object.keys(reports);
        // check if there are any report-related updates
        const updates = [...Object.keys(reportUpdates), ...Object.keys(reportMetadataUpdates), ...Object.keys(reportActionsUpdates), ...Object.keys(reportNameValuePairsUpdates)];

        if (isFullyComputed) {
            // if there are report-related updates, iterate over the updates
            if (updates.length > 0) {
                dataToIterate = prepareReportKeys(updates);
                recentlyUpdated = updates;
            } else if (!!transactionsUpdates || !!transactionViolationsUpdates) {
                // if transactions are updated, they might not be directly related to the reports yet (e.g. transaction is optimistically created)
                // so we use report keys that were updated before to recompute the reports
                const recentReportKeys = prepareReportKeys(recentlyUpdated);
                dataToIterate = recentReportKeys;
            }
        }
        const reportAttributes = dataToIterate.reduce<ReportAttributesDerivedValue['reports']>((acc, key) => {
            // source value sends partial data, so we need an entire report object to do computations
            const report = reports[key];

            if (!report || !isValidReport(report)) {
                return acc;
            }

            const reportActionsList = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`];
            const {hasAnyViolations, requiresAttention, isReportArchived} = generateReportAttributes({
                report,
                reportActions,
                transactionViolations,
                reportNameValuePairs,
            });

            let brickRoadStatus;
            // if report has errors or violations, show red dot
            if (SidebarUtils.shouldShowRedBrickRoad(report, reportActionsList, hasAnyViolations, transactionViolations, !!isReportArchived)) {
                brickRoadStatus = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
            }
            // if report does not have error, check if it should show green dot
            if (brickRoadStatus !== CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR && requiresAttention) {
                brickRoadStatus = CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
            }

            acc[report.reportID] = {
                reportName: generateReportName(report),
                brickRoadStatus,
            };

            return acc;
        }, currentValue?.reports ?? {});
        // mark the report attributes as fully computed after first iteration to avoid unnecessary recomputations on all objects
        if (!Object.keys(reportUpdates).length && Object.keys(reports ?? {}).length > 0 && !isFullyComputed) {
            isFullyComputed = true;
        }

        return {
            reports: reportAttributes,
            locale: preferredLocale ?? null,
        };
    },
});
