import {queueExportSearchItemsToCSV, queueExportSearchWithTemplate} from '@libs/actions/Search';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
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
        expect(exportDownloadUpdate?.value).toEqual({state: CONST.EXPORT_DOWNLOAD.STATE.PREPARING});

        const failureUpdate = failureData.find((u) => u.key === `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}`);
        expect(failureUpdate).toBeDefined();
        expect(failureUpdate?.value).toEqual({state: CONST.EXPORT_DOWNLOAD.STATE.FAILED});
    });
});

describe('queueExportSearchWithTemplate', () => {
    beforeEach(() => jest.clearAllMocks());

    it('sets optimistic Onyx data with state preparing and returns exportID', () => {
        const exportID = queueExportSearchWithTemplate({
            templateName: 'Test Template',
            templateType: 'csv',
            jsonQuery: '{}',
            reportIDList: [],
            transactionIDList: [],
            policyID: 'policy123',
        });

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
        expect(exportDownloadUpdate?.value).toEqual({state: CONST.EXPORT_DOWNLOAD.STATE.PREPARING});

        const failureUpdate = failureData.find((u) => u.key === `${ONYXKEYS.COLLECTION.EXPORT_DOWNLOAD}${exportID}`);
        expect(failureUpdate).toBeDefined();
        expect(failureUpdate?.value).toEqual({state: CONST.EXPORT_DOWNLOAD.STATE.FAILED});
    });
});
