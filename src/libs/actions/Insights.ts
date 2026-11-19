import type {SearchQueryString} from '@components/Search/types';

import {makeRequestWithSideEffects, waitForWrites, write} from '@libs/API';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxKey} from '@src/ONYXKEYS';
import type {InsightsDashboardID, InsightsSearchKey} from '@src/types/onyx';
import type {OnyxData} from '@src/types/onyx/Request';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/** Sends an Insights read command and stores the response's JSON code, so we can tell backend errors apart from requests that got no response */
function requestInsights<TKey extends OnyxKey>(
    command: typeof READ_COMMANDS.GET_INSIGHTS | typeof READ_COMMANDS.GET_INSIGHTS_DETAILS,
    jsonQuery: string,
    key: `${typeof ONYXKEYS.COLLECTION.INSIGHTS | typeof ONYXKEYS.COLLECTION.INSIGHTS_DETAILS}${string}`,
    onyxData: OnyxData<TKey>,
) {
    waitForWrites(command).then(() =>
        // API.read() hides the response code and network rejections, which are needed to tell backend errors from failed requests, same as Search
        makeRequestWithSideEffects(command, {jsonQuery}, onyxData)
            .then((result) => {
                if (typeof result?.jsonCode !== 'number' || result.jsonCode === CONST.JSON_CODE.SUCCESS) {
                    return;
                }
                Onyx.merge(key, {responseJsonCode: result.jsonCode}).catch((error: unknown) => Log.hmmm(`[Insights] failed to store the ${command} response code`, {error: String(error)}));
            })
            .catch((error: unknown) => {
                // A network-level rejection never reaches SaveResponseInOnyx, so failureData has to be applied here
                Log.hmmm(`[Insights] ${command} request failed`, {
                    error: String(error),
                });
                return Onyx.update(onyxData.failureData ?? []);
            }),
    );
}

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

    requestInsights(READ_COMMANDS.GET_INSIGHTS, jsonQuery, key, {optimisticData, successData, failureData});
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
            value: {errors: null, search: {responseJsonCode: null}},
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

export {getInsights, getInsightsDetails, saveInsightsFilters, setInsightsFilters};
