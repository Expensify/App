import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import type * as PaginationModuleNamespace from '@libs/Middleware/Pagination';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import type {PaginatedRequest} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

type ModuleImport = () => Promise<unknown>;

const mockRetryDynamicImport = jest.fn<Promise<unknown>, [ModuleImport, string]>();
const mockLogHmmm = jest.fn();
const mockConnectWithoutView = jest.fn();

jest.mock('@src/utils/retryDynamicImport', () => ({
    __esModule: true,
    default: (moduleImport: ModuleImport, retryKey: string) => mockRetryDynamicImport(moduleImport, retryKey),
}));

jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {
        hmmm: (...args: unknown[]): void => {
            mockLogHmmm(...args);
        },
    },
}));

jest.mock('react-native-onyx', () => ({
    __esModule: true,
    default: {
        METHOD: {
            MERGE: 'merge',
            SET: 'set',
        },
        connectWithoutView: (...args: unknown[]): void => {
            mockConnectWithoutView(...args);
        },
    },
}));

type PaginationModule = typeof PaginationModuleNamespace;
type ReportActionsKey = typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS;

const REPORT_ID = '1';
const REPORT_ACTION: ReportAction = {
    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
    created: '2026-08-21 10:00:00.000',
    reportActionID: '1',
};

function createRequest(): PaginatedRequest<ReportActionsKey> {
    return {
        command: WRITE_COMMANDS.OPEN_REPORT,
        isPaginated: true,
        resourceID: REPORT_ID,
    };
}

function createResponse(): Response<ReportActionsKey> {
    return {
        hasNewerActions: false,
        hasOlderActions: false,
        onyxData: [
            {
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`,
                onyxMethod: 'merge',
                value: {[REPORT_ACTION.reportActionID]: REPORT_ACTION},
            },
        ],
    };
}

function registerReportActionsPagination({registerPaginationConfig}: PaginationModule) {
    registerPaginationConfig({
        initialCommand: WRITE_COMMANDS.OPEN_REPORT,
        previousCommand: READ_COMMANDS.GET_OLDER_ACTIONS,
        nextCommand: READ_COMMANDS.GET_NEWER_ACTIONS,
        resourceCollectionKey: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
        pageCollectionKey: ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES,
        sortItems: () => [REPORT_ACTION],
        getItemID: (reportAction) => reportAction.reportActionID,
    });
}

function expectPageMetadata(response: Response<ReportActionsKey> | void) {
    expect(response?.onyxData).toEqual(
        expect.arrayContaining([
            {
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${REPORT_ID}`,
                onyxMethod: 'set',
                value: [[CONST.PAGINATION_START_ID, REPORT_ACTION.reportActionID, CONST.PAGINATION_END_ID]],
            },
        ]),
    );
}

async function loadPaginationModule(): Promise<PaginationModule> {
    return import('@libs/Middleware/Pagination');
}

describe('Pagination middleware config loading', () => {
    beforeEach(() => {
        jest.resetModules();
        mockRetryDynamicImport.mockReset();
        mockLogHmmm.mockReset();
        mockConnectWithoutView.mockReset();
    });

    it('waits for one shared config import before processing concurrent responses', async () => {
        const configImport = Promise.withResolvers<unknown>();
        mockRetryDynamicImport.mockReturnValue(configImport.promise);
        const paginationModule = await loadPaginationModule();
        const firstResponse = createResponse();
        const secondResponse = createResponse();

        const firstResultPromise = paginationModule.Pagination(Promise.resolve(firstResponse), createRequest(), false);
        const secondResultPromise = paginationModule.Pagination(Promise.resolve(secondResponse), createRequest(), false);
        await Promise.resolve();

        expect(mockRetryDynamicImport).toHaveBeenCalledTimes(1);
        expect(firstResponse.onyxData).toHaveLength(1);
        expect(secondResponse.onyxData).toHaveLength(1);

        registerReportActionsPagination(paginationModule);
        configImport.resolve({});

        const [firstResult, secondResult] = await Promise.all([firstResultPromise, secondResultPromise]);
        expectPageMetadata(firstResult);
        expectPageMetadata(secondResult);
    });

    it('continues without pagination metadata after a load failure and retries on the next request', async () => {
        const loadError = new Error('pagination chunk failed');
        const retryImport = Promise.withResolvers<unknown>();
        mockRetryDynamicImport.mockRejectedValueOnce(loadError).mockReturnValueOnce(retryImport.promise);
        const paginationModule = await loadPaginationModule();
        const failedResponse = createResponse();

        const failedResult = await paginationModule.Pagination(Promise.resolve(failedResponse), createRequest(), false);

        expect(failedResult).toBe(failedResponse);
        expect(failedResponse.onyxData).toHaveLength(1);
        expect(mockLogHmmm).toHaveBeenCalledWith('[Pagination] Failed to load pagination config', {error: loadError});

        const retriedResultPromise = paginationModule.Pagination(Promise.resolve(createResponse()), createRequest(), false);
        registerReportActionsPagination(paginationModule);
        retryImport.resolve({});

        expectPageMetadata(await retriedResultPromise);
        expect(mockRetryDynamicImport).toHaveBeenCalledTimes(2);
    });

    it('uses an existing config without loading the chunk again', async () => {
        const paginationModule = await loadPaginationModule();
        registerReportActionsPagination(paginationModule);

        const result = await paginationModule.Pagination(Promise.resolve(createResponse()), createRequest(), false);

        expectPageMetadata(result);
        expect(mockRetryDynamicImport).not.toHaveBeenCalled();
    });
});
