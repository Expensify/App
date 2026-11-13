import {read} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';

import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * Loads the expense reports an expense can be moved to, so the report picker lists reports that aren't in Onyx yet.
 */
function fetchOutstandingReports(ownerAccountID: number, policyID: string | undefined, offset: number) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.IS_LOADING_OUTSTANDING_REPORTS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_OUTSTANDING_REPORTS,
            value: true,
        },
    ];

    const finallyData: Array<OnyxUpdate<typeof ONYXKEYS.IS_LOADING_OUTSTANDING_REPORTS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_OUTSTANDING_REPORTS,
            value: false,
        },
    ];

    read(READ_COMMANDS.GET_OUTSTANDING_REPORTS, {ownerAccountID, policyID, offset}, {optimisticData, finallyData});
}

// eslint-disable-next-line import/prefer-default-export
export {fetchOutstandingReports};
