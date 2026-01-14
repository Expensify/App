import type {OnyxEntry} from 'react-native-onyx';
import {computeReportName} from '@libs/ReportNameUtils';
import {generateIsEmptyReport, generateReportAttributes, isArchivedReport, isValidReport} from '@libs/ReportUtils';
import SidebarUtils from '@libs/SidebarUtils';
import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import {hasKeyTriggeredCompute} from '@userActions/OnyxDerived/utils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, ReportAttributesDerivedValue} from '@src/types/onyx';

let isFullyComputed = false;
let previousDisplayNames: Record<string, string | undefined> = {};
let previousPersonalDetails: OnyxEntry<PersonalDetailsList> | undefined;

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

const checkDisplayNamesChanged = (personalDetails: OnyxEntry<PersonalDetailsList>) => {
    if (!personalDetails) {
        return false;
    }

    // Fast path: if reference hasn't changed, display names are definitely the same
    if (previousPersonalDetails === personalDetails) {
        return false;
    }

    const currentDisplayNames = Object.fromEntries(Object.entries(personalDetails).map(([key, value]) => [key, value?.displayName]));

    if (Object.keys(previousDisplayNames).length === 0) {
        previousDisplayNames = currentDisplayNames;
        previousPersonalDetails = personalDetails;
        return Object.keys(currentDisplayNames).length > 0;
    }

    const currentKeys = Object.keys(currentDisplayNames);
    const previousKeys = Object.keys(previousDisplayNames);

    const displayNamesChanged = currentKeys.length !== previousKeys.length || currentKeys.some((key) => currentDisplayNames[key] !== previousDisplayNames[key]);

    previousDisplayNames = currentDisplayNames;
    previousPersonalDetails = personalDetails;

    return displayNamesChanged;
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
        ONYXKEYS.COLLECTION.TRANSACTION,
        ONYXKEYS.PERSONAL_DETAILS_LIST,
        ONYXKEYS.COLLECTION.POLICY,
        ONYXKEYS.COLLECTION.REPORT_METADATA,
    ],
    compute: (
        [reports, preferredLocale, transactionViolations, reportActions, reportNameValuePairs, transactions, personalDetails, policies],
        {currentValue, sourceValues, areAllConnectionsSet},
    ) => {
        if (!areAllConnectionsSet) {
            return {
                reports: {},
                locale: null,
            };
        }

        // Check if display names changed when personal details are updated
        let displayNamesChanged = false;
        if (hasKeyTriggeredCompute(ONYXKEYS.PERSONAL_DETAILS_LIST, sourceValues)) {
            displayNamesChanged = checkDisplayNamesChanged(personalDetails);

            if (!displayNamesChanged) {
                return currentValue ?? {reports: {}, locale: null};
            }
        } else if (!sourceValues) {
            previousDisplayNames = {};
            previousPersonalDetails = undefined;
        }

        // if any of those keys changed, reset the isFullyComputed flag to recompute all reports
        // we need to recompute all report attributes on locale change because the report names are locale dependent
        if (hasKeyTriggeredCompute(ONYXKEYS.NVP_PREFERRED_LOCALE, sourceValues) || displayNamesChanged) {
            isFullyComputed = false;
        }

        // if we already computed the report attributes and there is no new reports data, return the current value
        if ((isFullyComputed && !sourceValues) || !reports) {
            return currentValue ?? {reports: {}, locale: null};
        }

        const reportUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT] ?? {};
        const reportMetadataUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT_METADATA] ?? {};
        const reportActionsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT_ACTIONS] ?? {};
        const reportNameValuePairsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS] ?? {};
        const transactionsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.TRANSACTION];
        const transactionViolationsUpdates = sourceValues?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS];

        let dataToIterate = Object.keys(reports);
        // check if there are any report-related updates

        const reportUpdatesRelatedToReportActions = new Set<string>();

        for (const actions of Object.values(reportActionsUpdates)) {
            if (!actions) {
                continue;
            }

            for (const reportAction of Object.values(actions)) {
                if (reportAction?.childReportID) {
                    reportUpdatesRelatedToReportActions.add(`${ONYXKEYS.COLLECTION.REPORT}${reportAction.childReportID}`);
                }
            }
        }

        const updates = [
            ...Object.keys(reportUpdates),
            ...Object.keys(reportMetadataUpdates),
            ...Object.keys(reportActionsUpdates),
            ...Object.keys(reportNameValuePairsUpdates),
            ...Array.from(reportUpdatesRelatedToReportActions),
        ];

        if (isFullyComputed) {
            // if there are report-related updates, iterate over the updates
            if (updates.length > 0 || !!transactionsUpdates || !!transactionViolationsUpdates) {
                if (updates.length > 0) {
                    dataToIterate = prepareReportKeys(updates);

                    // When an IOU report changes, we need to re-evaluate its parent chat report as well.
                    const parentChatReportIDsToUpdate = new Set<string>();
                    for (const reportKey of dataToIterate) {
                        const report = reports[reportKey];
                        if (report?.chatReportID && report.reportID !== report.chatReportID) {
                            parentChatReportIDsToUpdate.add(`${ONYXKEYS.COLLECTION.REPORT}${report.chatReportID}`);
                        }
                    }
                    if (parentChatReportIDsToUpdate.size > 0) {
                        dataToIterate.push(...Array.from(parentChatReportIDsToUpdate));
                    }
                }
                if (!!transactionsUpdates || !!transactionViolationsUpdates) {
                    let transactionReportIDs: string[] = [];
                    if (transactionsUpdates) {
                        transactionReportIDs = Object.values(transactionsUpdates).map((transaction) => `${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`);
                    }
                    // Also handle transaction violations updates by extracting transaction IDs and finding their reports
                    if (transactionViolationsUpdates) {
                        const violationTransactionIDs = Object.keys(transactionViolationsUpdates).map((key) => key.replace(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, ''));
                        const violationReportIDs = violationTransactionIDs
                            .map((transactionID) => transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]?.reportID)
                            .filter(Boolean)
                            .map((reportID) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

                        // Also include chat reports for expense reports that have violations
                        const chatReportIDs = violationReportIDs
                            .map((reportKey) => reports?.[reportKey]?.chatReportID)
                            .filter(Boolean)
                            .map((chatReportID) => `${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);

                        transactionReportIDs = [...transactionReportIDs, ...violationReportIDs, ...chatReportIDs];
                    }
                    dataToIterate.push(...prepareReportKeys(transactionReportIDs));
                }
            } else {
                // No updates to process, return current value to prevent unnecessary computation
                return currentValue ?? {reports: {}, locale: null};
            }
        }
        const reportAttributes = dataToIterate.reduce<ReportAttributesDerivedValue['reports']>((acc, key) => {
            // source value sends partial data, so we need an entire report object to do computations
            const report = reports[key];

            if (!report || !isValidReport(report)) {
                const reportID = key.replace(ONYXKEYS.COLLECTION.REPORT, '');
                if (acc[reportID]) {
                    delete acc[reportID];
                }
                return acc;
            }

            const chatReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${report.chatReportID}`];
            const reportNameValuePair = reportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`];
            const reportActionsList = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`];
            const isReportArchived = isArchivedReport(reportNameValuePair);
            const {hasAnyViolations, requiresAttention, reportErrors} = generateReportAttributes({
                report,
                chatReport,
                reportActions,
                transactionViolations,
                isReportArchived,
            });

            let brickRoadStatus;
            // if report has errors or violations, show red dot
            if (SidebarUtils.shouldShowRedBrickRoad(report, chatReport, reportActionsList, hasAnyViolations, reportErrors, transactions, transactionViolations, !!isReportArchived)) {
                brickRoadStatus = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
            }
            // if report does not have error, check if it should show green dot
            if (brickRoadStatus !== CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR && requiresAttention) {
                brickRoadStatus = CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
            }

            acc[report.reportID] = {
                reportName: report ? computeReportName(report, reports, policies, transactions, reportNameValuePairs, personalDetails, reportActions) : '',
                isEmpty: generateIsEmptyReport(report, isReportArchived),
                brickRoadStatus,
                requiresAttention,
                reportErrors,
            };

            return acc;
        }, currentValue?.reports ?? {});

        // Propagate errors from IOU reports to their parent chat reports.
        const chatReportIDsWithErrors = new Set<string>();
        for (const report of Object.values(reports)) {
            if (!report?.reportID) {
                continue;
            }

            // If this is an IOU report and its calculated attributes have an error,
            // then we need to mark its parent chat report.
            const attributes = reportAttributes[report.reportID];
            if (report.chatReportID && report.reportID !== report.chatReportID && attributes?.brickRoadStatus === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR) {
                chatReportIDsWithErrors.add(report.chatReportID);
            }
        }

        // Apply the error status to the parent chat reports.
        for (const chatReportID of chatReportIDsWithErrors) {
            if (!reportAttributes[chatReportID]) {
                continue;
            }

            reportAttributes[chatReportID].brickRoadStatus = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
        }

        // mark the report attributes as fully computed after first iteration to avoid unnecessary recomputation on all objects
        if (!Object.keys(reportUpdates).length && Object.keys(reports ?? {}).length > 0 && !isFullyComputed) {
            isFullyComputed = true;
        }

        return {
            reports: reportAttributes,
            locale: preferredLocale ?? null,
        };
    },
});
