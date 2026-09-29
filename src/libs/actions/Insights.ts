import {makeRequestWithSideEffects, waitForWrites} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDashboardID, InsightsSearchKey} from '@src/types/onyx';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

function getInsights(dashboard: InsightsDashboardID, hash: number, jsonQuery: string, snapshotHashes: number[]) {
    const key = `${ONYXKEYS.COLLECTION.INSIGHTS}${dashboard}_${hash}` as const;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.INSIGHTS | typeof ONYXKEYS.COLLECTION.SNAPSHOT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key,
            value: {
                errors: null,
                responseJsonCode: null,
            },
        },
        ...snapshotHashes.map<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SNAPSHOT>>((snapshotHash) => ({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}`,
            value: {
                errors: null,
                search: {responseJsonCode: null},
            },
        })),
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.INSIGHTS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key,
            value: {
                // NO_RESPONSE stands for no server answer, a real error code from the response overwrites it
                responseJsonCode: CONST.JSON_CODE.NO_RESPONSE,
                errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
            },
        },
    ];

    waitForWrites(READ_COMMANDS.GET_INSIGHTS).then(() =>
        makeRequestWithSideEffects(READ_COMMANDS.GET_INSIGHTS, {jsonQuery}, {optimisticData, failureData}).then((result) => {
            if (typeof result?.jsonCode !== 'number' || result.jsonCode === CONST.JSON_CODE.SUCCESS) {
                return;
            }
            Onyx.merge(key, {responseJsonCode: result.jsonCode}).catch((error: unknown) => Log.hmmm('[Insights] failed to store the GetInsights response code', {error: String(error)}));
        }),
    );
}

function setInsightsFilters(searchKey: InsightsSearchKey, query: string) {
    Onyx.merge(ONYXKEYS.SEARCH_FILTERS, {[searchKey]: {query}});
}

export {getInsights, setInsightsFilters};
