import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import type {SearchCustomColumnIds} from '@components/Search/types';
import * as API from '@libs/API';
import type {SetNameValuePairsParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportLayoutGroupBy, ReportLayoutOption, ReportLayoutSelection} from '@src/types/onyx';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

/**
 * Apply a report layout selection from the group-by selector.
 * "None" maps to the matrix layout (a flat, ungrouped list) and clears the group-by field.
 * Category and Tag set the group-by field and clear any matrix layout so the report groups again.
 *
 * Uses SetNameValuePairs (plural) so the layout-option and group-by writes land atomically on the back-end.
 */
function setReportLayout(selection: ReportLayoutSelection, currentLayoutOption?: string | null, currentGroupBy?: string | null) {
    const isMatrix = selection === CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX;
    const wasMatrix = currentLayoutOption === CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX;

    const nameValuePairs: Record<string, string> = {};
    let nextGroupBy: ReportLayoutGroupBy | null;
    let nextLayoutOption: ReportLayoutOption | null = null;

    if (isMatrix) {
        // None: set layoutOption=matrix, remove groupByOption (empty value deletes the NVP)
        nameValuePairs.expensify_layoutOption = CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX;
        nameValuePairs.expensify_groupByOption = '';
        nextLayoutOption = CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX;
        nextGroupBy = null;
    } else {
        // Category or Tag
        nameValuePairs.expensify_groupByOption = selection;
        nextGroupBy = selection;
        // Leaving matrix: also clear layoutOption so the default detailed layout takes over
        if (wasMatrix) {
            nameValuePairs.expensify_layoutOption = '';
            nextLayoutOption = null;
        }
    }

    const optimisticData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_REPORT_LAYOUT_GROUP_BY,
            value: nextGroupBy,
        },
    ];

    const failureData: AnyOnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_REPORT_LAYOUT_GROUP_BY,
            value: currentGroupBy ?? null,
        },
    ];

    if (isMatrix || wasMatrix) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_REPORT_LAYOUT_OPTION,
            value: nextLayoutOption,
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_REPORT_LAYOUT_OPTION,
            value: currentLayoutOption ?? null,
        });
    }

    const parameters: SetNameValuePairsParams = {};
    for (const [nvpName, nvpValue] of Object.entries(nameValuePairs)) {
        parameters[`nameValuePairs[${nvpName}]`] = nvpValue;
    }

    API.write(WRITE_COMMANDS.SET_NAME_VALUE_PAIRS, parameters, {optimisticData, failureData});
}

/**
 * Get the current group-by preference, defaulting to category
 */
function getReportLayoutGroupBy(storedValue: string | null | undefined): ReportLayoutGroupBy {
    if (!storedValue) {
        return CONST.REPORT_LAYOUT.GROUP_BY.CATEGORY;
    }
    return storedValue as ReportLayoutGroupBy;
}

/**
 * Whether the stored layout option is the flat matrix layout (used as the "None" / ungrouped state in NewDot).
 */
function isMatrixLayout(storedValue: string | null | undefined): boolean {
    return storedValue === CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX;
}

/**
 * Get the current report layout selection from the layout-option and group-by NVPs.
 * Returns matrix when the layout is matrix (None), otherwise the group-by field (category or tag).
 */
function getReportLayoutSelection(storedLayoutOption: string | null | undefined, storedGroupBy: string | null | undefined): ReportLayoutSelection {
    if (isMatrixLayout(storedLayoutOption)) {
        return CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX;
    }
    return getReportLayoutGroupBy(storedGroupBy);
}

/**
 * Set the user's report details columns preference
 */
function setReportDetailsColumns(columns: SearchCustomColumnIds[], previousValue?: string[] | null) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_REPORT_DETAILS_COLUMNS>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_REPORT_DETAILS_COLUMNS,
            value: columns,
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_REPORT_DETAILS_COLUMNS>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_REPORT_DETAILS_COLUMNS,
            value: previousValue ?? null,
        },
    ];

    const parameters = {
        columns: JSON.stringify(columns),
    };

    API.write(WRITE_COMMANDS.SET_REPORT_DETAILS_COLUMNS, parameters, {optimisticData, failureData});
}

export {setReportLayout, getReportLayoutGroupBy, getReportLayoutSelection, isMatrixLayout, setReportDetailsColumns};
