import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import type * as PaginationModuleNamespace from '@libs/Middleware/Pagination';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import type {PaginatedRequest} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

type MockConnectOptions = {
    key: string;
    callback: (value: Record<string, unknown> | undefined) => void;
};

const mockLogHmmm = jest.fn();
const mockConnectWithoutView = jest.fn<void, [MockConnectOptions]>();

jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {
        hmmm: (...args: unknown[]): void => {
            mockLogHmmm(...args);
        },
    },
}));

jest.mock('@libs/ReportActionsUtils', () => ({
    getSortedReportActionsForDisplay: (reportActions: Record<string, ReportAction>) => Object.values(reportActions),
}));

jest.mock('@libs/ReportUtils', () => ({
    canUserPerformWriteAction: () => true,
}));

jest.mock('react-native-onyx', () => ({
    __esModule: true,
    default: {
        METHOD: {
            MERGE: 'merge',
            SET: 'set',
        },
        connectWithoutView: (options: MockConnectOptions): void => {
            mockConnectWithoutView(options);
        },
    },
}));

type PaginationModule = typeof PaginationModuleNamespace;
type ReportActionsKey = typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS;

const REPORT_ID = '1';
const REPORT_ACTION: ReportAction = {
    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
    created: '2026-08-21 10:00:00.000',
    reportActionID: '2',
};
const CACHED_REPORT_ACTION: ReportAction = {
    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
    created: '2026-08-21 09:00:00.000',
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

function registerReportActionsPagination({registerPaginationConfig}: PaginationModule): Promise<void> {
    return registerPaginationConfig({
        initialCommand: WRITE_COMMANDS.OPEN_REPORT,
        previousCommand: READ_COMMANDS.GET_OLDER_ACTIONS,
        nextCommand: READ_COMMANDS.GET_NEWER_ACTIONS,
        resourceCollectionKey: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
        pageCollectionKey: ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES,
        sortItems: (items) => [REPORT_ACTION, CACHED_REPORT_ACTION].filter((reportAction) => Object.hasOwn(items, reportAction.reportActionID)),
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

describe('Pagination middleware registration readiness', () => {
    beforeEach(() => {
        jest.resetModules();
        mockLogHmmm.mockReset();
        mockConnectWithoutView.mockReset();
        mockConnectWithoutView.mockImplementation(({callback}) => callback({}));
    });

    it('registers the report actions pagination config only once', async () => {
        const {default: registerReportActionsPaginationConfig} = await import('@libs/registerReportActionsPagination');

        const firstReadyPromise = registerReportActionsPaginationConfig();
        const secondReadyPromise = registerReportActionsPaginationConfig();

        expect(secondReadyPromise).toBe(firstReadyPromise);
        await firstReadyPromise;
        expect(mockConnectWithoutView).toHaveBeenCalledTimes(4);
    });

    it('processes responses with a synchronously registered config', async () => {
        const paginationModule = await loadPaginationModule();
        await registerReportActionsPagination(paginationModule);

        const result = await paginationModule.Pagination(Promise.resolve(createResponse()), createRequest(), false);

        expectPageMetadata(result);
    });

    it('observes a rejected response while the initial snapshots are pending', async () => {
        let pageSnapshotCallback: MockConnectOptions['callback'] | undefined;
        mockConnectWithoutView.mockImplementation(({key, callback}) => {
            if (key === ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES) {
                pageSnapshotCallback = callback;
                return;
            }

            callback({});
        });
        const paginationModule = await loadPaginationModule();
        registerReportActionsPagination(paginationModule);
        const responseError = new Error('OpenReport failed');

        const resultPromise = paginationModule.Pagination(Promise.reject(responseError), createRequest(), false);

        await expect(resultPromise).rejects.toBe(responseError);
        pageSnapshotCallback?.({});
    });

    it('waits for the initial page snapshot before preserving cached page metadata', async () => {
        let pageSnapshotCallback: MockConnectOptions['callback'] | undefined;
        mockConnectWithoutView.mockImplementation(({key, callback}) => {
            if (key === ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES) {
                pageSnapshotCallback = callback;
                return;
            }

            callback({
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`]: {
                    [CACHED_REPORT_ACTION.reportActionID]: CACHED_REPORT_ACTION,
                },
            });
        });
        const paginationModule = await loadPaginationModule();
        const paginationConfigReady = registerReportActionsPagination(paginationModule);

        const resultPromise = paginationModule.Pagination(Promise.resolve(createResponse()), createRequest(), false);
        const onSettled = jest.fn();
        const trackedResultPromise = resultPromise.then((result) => {
            onSettled();
            return result;
        });
        await Promise.resolve();

        expect(onSettled).not.toHaveBeenCalled();
        expect(pageSnapshotCallback).toBeDefined();

        pageSnapshotCallback?.({
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${REPORT_ID}`]: [[CONST.PAGINATION_START_ID, CACHED_REPORT_ACTION.reportActionID]],
        });
        await paginationConfigReady;

        const result = await trackedResultPromise;
        const pageUpdate = result?.onyxData?.find((update) => update.key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${REPORT_ID}`);
        expect(pageUpdate).toEqual(
            expect.objectContaining({
                value: expect.arrayContaining([expect.arrayContaining([CACHED_REPORT_ACTION.reportActionID])]),
            }),
        );
    });

    it('passes a paginated response through when no config is registered', async () => {
        const paginationModule = await loadPaginationModule();
        const response = createResponse();

        const result = await paginationModule.Pagination(Promise.resolve(response), createRequest(), false);

        expect(result).toBe(response);
        expect(response.onyxData).toHaveLength(1);
    });
});
