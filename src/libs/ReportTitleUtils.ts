import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import {getReportNameValuePairs, getTitleReportField, isChatReport} from './ReportUtils';

/**
 * Get the title field from report name value pairs
 */
function getTitleFieldFromRNVP(reportID: string) {
    const reportNameValuePairs = getReportNameValuePairs(reportID);
    return reportNameValuePairs?.[CONST.REPORT.REPORT_TITLE_FIELD];
}

/**
 * Update title field in report's rNVP to match the policy's title field configuration
 * This is the JavaScript equivalent of the backend updateTitleFieldToMatchPolicy function
 */
function updateTitleFieldToMatchPolicy(reportID: string, policy?: Policy): OnyxUpdate[] {
    if (!reportID || !policy) {
        return [];
    }

    // Get the policy's title field configuration
    const policyTitleField = getTitleReportField(policy.fieldList ?? {});

    // Early return if policy doesn't have a title field
    if (!policyTitleField) {
        return [];
    }

    // Create the update to set/update the title field in rNVP
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`,
            value: {
                [CONST.REPORT.REPORT_TITLE_FIELD]: policyTitleField,
            },
        },
    ];

    return optimisticData;
}

function updateTitleFieldWithExactValue(reportID: string, policyTitleField: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`,
            value: {
                [CONST.REPORT.REPORT_TITLE_FIELD]: policyTitleField,
            },
        },
    ];

    return optimisticData;
}

/**
 * Remove title field from report's rNVP when report is manually renamed
 * This indicates the report should preserve its custom name
 */
function removeTitleFieldFromReport(reportID: string): OnyxUpdate[] {
    if (!reportID) {
        return [];
    }

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`,
            value: {
                [CONST.REPORT.REPORT_TITLE_FIELD]: null,
            },
        },
    ];

    return optimisticData;
}

/**
 * Check if a report should have its title field updated based on conditions
 * Based on the backend logic: skip if it's a chat, statement card, or if policy field is deleteable and report field is null
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

    const policyTitleField = getTitleFieldFromRNVP(report.reportID);
    if (!policyTitleField) {
        return false;
    }

    return true;
}

export {removeTitleFieldFromReport, shouldUpdateTitleField, updateTitleFieldToMatchPolicy, getTitleFieldFromRNVP, updateTitleFieldWithExactValue};
