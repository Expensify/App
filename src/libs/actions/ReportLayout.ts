import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import type {SearchCustomColumnIds} from '@components/Search/types';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportLayoutGroupBy, ReportLayoutOption, ReportLayoutSelection} from '@src/types/onyx';

/**
 * Set the user's report layout group-by preference. Pass null to remove it.
 */
function setReportLayoutGroupBy(groupBy: ReportLayoutGroupBy | null, previousValue?: string | null) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_REPORT_LAYOUT_GROUP_BY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_REPORT_LAYOUT_GROUP_BY,
            value: groupBy,
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_REPORT_LAYOUT_GROUP_BY>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_REPORT_LAYOUT_GROUP_BY,
            value: previousValue ?? null,
        },
    ];

    // An empty value removes the NVP on the back-end
    const parameters = {
        name: 'expensify_groupByOption',
        value: groupBy ?? '',
    };

    API.write(WRITE_COMMANDS.SET_NAME_VALUE_PAIR, parameters, {optimisticData, failureData});
}

/**
 * Set the user's report layout option preference. Pass null to remove it, which falls back to the detailed grouped view.
 */
function setReportLayoutOption(layoutOption: ReportLayoutOption | null, previousValue?: string | null) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_REPORT_LAYOUT_OPTION>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_REPORT_LAYOUT_OPTION,
            value: layoutOption,
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_REPORT_LAYOUT_OPTION>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_REPORT_LAYOUT_OPTION,
            value: previousValue ?? null,
        },
    ];

    // An empty value removes the NVP on the back-end
    const parameters = {
        name: 'expensify_layoutOption',
        value: layoutOption ?? '',
    };

    API.write(WRITE_COMMANDS.SET_NAME_VALUE_PAIR, parameters, {optimisticData, failureData});
}

/**
 * Apply a report layout selection from the group-by selector.
 * "None" maps to the matrix layout (a flat, ungrouped list) and clears the group-by field.
 * Category and Tag set the group-by field and clear any matrix layout so the report groups again.
 *
 * Note: this can fire two independent SetNameValuePair calls because App does not expose a plural
 * SetNameValuePairs command yet. Each call has its own failureData rolling back just its own NVP on
 * partial failure, so onyx converges per-key. Plural variant tracked in
 * https://github.com/Expensify/Expensify/issues/645997 so the writes can land atomically.
 */
function setReportLayout(selection: ReportLayoutSelection, currentLayoutOption?: string | null, currentGroupBy?: string | null) {
    if (selection === CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX) {
        setReportLayoutOption(CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX, currentLayoutOption);
        setReportLayoutGroupBy(null, currentGroupBy);
        return;
    }

    setReportLayoutGroupBy(selection, currentGroupBy);
    if (currentLayoutOption === CONST.REPORT_LAYOUT.LAYOUT_OPTION.MATRIX) {
        setReportLayoutOption(null, currentLayoutOption);
    }
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
