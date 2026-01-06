/**
 * This file should only be used in context of optimistic report name updates.
 * We're using direct Onyx connection and this can lead to stale component's state if used in wrong context.
 */
import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, BetaConfiguration, Policy, Report, ReportNameValuePairs} from '@src/types/onyx';
import Permissions from './Permissions';
import {getTitleReportField, isChatReport} from './ReportUtils';

let allReportNameValuePairs: Record<string, ReportNameValuePairs> = {};
let betas: Beta[] = [];
let betaConfiguration: BetaConfiguration = {};

/**
 * We use Onyx.connectWithoutView because we do not use this in React components and this logic is not tied directly to the UI.
 * We need up to date report name value pairs of reports to correctly determine if further updates to report's titles should be made.
 * It wouldn't be possible without connection directly to Onyx.
 */
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
    waitForCollectionCallback: true,
    callback: (val) => {
        allReportNameValuePairs = (val as Record<string, ReportNameValuePairs>) ?? {};
    },
});
Onyx.connectWithoutView({
    key: ONYXKEYS.BETAS,
    callback: (val) => {
        betas = val ?? [];
    },
});
Onyx.connectWithoutView({
    key: ONYXKEYS.BETA_CONFIGURATION,
    callback: (val) => {
        betaConfiguration = val ?? {};
    },
});

/**
 * Get the title field from report name value pairs
 */
function getTitleFieldFromRNVP(reportID: string) {
    const reportNameValuePairs = allReportNameValuePairs[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`];
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return reportNameValuePairs?.expensify_text_title;
}

/**
 * Update title field in report's rNVP to match the policy's title field configuration
 * This is the JavaScript equivalent of the backend updateTitleFieldToMatchPolicy function
 */
function updateTitleFieldToMatchPolicy(reportID: string, policy?: Policy): OnyxUpdate[] {
    if (!Permissions.isBetaEnabled(CONST.BETAS.CUSTOM_REPORT_NAMES, betas, betaConfiguration)) {
        return [];
    }
    if (!reportID || !policy) {
        return [];
    }

    // Get the policy's title field configuration
    const reportTitleField = getTitleReportField(policy.fieldList ?? {});

    // Early return if policy doesn't have a title field
    if (!reportTitleField) {
        return [];
    }

    // Create the update to set/update the title field in rNVP
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`,
            value: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                expensify_text_title: reportTitleField,
            },
        },
    ];

    return optimisticData;
}

/**
 * Remove title field from report's rNVP when report is manually renamed to indicate that the manual name should be preserved, and the custom report name formula should no longer update the name.
 */
function removeTitleFieldFromReport(reportID: string): OnyxUpdate[] {
    if (!Permissions.isBetaEnabled(CONST.BETAS.CUSTOM_REPORT_NAMES, betas, betaConfiguration)) {
        return [];
    }
    if (!reportID) {
        return [];
    }

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`,
            value: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                expensify_text_title: null,
            },
        },
    ];

    return optimisticData;
}

/**
 * Check if a report should have its title field updated based on conditions
 */
function shouldUpdateTitleField(report: Report): boolean {
    // todo: this should be more sophisticated function. check for iou etc
    if (!report) {
        return false;
    }
    // Skip chat reports
    if (isChatReport(report)) {
        return false;
    }

    // Skip if report has statement card ID (backend check: !getValue(db, reportID, NVP_STATEMENT_CARD_ID).empty())
    // This would need to be implemented based on how statement card IDs are stored in the frontend

    const reportTitleField = getTitleFieldFromRNVP(report.reportID);
    if (!reportTitleField) {
        return false;
    }

    return true;
}

export {getTitleFieldFromRNVP, removeTitleFieldFromReport, shouldUpdateTitleField, updateTitleFieldToMatchPolicy};
