import {generateReportAttributes, generateReportName, isValidReport} from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import hasKeyTriggeredCompute from '@userActions/OnyxDerived/utils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction, ReportAttributesDerivedValue, ReportMetadata} from '@src/types/onyx';

let isFullyComputed = false;

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
        ONYXKEYS.PERSONAL_DETAILS_LIST,
        ONYXKEYS.COLLECTION.TRANSACTION,
        ONYXKEYS.COLLECTION.POLICY,
        ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
        ONYXKEYS.COLLECTION.REPORT_METADATA,
    ],
    compute: ([reports, preferredLocale, transactionViolations, reportActions], {currentValue, sourceValues, areAllConnectionsSet}) => {
        if (!areAllConnectionsSet) {
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
        const reportMetadataUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT_METADATA];
        const reportActionsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT_ACTIONS];

        // if we already computed the report attributes and there is no new reports data, return the current value
        if ((isFullyComputed && !sourceValues) || !reports) {
            return currentValue ?? {reports: {}, locale: null};
        }

        let dataToIterate: Record<string, Report | ReportMetadata | ReportAction | undefined> = reports;
        if (isFullyComputed) {
            if (reportUpdates) {
                dataToIterate = reportUpdates;
            } else if (reportMetadataUpdates) {
                dataToIterate = reportMetadataUpdates;
            } else if (reportActionsUpdates) {
                dataToIterate = reportActionsUpdates;
            }
        }
        const reportAttributes = Object.keys(dataToIterate).reduce<ReportAttributesDerivedValue['reports']>((acc, key) => {
            // source value sends partial data, so we need an entire report object to do computations
            const report =
                reports[
                    `${ONYXKEYS.COLLECTION.REPORT}${key
                        .replace(ONYXKEYS.COLLECTION.REPORT, '')
                        .replace(ONYXKEYS.COLLECTION.REPORT_METADATA, '')
                        .replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '')}`
                ];
            if (!report || !isValidReport(report)) {
                return acc;
            }

            const reportActionsList = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`];
            const {hasAnyViolations, hasErrors, oneTransactionThreadReportID, requiresAttention} = generateReportAttributes({
                report,
                reportActions: reportActionsList,
                transactionViolations,
            });

            let brickRoadStatus;
            // if report has errors or violations, show red dot
            if (SidebarUtils.getReportBrickRoadReason(report, reportActionsList, hasAnyViolations, hasErrors, oneTransactionThreadReportID)) {
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
        if (reportUpdates === undefined && Object.keys(reports ?? {}).length > 0 && !isFullyComputed) {
            isFullyComputed = true;
        }

        return {
            reports: reportAttributes,
            locale: preferredLocale ?? null,
        };
    },
});
