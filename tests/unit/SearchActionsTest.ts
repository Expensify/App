import {deleteSavedSearch, queueExportSearchItemsToCSV, queueExportSearchWithTemplate, saveSearch, search} from '@libs/actions/Search';
import {makeRequestWithSideEffects, waitForWrites, write} from '@libs/API';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

import Onyx from 'react-native-onyx';

jest.mock('@libs/API');
jest.mock('@libs/Network/enhanceParameters', () => ({
    __esModule: true,
    default: (_: string, params: Record<string, unknown>) => params,
}));

const mockWrite = jest.mocked(write);
const mockMakeRequestWithSideEffects = jest.mocked(makeRequestWithSideEffects);
const mockWaitForWrites = jest.mocked(waitForWrites);

function getWriteOptions(): {optimisticData: AnyOnyxUpdate[]; failureData: AnyOnyxUpdate[]} {
    const options = mockWrite.mock.calls.at(-1)?.at(2);
    if (
        !options ||
        typeof options !== 'object' ||
        !('optimisticData' in options) ||
        !Array.isArray(options.optimisticData) ||
        !('failureData' in options) ||
        !Array.isArray(options.failureData)
    ) {
        throw new Error('write was not called with optimistic options');
    }
    return {optimisticData: options.optimisticData, failureData: options.failureData};
}

/** Builds a real query JSON, throwing if the query cannot be parsed, so callers get a non-nullable value without a non-null assertion. */
function buildQueryJSON(query: string) {
    const queryJSON = buildSearchQueryJSON(query);
    if (!queryJSON) {
        throw new Error(`Failed to build query JSON for "${query}"`);
    }
    return queryJSON;
}

describe('queueExportSearchItemsToCSV', () => {
    beforeEach(() => jest.clearAllMocks());

    it('sets optimistic Onyx data with state preparing and returns exportID', () => {
        const exportID = queueExportSearchItemsToCSV({
            jsonQuery: '{}',
            reportIDList: [],
            transactionIDList: [],
            isBasicExport: true,
            exportColumnLabels: '{}',
            exportName: 'Basic export',
        });

        expect(typeof exportID).toBe('string');
        expect(exportID.length).toBeGreaterThan(0);

        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.QUEUE_EXPORT_SEARCH_ITEMS_TO_CSV,
            expect.objectContaining({exportID}),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            expect.objectContaining({optimisticData: expect.any(Array), failureData: expect.any(Array)}),
        );

        const {optimisticData, failureData} = getWriteOptions();
        const exportDownloadUpdate = optimisticData.find((u) => u.key === `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}`);
        expect(exportDownloadUpdate).toBeDefined();
        expect(exportDownloadUpdate?.value).toEqual({state: CONST.EXPORT_DOWNLOAD.STATE.PREPARING, exportType: CONST.EXPORT_DOWNLOAD.TYPE.CSV});

        const failureUpdate = failureData.find((u) => u.key === `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}`);
        expect(failureUpdate).toBeDefined();
        expect(failureUpdate?.value).toEqual({state: CONST.EXPORT_DOWNLOAD.STATE.FAILED, exportType: CONST.EXPORT_DOWNLOAD.TYPE.CSV});
    });
});

