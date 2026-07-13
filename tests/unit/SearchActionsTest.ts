import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import {exportSearchItemsToCSV, queueExportSearchItemsToCSV, queueExportSearchWithTemplate} from '@libs/actions/Search';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import fileDownload from '@libs/fileDownload';
import {translate} from '@libs/Localize';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

const EXPENSE_STATUS_ALL = CONST.SEARCH.STATUS.EXPENSE.ALL;
const translateForTest: LocalizedTranslate = (path, ...parameters) => translate(CONST.LOCALES.EN, path, ...parameters);

jest.mock('@libs/API');
jest.mock('@libs/fileDownload');
jest.mock('@libs/Network/enhanceParameters', () => ({
    __esModule: true,
    default: (_: string, params: Record<string, unknown>) => params,
}));

const mockWrite = jest.mocked(write);
const mockFileDownload = jest.mocked(fileDownload);

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

    it('includes excluded transaction IDs in the queued CSV payload', () => {
        queueExportSearchItemsToCSV({
            query: EXPENSE_STATUS_ALL,
            jsonQuery: '{}',
            reportIDList: [],
            transactionIDList: ['tx1'],
            excludedTransactionIDList: ['tx2'],
            isBasicExport: true,
            exportColumnLabels: '{}',
            exportName: 'Basic export',
        });

        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.QUEUE_EXPORT_SEARCH_ITEMS_TO_CSV, expect.objectContaining({excludedTransactionIDList: ['tx2']}), expect.any(Object));
    });

    it('does not add an exclusion field when there are no exclusions', () => {
        queueExportSearchItemsToCSV({
            query: EXPENSE_STATUS_ALL,
            jsonQuery: '{}',
            reportIDList: [],
            transactionIDList: ['tx1'],
            isBasicExport: true,
            exportColumnLabels: '{}',
            exportName: 'Basic export',
        });

        expect(mockWrite.mock.calls.at(-1)?.at(1)).not.toHaveProperty('excludedTransactionIDList');
    });
});

describe('exportSearchItemsToCSV', () => {
    beforeEach(() => jest.clearAllMocks());

    it('includes excluded transaction IDs in the direct CSV form payload', () => {
        const appendSpy = jest.spyOn(FormData.prototype, 'append');

        exportSearchItemsToCSV(
            {
                query: EXPENSE_STATUS_ALL,
                jsonQuery: '{}',
                reportIDList: [],
                transactionIDList: ['tx1'],
                excludedTransactionIDList: ['tx2'],
                isBasicExport: true,
                exportColumnLabels: '{}',
                exportName: 'Basic export',
            },
            jest.fn(),
            translateForTest,
        );

        expect(appendSpy).toHaveBeenCalledWith('excludedTransactionIDList', 'tx2');
        expect(mockFileDownload).toHaveBeenCalled();
        appendSpy.mockRestore();
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
