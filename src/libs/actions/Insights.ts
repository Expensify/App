import type {SearchQueryString} from '@components/Search/types';

import {makeRequestWithSideEffects, waitForWrites, write} from '@libs/API';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {getCachedInsightsExplanation} from '@libs/InsightsExplanationUtils';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDashboardID, InsightsSearchKey} from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

// Remounts and early clicks share generation, but completed answers stay only in the evictable Onyx cache.
const pendingExplanations = new Map<string, Promise<string | undefined>>();

function getInsights(dashboard: InsightsDashboardID, hash: number, jsonQuery: string, snapshotHashes: number[], queryType: SearchDataTypes) {
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

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SNAPSHOT>> = snapshotHashes.map((snapshotHash) => ({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}`,
        value: {
            search: {state: CONST.SEARCH.SNAPSHOT_STATE.LOADED, type: queryType, hash: snapshotHash},
        },
    }));

    waitForWrites(READ_COMMANDS.GET_INSIGHTS).then(() =>
        // API.read() hides the response code and network rejections, which are needed to tell backend errors from failed requests, same as Search
        makeRequestWithSideEffects(READ_COMMANDS.GET_INSIGHTS, {jsonQuery}, {optimisticData, successData, failureData})
            .then((result) => {
                if (typeof result?.jsonCode !== 'number' || result.jsonCode === CONST.JSON_CODE.SUCCESS) {
                    return;
                }
                Onyx.merge(key, {responseJsonCode: result.jsonCode}).catch((error: unknown) => Log.hmmm('[Insights] failed to store the GetInsights response code', {error: String(error)}));
            })
            .catch((error: unknown) => {
                // A network-level rejection never reaches SaveResponseInOnyx, so failureData has to be applied here
                Log.hmmm('[Insights] GetInsights request failed', {
                    error: String(error),
                });
                return Onyx.update(failureData);
            }),
    );
}

function setInsightsFilters(searchKey: InsightsSearchKey, query: SearchQueryString) {
    Onyx.merge(ONYXKEYS.SEARCH_FILTERS, {[searchKey]: {query}});
}

/** Stores the dashboard's filters locally and on the server, for changes that don't trigger a GetInsights call to save them */
function saveInsightsFilters(searchKey: InsightsSearchKey, query: SearchQueryString) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.SEARCH_FILTERS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.SEARCH_FILTERS,
            value: {[searchKey]: {query}},
        },
    ];

    write(WRITE_COMMANDS.SAVE_SEARCH_FILTERS, {jsonQuery: JSON.stringify({searchKey, inputQuery: query})}, {optimisticData});
}

function preloadInsightsExplanation(jsonQuery: string, hash: number): Promise<string | undefined> {
    const pending = pendingExplanations.get(jsonQuery);
    if (pending) {
        return pending;
    }
    const request = waitForWrites(READ_COMMANDS.GET_INSIGHTS_EXPLANATION)
        // The click needs the same response as the preload, rather than starting another generation.
        .then(() =>
            makeRequestWithSideEffects<typeof READ_COMMANDS.GET_INSIGHTS_EXPLANATION, `${typeof ONYXKEYS.COLLECTION.INSIGHTS_EXPLANATION}${string}`>(READ_COMMANDS.GET_INSIGHTS_EXPLANATION, {
                jsonQuery,
                hash,
            }),
        )
        .then((result) => {
            if (result?.jsonCode !== CONST.JSON_CODE.SUCCESS) {
                return undefined;
            }
            const update = result.onyxData?.find((item) => item.key === `${ONYXKEYS.COLLECTION.INSIGHTS_EXPLANATION}${hash}`);
            const entry = update?.onyxMethod === Onyx.METHOD.SET ? update.value : undefined;
            if (!entry?.jsonQuery || !entry.response || !entry.createdAt) {
                return undefined;
            }
            return getCachedInsightsExplanation({jsonQuery: entry.jsonQuery, response: entry.response, createdAt: entry.createdAt}, jsonQuery);
        })
        .catch((error: unknown) => {
            Log.hmmm('[Insights] explanation preload failed', {error: String(error)});
            return undefined;
        })
        .finally(() => pendingExplanations.delete(jsonQuery));
    pendingExplanations.set(jsonQuery, request);
    return request;
}

export {getInsights, preloadInsightsExplanation, saveInsightsFilters, setInsightsFilters};
