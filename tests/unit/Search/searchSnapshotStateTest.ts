import {search} from '@libs/actions/Search';
import {makeRequestWithSideEffects, waitForWrites} from '@libs/API';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {isSearchDataLoaded} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../../utils/getOnyxValue';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/API', () => ({
    makeRequestWithSideEffects: jest.fn(),
    waitForWrites: jest.fn(),
    write: jest.fn(),
    read: jest.fn(),
}));

// A jsonCode that is not 200, so the request resolves down the failure branch of applyHTTPSOnyxUpdates.
const FAILURE_JSON_CODE = 500;

function getQueryJSON() {
    const queryJSON = buildSearchQueryJSON('');
    if (!queryJSON) {
        throw new Error('Query JSON should be defined for test setup');
    }

    return queryJSON;
}

/** Read the {optimisticData, successData, failureData, finallyData} that search() handed to the API layer. */
function getCapturedSearchOnyxData(): NonNullable<Parameters<typeof makeRequestWithSideEffects>[2]> {
    const lastCall = jest.mocked(makeRequestWithSideEffects).mock.calls.at(-1);
    if (!lastCall) {
        throw new Error('makeRequestWithSideEffects was not called');
    }
    return lastCall[2] ?? {};
}

/**
 * Replays a captured search request the way applyHTTPSOnyxUpdates does: optimisticData first, then any server
 * onyxData, then successData (jsonCode 200) or failureData (non-200), and finallyData last regardless of jsonCode.
 * This lets us assert the terminal snapshot state that the real API application order would produce.
 */
async function simulateResolvedRequest({jsonCode, serverOnyxData}: {jsonCode: number; serverOnyxData?: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SNAPSHOT>>}) {
    const {optimisticData, successData, failureData, finallyData} = getCapturedSearchOnyxData();

    await Onyx.update(optimisticData ?? []);
    if (serverOnyxData) {
        await Onyx.update(serverOnyxData);
    }
    if (jsonCode === CONST.JSON_CODE.SUCCESS) {
        await Onyx.update(successData ?? []);
    } else {
        await Onyx.update(failureData ?? []);
    }
    await Onyx.update(finallyData ?? []);
    await waitForBatchedUpdates();
}

