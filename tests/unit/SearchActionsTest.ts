import {queueExportSearchItemsToCSV, queueExportSearchWithTemplate, saveSavedViewEdits, saveSearch} from '@libs/actions/Search';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

const EXPENSE_STATUS_ALL = CONST.SEARCH.STATUS.EXPENSE.ALL;

jest.mock('@libs/API');
jest.mock('@libs/Network/enhanceParameters', () => ({
    __esModule: true,
    default: (_: string, params: Record<string, unknown>) => params,
}));

const mockWrite = jest.mocked(write);

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

describe('queueExportSearchItemsToCSV', () => {
    beforeEach(() => jest.clearAllMocks());

    it('sets optimistic Onyx data with state preparing and returns exportID', () => {
        const exportID = queueExportSearchItemsToCSV({
            query: EXPENSE_STATUS_ALL,
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

describe('saveSearch', () => {
    beforeEach(() => jest.clearAllMocks());

    it('passes previousHash and optimistically removes the stale saved search when editing changed the query hash', () => {
        const originalQuery = buildSearchQueryJSON('type:expense');
        const editedQuery = buildSearchQueryJSON('type:invoice');
        if (!originalQuery || !editedQuery) {
            throw new Error('failed to build query JSON');
        }

        saveSearch({queryJSON: editedQuery, newName: 'Renamed view', previousHash: originalQuery.hash});

        const [command, parameters] = mockWrite.mock.calls.at(-1) ?? [];
        expect(command).toBe(WRITE_COMMANDS.SAVE_SEARCH);
        expect(parameters).toEqual(expect.objectContaining({newName: 'Renamed view', previousHash: originalQuery.hash}));

        const {optimisticData} = getWriteOptions();
        const savedSearchesUpdate = optimisticData.find((update) => update.key === ONYXKEYS.SAVED_SEARCHES);
        expect(savedSearchesUpdate?.value).toEqual(
            expect.objectContaining({
                [editedQuery.hash]: expect.objectContaining({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}),
                [originalQuery.hash]: expect.objectContaining({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}),
            }),
        );
    });

    it('does not send previousHash or remove anything when the query (hash) is unchanged', () => {
        const queryJSON = buildSearchQueryJSON('type:expense');
        if (!queryJSON) {
            throw new Error('failed to build query JSON');
        }

        saveSearch({queryJSON, newName: 'Renamed view', previousHash: queryJSON.hash});

        const parameters = mockWrite.mock.calls.at(-1)?.at(1);
        expect(parameters).toEqual(expect.objectContaining({previousHash: undefined}));

        const {optimisticData} = getWriteOptions();
        const savedSearchesUpdate = optimisticData.find((update) => update.key === ONYXKEYS.SAVED_SEARCHES);
        expect(savedSearchesUpdate?.value).toEqual({[queryJSON.hash]: expect.objectContaining({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD})});
    });
});

describe('saveSavedViewEdits', () => {
    beforeEach(() => jest.clearAllMocks());

    it('preserves a custom name and forwards the original hash as previousHash so the backend updates the view in place', () => {
        const originalQuery = buildSearchQueryJSON('type:expense');
        const editedQuery = buildSearchQueryJSON('type:invoice');
        if (!originalQuery || !editedQuery) {
            throw new Error('failed to build query JSON');
        }

        saveSavedViewEdits({queryJSON: editedQuery, editingSavedView: {hash: originalQuery.hash, name: 'My view', query: 'type:expense', requestID: 1}});

        const [command, parameters] = mockWrite.mock.calls.at(-1) ?? [];
        expect(command).toBe(WRITE_COMMANDS.SAVE_SEARCH);
        expect(parameters).toEqual(expect.objectContaining({newName: 'My view', previousHash: originalQuery.hash}));
    });

    it('re-auto-names an auto-named view (name === query) to the edited query so it does not show the stale old query', () => {
        const originalQuery = buildSearchQueryJSON('type:expense');
        const editedQuery = buildSearchQueryJSON('type:invoice');
        if (!originalQuery || !editedQuery) {
            throw new Error('failed to build query JSON');
        }

        // The view was auto-named, so its name equals its original query string.
        saveSavedViewEdits({queryJSON: editedQuery, editingSavedView: {hash: originalQuery.hash, name: originalQuery.inputQuery, query: originalQuery.inputQuery, requestID: 1}});

        const parameters = mockWrite.mock.calls.at(-1)?.at(1);
        // newName defaults to the EDITED query so SavedSearchList re-derives a readable title (not the stale old query).
        expect(parameters).toEqual(expect.objectContaining({newName: editedQuery.inputQuery, previousHash: originalQuery.hash}));
    });
});
