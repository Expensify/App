import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

/**
 * This file should only be used in context of optimistic report name updates.
 * We're using direct Onyx connection and this can lead to stale component's state if used in wrong context.
 */
import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import {getTitleReportField} from './ReportUtils';

/**
 * Update title field in report's rNVP to match the policy's title field configuration
 * This is the JavaScript equivalent of the backend updateTitleFieldToMatchPolicy function
 */
function updateTitleFieldToMatchPolicy(reportID: string, policy?: Policy): Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS>> {
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

// eslint-disable-next-line import/prefer-default-export -- Utility file with a single named export; other title helpers may be added here later.
export {updateTitleFieldToMatchPolicy};
