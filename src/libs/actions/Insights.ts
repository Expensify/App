import {read} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDashboardID} from '@src/types/onyx';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

function getInsights(dashboard: InsightsDashboardID, query: {jsonQuery: string; queryString: string}) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.INSIGHTS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.INSIGHTS}${dashboard}`,
            value: {requestedQuery: query.queryString, errors: null},
        },
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.INSIGHTS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.INSIGHTS}${dashboard}`,
            value: {requestedQuery: null, errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
        },
    ];
    read(READ_COMMANDS.GET_INSIGHTS, {jsonQuery: query.jsonQuery}, {optimisticData, failureData});
}

// eslint-disable-next-line import/prefer-default-export
export {getInsights};
