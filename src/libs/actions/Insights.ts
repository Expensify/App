import type {SearchQueryString} from '@components/Search/types';

import {makeRequestWithSideEffects, waitForWrites} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Log from '@libs/Log';
import {isRecord} from '@libs/ObjectUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxKey} from '@src/ONYXKEYS';
import type {InsightsDashboardID, InsightsSearchKey} from '@src/types/onyx';
import type {InsightsTagLevel} from '@src/types/onyx/InsightsDashboard';
import type {OnyxData} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

// The last GetInsights request sent for each dashboard key, so a slower, older response can't replace the tag levels a newer one stored
const latestTagLevelsRequestIDs = new Map<string, string>();

// Remounts share generation, but completed answers stay only in the evictable Onyx cache.
const pendingExplanations = new Map<string, Promise<void>>();

/**
 * Sends an Insights read command and stores the response's JSON code, which distinguishes backend errors from requests that got no response
 * @returns the response when the backend answered successfully, otherwise undefined
 */
function requestInsights<TKey extends OnyxKey>(
    command: typeof READ_COMMANDS.GET_INSIGHTS | typeof READ_COMMANDS.GET_INSIGHTS_DETAILS,
    jsonQuery: string,
    key: `${typeof ONYXKEYS.COLLECTION.INSIGHTS | typeof ONYXKEYS.COLLECTION.INSIGHTS_DETAILS}${string}`,
    onyxData: OnyxData<TKey>,
): Promise<Response<TKey> | undefined> {
    return waitForWrites(command).then(() =>
        // API.read() hides the response code and network rejections, which are needed to tell backend errors from failed requests, same as Search
        makeRequestWithSideEffects(command, {jsonQuery}, onyxData)
            .then((result) => {
                if (!result || result.jsonCode === CONST.JSON_CODE.SUCCESS) {
                    return result ?? undefined;
                }
                if (typeof result.jsonCode === 'number') {
                    Onyx.merge(key, {responseJsonCode: result.jsonCode}).catch((error: unknown) =>
                        Log.hmmm(`[Insights] failed to store the ${command} response code`, {error: String(error)}),
                    );
                }
                return undefined;
            })
            .catch((error: unknown) => {
                // A network-level rejection never reaches SaveResponseInOnyx, so failureData has to be applied here
                Log.hmmm(`[Insights] ${command} request failed`, {
                    error: String(error),
                });
                return Onyx.update(onyxData.failureData ?? []).then(() => undefined);
            }),
    );
}

function isInsightsTagLevelList(value: unknown): value is InsightsTagLevel[] {
    return (
        Array.isArray(value) &&
        value.every((entry: unknown) => isRecord(entry) && typeof entry.level === 'number' && Array.isArray(entry.names) && entry.names.every((name: unknown) => typeof name === 'string'))
    );
}

/** Reads the tag levels GetInsights listed for the dashboard out of its response, rather than out of Onyx, where an older response can overwrite them before its request ID lands. */
function getResponseTagLevels<TKey extends OnyxKey>(response: Response<TKey>, key: string): InsightsTagLevel[] | undefined {
    for (const update of response.onyxData ?? []) {
        const value: unknown = update.value;
        if (update.key === key && isRecord(value) && isInsightsTagLevelList(value.tagLevels)) {
            return value.tagLevels;
        }
    }
    return undefined;
}

/**
 * @param requestID - Identifies this request, stored with its tag levels once it succeeds so the dashboard can tell its own response from one stored earlier
 */
function getInsights(dashboard: InsightsDashboardID, hash: number, jsonQuery: string, snapshotHashes: number[], queryType: SearchDataTypes, requestID: string) {
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
                search: {responseJsonCode: null, errorTranslationKey: null},
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

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.INSIGHTS | typeof ONYXKEYS.COLLECTION.SNAPSHOT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key,
            value: {requestedAt: Date.now()},
        },
        ...snapshotHashes.map<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SNAPSHOT>>((snapshotHash) => ({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${snapshotHash}`,
            value: {
                search: {state: CONST.SEARCH.SNAPSHOT_STATE.LOADED, type: queryType, hash: snapshotHash},
            },
        })),
    ];

    const responseTagLevelsKey = `${ONYXKEYS.COLLECTION.RAM_ONLY_INSIGHTS_RESPONSE_TAG_LEVELS}${dashboard}_${hash}` as const;
    latestTagLevelsRequestIDs.set(responseTagLevelsKey, requestID);
    requestInsights(READ_COMMANDS.GET_INSIGHTS, jsonQuery, key, {optimisticData, successData, failureData}).then((response) => {
        if (!response || latestTagLevelsRequestIDs.get(responseTagLevelsKey) !== requestID) {
            return;
        }
        latestTagLevelsRequestIDs.delete(responseTagLevelsKey);
        // The request ID and its levels are written together, so the dashboard never pairs this request's ID with levels from another response for the same filters
        Onyx.set(responseTagLevelsKey, {requestID, tagLevels: getResponseTagLevels(response, key)}).catch((error: unknown) =>
            Log.hmmm('[Insights] failed to store the GetInsights tag levels', {error: String(error)}),
        );
    });
}

/** Fetches the Details panel's sections and fills the snapshot with its Top expenses */
function getInsightsDetails(hash: number, jsonQuery: string, topExpensesSnapshotHash: number) {
    const key = `${ONYXKEYS.COLLECTION.INSIGHTS_DETAILS}${hash}` as const;
    const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${topExpensesSnapshotHash}` as const;
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.INSIGHTS_DETAILS | typeof ONYXKEYS.COLLECTION.SNAPSHOT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key,
            value: {errors: null, responseJsonCode: null},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: snapshotKey,
            value: {errors: null, search: {responseJsonCode: null, errorTranslationKey: null}},
        },
    ];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SNAPSHOT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: snapshotKey,
            value: {
                search: {state: CONST.SEARCH.SNAPSHOT_STATE.LOADED, type: CONST.SEARCH.DATA_TYPES.EXPENSE, hash: topExpensesSnapshotHash},
            },
        },
    ];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.INSIGHTS_DETAILS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key,
            value: {
                responseJsonCode: CONST.JSON_CODE.NO_RESPONSE,
                errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
            },
        },
    ];

    requestInsights(READ_COMMANDS.GET_INSIGHTS_DETAILS, jsonQuery, key, {optimisticData, successData, failureData});
}

function setInsightsFilters(searchKey: InsightsSearchKey, query: SearchQueryString) {
    Onyx.merge(ONYXKEYS.SEARCH_FILTERS, {[searchKey]: {query}});
}

function preloadInsightsExplanation(jsonQuery: string, hash: number): Promise<void> {
    const pending = pendingExplanations.get(jsonQuery);
    if (pending) {
        return pending;
    }
    const request = waitForWrites(READ_COMMANDS.GET_INSIGHTS_EXPLANATION)
        .then(async () => {
            await makeRequestWithSideEffects(READ_COMMANDS.GET_INSIGHTS_EXPLANATION, {jsonQuery, hash});
        })
        .catch((error: unknown) => {
            Log.hmmm('[Insights] explanation preload failed', {error: String(error)});
        })
        .finally(() => pendingExplanations.delete(jsonQuery));
    pendingExplanations.set(jsonQuery, request);
    return request;
}

export {getInsights, getInsightsDetails, preloadInsightsExplanation, setInsightsFilters};
