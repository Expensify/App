import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportLayoutGroupBy} from '@src/types/onyx';

/**
 * Set the user's report layout group-by preference
 */
function setReportLayoutGroupBy(groupBy: ReportLayoutGroupBy, previousValue?: string | null) {
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

    const parameters = {
        name: 'expensify_groupByOption',
        value: groupBy,
    };

    API.write(WRITE_COMMANDS.SET_NAME_VALUE_PAIR, parameters, {optimisticData, failureData});
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

export {setReportLayoutGroupBy, getReportLayoutGroupBy};
