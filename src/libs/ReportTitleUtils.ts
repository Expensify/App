import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import {getTitleReportField, isChat} from './ReportUtils';

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
                [CONST.REPORT_FIELD_TITLE_FIELD_ID]: {
                    defaultValue: policyTitleField.defaultValue,
                    deleteable: policyTitleField.deleteable,
                },
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
                [CONST.REPORT_FIELD_TITLE_FIELD_ID]: null,
            },
        },
    ];

    return optimisticData;
}

/**
 * Check if a report should have its title field updated based on conditions
 * Based on the backend logic: skip if it's a chat, statement card, or if policy field is deleteable and report field is null
 */
function shouldUpdateTitleField(report: Report, policy?: Policy): boolean {
    if (!report || !policy) {
        return false;
    }

    // Skip chat reports
    if (isChat(report)) {
        return false;
    }

    // Skip if report has statement card ID (backend check: !getValue(db, reportID, NVP_STATEMENT_CARD_ID).empty())
    // This would need to be implemented based on how statement card IDs are stored in the frontend
    
    const policyTitleField = getTitleReportField(policy.fieldList ?? {});
    if (!policyTitleField) {
        return false;
    }

    return true;
}

export {updateTitleFieldToMatchPolicy, removeTitleFieldFromReport, shouldUpdateTitleField};