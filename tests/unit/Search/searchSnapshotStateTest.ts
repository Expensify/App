import {search} from '@libs/actions/Search';
import {makeRequestWithSideEffects, waitForWrites} from '@libs/API';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

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
        expect(snapshot?.search?.hasResults).toBe(true);
    });

    it('resolves the snapshot to error on a failed response', async () => {
        const queryJSON = getQueryJSON();

        await search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false});
        await simulateResolvedRequest({jsonCode: FAILURE_JSON_CODE});

        const snapshot = await getOnyxValue(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON.hash}` as const);
        // finallyData runs after failureData; the error state must survive it.
        expect(snapshot?.search?.state).toBe(CONST.SEARCH.SNAPSHOT_STATE.ERROR);
    });

    it('reaches a terminal state when a successful response resolves without any snapshot data', async () => {
        const queryJSON = getQueryJSON();

        await search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false});
        // The bug scenario: a 200 response that writes no server onyxData at all.
        await simulateResolvedRequest({jsonCode: CONST.JSON_CODE.SUCCESS});

        const snapshot = await getOnyxValue(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON.hash}` as const);
        expect(snapshot?.search?.state).toBe(CONST.SEARCH.SNAPSHOT_STATE.LOADED);
    });

    it('resolves the snapshot to error when the request promise rejects, instead of staying loading', async () => {
        const queryJSON = getQueryJSON();
        jest.mocked(makeRequestWithSideEffects).mockRejectedValueOnce(new Error('Network request failed'));

        // The failure class this field exists to eliminate: no HTTP response at all (offline/timeout), so
        // nothing in the API layer ever applies failureData for it unless search() catches the rejection itself.
        await expect(search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false})).rejects.toThrow();
        await waitForBatchedUpdates();

        const snapshot = await getOnyxValue(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON.hash}` as const);
        expect(snapshot?.search?.state).toBe(CONST.SEARCH.SNAPSHOT_STATE.ERROR);
    });
});