describe('queueExportSearchWithTemplate', () => {
    beforeEach(() => jest.clearAllMocks());

    it('sets optimistic Onyx data with state preparing and returns exportID when tracking progress', () => {
        const exportID = queueExportSearchWithTemplate(
            {
                templateName: 'Test Template',
                templateType: 'csv',
                jsonQuery: '{}',
                reportIDList: [],
                transactionIDList: [],
                policyID: 'policy123',
                exportName: 'Test Template',
            },
            true,
        );

        expect(typeof exportID).toBe('string');
        expect(exportID.length).toBeGreaterThan(0);

        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.QUEUE_EXPORT_SEARCH_WITH_TEMPLATE,
            expect.objectContaining({exportID}),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            expect.objectContaining({optimisticData: expect.any(Array), failureData: expect.any(Array)}),
        );

        const {optimisticData, failureData} = getWriteOptions();
        const exportDownloadUpdate = optimisticData.find((u) => u.key === `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}`);
        expect(exportDownloadUpdate).toBeDefined();
        expect(exportDownloadUpdate?.value).toEqual({state: CONST.EXPORT_DOWNLOAD.STATE.PREPARING, exportType: CONST.EXPORT_DOWNLOAD.TYPE.CSV});

        const failureUpdate = failureData.find((u) => u.key === `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}`);
        expect(failureUpdate).toBeDefined();
        expect(failureUpdate?.value).toEqual({state: CONST.EXPORT_DOWNLOAD.STATE.FAILED, exportType: CONST.EXPORT_DOWNLOAD.TYPE.CSV});
    });

    it('keeps the legacy request shape (no exportID, no optimistic data) when not tracking progress', () => {
        queueExportSearchWithTemplate({
            templateName: 'Test Template',
            templateType: 'csv',
            jsonQuery: '{}',
            reportIDList: [],
            transactionIDList: [],
            policyID: 'policy123',
            exportName: 'Test Template',
        });

        const finalParameters = mockWrite.mock.calls.at(-1)?.at(1);
        expect(finalParameters).not.toHaveProperty('exportID');

        const options = mockWrite.mock.calls.at(-1)?.at(2);
        expect(options).toEqual({});
    });
});

describe('SearchActions', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('saveSearch', () => {
        const savedSearchID = '123456789';
        const queryJSON = buildQueryJSON('type:expense status:all');

        it('keys the optimistic, failure, and success data by the provided savedSearchID', () => {
            saveSearch({id: savedSearchID, queryJSON, newName: 'My search'});

            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.SAVE_SEARCH,
                {jsonQuery: JSON.stringify(queryJSON), savedSearchID, newName: 'My search'},
                {
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.SAVED_SEARCHES,
                            value: {[savedSearchID]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, name: 'My search', query: queryJSON.inputQuery}},
                        },
                    ],
                    failureData: [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.SAVED_SEARCHES, value: {[savedSearchID]: null}}],
                    successData: [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.SAVED_SEARCHES, value: {[savedSearchID]: {pendingAction: null}}}],
                },
            );
        });

        it('falls back to the input query for the name when no name is given', () => {
            saveSearch({id: savedSearchID, queryJSON});

            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.SAVE_SEARCH,
                {jsonQuery: JSON.stringify(queryJSON), savedSearchID, newName: queryJSON.inputQuery},
                expect.objectContaining({
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.SAVED_SEARCHES,
                            value: {[savedSearchID]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, name: queryJSON.inputQuery, query: queryJSON.inputQuery}},
                        },
                    ],
                }),
            );
        });
    });

    describe('deleteSavedSearch', () => {
        it('sends the optimistic DELETE, failure revert, and success removal keyed by the savedSearchID', () => {
            const savedSearchID = '987654321';
            deleteSavedSearch(savedSearchID);

            expect(mockWrite).toHaveBeenCalledWith(
                WRITE_COMMANDS.DELETE_SAVED_SEARCH,
                {savedSearchID},
                {
                    optimisticData: [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.SAVED_SEARCHES, value: {[savedSearchID]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}}}],
                    failureData: [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.SAVED_SEARCHES, value: {[savedSearchID]: {pendingAction: null}}}],
                    successData: [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.SAVED_SEARCHES, value: {[savedSearchID]: null}}],
                },
            );
        });
    });

    describe('search', () => {
        beforeEach(() => {
            mockWaitForWrites.mockResolvedValue(undefined);
        });

        it('optimistically merges the current query into SEARCH_FILTERS for the search key', async () => {
            const searchKey = CONST.SEARCH.SEARCH_KEYS.EXPENSES;
            const queryJSON = buildQueryJSON('type:expense status:all');

            await search({queryJSON, searchKey, isLoading: false});

            expect(mockMakeRequestWithSideEffects).toHaveBeenCalledWith(
                READ_COMMANDS.SEARCH,
                expect.anything(),
                expect.objectContaining({
                    optimisticData: expect.arrayContaining([{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.SEARCH_FILTERS, value: {[searchKey]: queryJSON.inputQuery}}]),
                }),
            );
        });
    });
});