describe('search snapshot terminal state', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.mocked(waitForWrites).mockResolvedValue(undefined);
        jest.mocked(makeRequestWithSideEffects).mockResolvedValue(undefined);
        await Onyx.clear();
    });

    it('marks the snapshot loading optimistically while a request is in flight', async () => {
        const queryJSON = getQueryJSON();

        await search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false});
        const {optimisticData} = getCapturedSearchOnyxData();
        await Onyx.update(optimisticData ?? []);
        await waitForBatchedUpdates();

        const snapshot = await getOnyxValue(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON.hash}` as const);
        expect(snapshot?.search?.state).toBe(CONST.SEARCH.SNAPSHOT_STATE.LOADING);
    });

    it('settles the snapshot to loaded through finally data', async () => {
        const queryJSON = getQueryJSON();

        await search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false});
        const {optimisticData, finallyData} = getCapturedSearchOnyxData();
        await Onyx.update(optimisticData ?? []);
        await Onyx.update(finallyData ?? []);
        await waitForBatchedUpdates();

        const snapshot = await getOnyxValue(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON.hash}` as const);
        expect(snapshot?.search?.state).toBe(CONST.SEARCH.SNAPSHOT_STATE.LOADED);
        expect(snapshot?.search?.hash).toBe(queryJSON.hash);
    });

    it('resolves the snapshot to loaded on a successful response', async () => {
        const queryJSON = getQueryJSON();

        await search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false});
        await simulateResolvedRequest({
            jsonCode: CONST.JSON_CODE.SUCCESS,
            serverOnyxData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON.hash}`,
                    value: {search: {hasResults: true}},
                },
            ],
        });

        const snapshot = await getOnyxValue(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON.hash}` as const);
        expect(snapshot?.search?.state).toBe(CONST.SEARCH.SNAPSHOT_STATE.LOADED);
        expect(snapshot?.search?.hash).toBe(queryJSON.hash);
        expect(snapshot?.search?.hasResults).toBe(true);
    });

    it('resolves the snapshot to loaded with errors on a failed response', async () => {
        const queryJSON = getQueryJSON();

        await search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false});
        await simulateResolvedRequest({jsonCode: FAILURE_JSON_CODE});

        const snapshot = await getOnyxValue(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON.hash}` as const);
        expect(snapshot?.search?.state).toBe(CONST.SEARCH.SNAPSHOT_STATE.LOADED);
        expect(snapshot?.search?.hash).toBe(queryJSON.hash);
        expect(snapshot?.errors).toBeDefined();
    });

    it('reaches a terminal state when a successful response resolves without any snapshot data', async () => {
        const queryJSON = getQueryJSON();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON.hash}`, {
            search: {
                hash: queryJSON.hash,
                sortBy: CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
                sortOrder: CONST.SEARCH.SORT_ORDER.ASC,
            },
        });

        await search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false});
        // The bug scenario: a 200 response that writes no server onyxData at all.
        await simulateResolvedRequest({jsonCode: CONST.JSON_CODE.SUCCESS});

        const snapshot = await getOnyxValue(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON.hash}` as const);
        expect(snapshot?.search?.state).toBe(CONST.SEARCH.SNAPSHOT_STATE.LOADED);
        // The hash lets the UI match this completed request to the current query.
        expect(snapshot?.search?.hash).toBe(queryJSON.hash);
        expect(isSearchDataLoaded(snapshot, queryJSON)).toBe(true);
    });

    it('resolves the snapshot to loaded without an error when the API layer skips failureData for a 460 response', async () => {
        const queryJSON = getQueryJSON();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON.hash}`, {
            search: {
                hash: queryJSON.hash,
                sortBy: CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
                sortOrder: CONST.SEARCH.SORT_ORDER.ASC,
            },
        });

        jest.mocked(makeRequestWithSideEffects).mockImplementationOnce(async (_command, _parameters, onyxData) => {
            await Onyx.update(onyxData?.optimisticData ?? []);
            await Onyx.update(onyxData?.finallyData ?? []);
            return {jsonCode: CONST.JSON_CODE.ADMIN_REQUIRED};
        });

        await search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false});
        await waitForBatchedUpdates();

        const snapshot = await getOnyxValue(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON.hash}` as const);
        expect(snapshot?.search?.state).toBe(CONST.SEARCH.SNAPSHOT_STATE.LOADED);
        expect(snapshot?.search?.isLoading).toBe(false);
        expect(snapshot?.errors).toBeUndefined();
        expect(isSearchDataLoaded(snapshot, queryJSON)).toBe(true);
    });

    it('persists the failing jsonCode so a reload can still classify the failure', async () => {
        const queryJSON = getQueryJSON();
        jest.mocked(makeRequestWithSideEffects).mockImplementationOnce(async (_command, _parameters, onyxData) => {
            await Onyx.update(onyxData?.optimisticData ?? []);
            await Onyx.update(onyxData?.failureData ?? []);
            await Onyx.update(onyxData?.finallyData ?? []);
            return {jsonCode: CONST.JSON_CODE.INVALID_SEARCH_QUERY};
        });

        await search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false});
        await waitForBatchedUpdates();

        const snapshot = await getOnyxValue(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON.hash}` as const);
        expect(snapshot?.errors).toBeDefined();
        expect(snapshot?.search?.responseJsonCode).toBe(CONST.JSON_CODE.INVALID_SEARCH_QUERY);
    });

    it('does not persist a jsonCode for a successful response', async () => {
        const queryJSON = getQueryJSON();
        jest.mocked(makeRequestWithSideEffects).mockResolvedValueOnce({jsonCode: CONST.JSON_CODE.SUCCESS});

        await search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false});
        await waitForBatchedUpdates();

        const snapshot = await getOnyxValue(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON.hash}` as const);
        expect(snapshot?.search?.responseJsonCode).toBeUndefined();
    });

    it('clears a previously persisted jsonCode when a new request starts', async () => {
        const queryJSON = getQueryJSON();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON.hash}`, {search: {responseJsonCode: CONST.JSON_CODE.INVALID_SEARCH_QUERY}});

        await search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false});
        const {optimisticData} = getCapturedSearchOnyxData();
        await Onyx.update(optimisticData ?? []);
        await waitForBatchedUpdates();

        const snapshot = await getOnyxValue(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON.hash}` as const);
        expect(snapshot?.search?.responseJsonCode).toBeUndefined();
    });

    it('deduplicates concurrent requests for the same hash and offset', async () => {
        const queryJSON = getQueryJSON();
        let resolveRequest: ((value: Awaited<ReturnType<typeof makeRequestWithSideEffects>>) => void) | undefined;
        jest.mocked(makeRequestWithSideEffects).mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    resolveRequest = resolve;
                }),
        );

        const firstRequest = search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false});
        await Promise.resolve();
        const duplicateRequest = search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false});
        await Promise.resolve();

        expect(makeRequestWithSideEffects).toHaveBeenCalledTimes(1);

        resolveRequest?.({jsonCode: CONST.JSON_CODE.SUCCESS});
        await Promise.all([firstRequest, duplicateRequest]);
    });

    it('resolves the snapshot to loaded with errors when the request promise rejects', async () => {
        const queryJSON = getQueryJSON();
        jest.mocked(makeRequestWithSideEffects).mockRejectedValueOnce(new Error('Network request failed'));

        // The failure class this field exists to eliminate: no HTTP response at all (offline/timeout), so
        // nothing in the API layer ever applies failureData for it unless search() catches the rejection itself.
        // search() also swallows the rejection (APP-5J) so it never floats into onunhandledrejection, so this
        // must resolve rather than reject.
        await expect(search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false})).resolves.toBeUndefined();
        await waitForBatchedUpdates();

        const snapshot = await getOnyxValue(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON.hash}` as const);
        expect(snapshot?.search?.state).toBe(CONST.SEARCH.SNAPSHOT_STATE.LOADED);
        expect(snapshot?.errors).toBeDefined();
        // There is no response to read a code from, but the errors still need one so the error view can
        // classify them after a reload. 0 records "failed without a usable code" rather than leaving a gap.
        expect(snapshot?.search?.responseJsonCode).toBe(0);
    });
});
