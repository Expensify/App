import {read} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDashboardID, InsightsSearchKey} from '@src/types/onyx';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

function getInsights(dashboard: InsightsDashboardID, hash: number, jsonQuery: string) {
    const key = `${ONYXKEYS.COLLECTION.INSIGHTS}${dashboard}_${hash}` as const;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.INSIGHTS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key,
            value: {
                errors: null,
            },
        },
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.INSIGHTS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key,
            value: {
                errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
            },
        },
    ];

    read(READ_COMMANDS.GET_INSIGHTS, {jsonQuery}, {optimisticData, failureData});
}

function setInsightsFilters(searchKey: InsightsSearchKey, query: string) {
    Onyx.merge(ONYXKEYS.SEARCH_FILTERS, {[searchKey]: {query}});
}

export {getInsights, setInsightsFilters};
