import {replaceReportIDInPath} from '@libs/actions/IOU/reconcileMovedScanFailedReport';
import handleMovedScanFailedExpenses from '@libs/Middleware/HandleMovedScanFailedExpenses';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import type Request from '@src/types/onyx/Request';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const CHAT_REPORT_ID = '100';
const PAID_REPORT_ID = '200';
const OPTIMISTIC_REPORT_ID = '300';
const REAL_REPORT_ID = '400';
const THREAD_REPORT_ID = '500';
const TRANSACTION_ID = '600';
const PREVIEW_ACTION_ID = '700';
const OPTIMISTIC_IOU_ACTION_ID = '800';
const REAL_IOU_ACTION_ID = '900';

const mockSetParams = jest.fn();
const mockRootState = {
    routes: [
        {key: 'report-route', name: 'Report', params: {reportID: OPTIMISTIC_REPORT_ID}},
        {key: 'rhp-route', name: 'Report_Details', params: {backTo: `/r/${OPTIMISTIC_REPORT_ID}`}},
    ],
};

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        setParams: (...args: unknown[]): void => {
            mockSetParams(...args);
        },
    },
    navigationRef: {
        isReady: () => true,
        getRootState: () => mockRootState,
    },
}));

function buildIOUAction(reportActionID: string, reportID: string, transactionID = TRANSACTION_ID): ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> {
    return {
        reportActionID,
        reportID,
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        created: '2026-08-24 10:00:00.000',
        originalMessage: {IOUTransactionID: transactionID, IOUReportID: reportID, amount: 0, currency: CONST.CURRENCY.USD, type: CONST.IOU.REPORT_ACTION_TYPE.CREATE},
        message: [],
    };
}

/** Mirrors the pending-state cleanup that `getReportFromHoldRequestsOnyxData` already puts in successData for this flow. */
function buildSuccessData(): AnyOnyxUpdate[] {
    return [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CHAT_REPORT_ID}`,
            value: {[PREVIEW_ACTION_ID]: {pendingAction: null}},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${OPTIMISTIC_REPORT_ID}`,
            value: {[OPTIMISTIC_IOU_ACTION_ID]: {pendingAction: null}},
        },
    ];
}

function buildPayRequest(overrides: Record<string, unknown> = {}): Request<OnyxKey> {
    return {
        command: 'PayMoneyRequest',
        data: {
            full: true,
            chatReportID: CHAT_REPORT_ID,
            iouReportID: PAID_REPORT_ID,
            optimisticHoldReportID: OPTIMISTIC_REPORT_ID,
            ...overrides,
        },
        successData: buildSuccessData(),
    } as Request<OnyxKey>;
}

function buildResponse(onyxData: AnyOnyxUpdate[]): Response<OnyxKey> {
    return {jsonCode: 200, onyxData} as Response<OnyxKey>;
}

function backendReportUpdate(): AnyOnyxUpdate {
    return {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${REAL_REPORT_ID}`,
        value: {reportID: REAL_REPORT_ID, chatReportID: CHAT_REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE},
    };
}

function backendReportActionsUpdate(transactionID = TRANSACTION_ID): AnyOnyxUpdate {
    return {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REAL_REPORT_ID}`,
        value: {[REAL_IOU_ACTION_ID]: buildIOUAction(REAL_IOU_ACTION_ID, REAL_REPORT_ID, transactionID)},
    };
}

function backendResponse(): Response<OnyxKey> {
    return buildResponse([backendReportUpdate(), backendReportActionsUpdate()]);
}

function getSuccessData(request: Request<OnyxKey>): AnyOnyxUpdate[] {
    return (request.successData ?? []) as AnyOnyxUpdate[];
}

/** The reconciliation appends its updates, so the last one for a key is the one it added. */
function findAppended(request: Request<OnyxKey>, key: string) {
    return getSuccessData(request).findLast((update) => update.key === key);
}

describe('HandleMovedScanFailedExpenses middleware', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockSetParams.mockClear();
        await Onyx.clear();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${OPTIMISTIC_REPORT_ID}`, {
            reportID: OPTIMISTIC_REPORT_ID,
            chatReportID: CHAT_REPORT_ID,
            parentReportID: CHAT_REPORT_ID,
            parentReportActionID: PREVIEW_ACTION_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${THREAD_REPORT_ID}`, {
            reportID: THREAD_REPORT_ID,
            parentReportID: OPTIMISTIC_REPORT_ID,
            parentReportActionID: OPTIMISTIC_IOU_ACTION_ID,
            chatReportID: OPTIMISTIC_REPORT_ID,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${OPTIMISTIC_REPORT_ID}`, {
            [OPTIMISTIC_IOU_ACTION_ID]: buildIOUAction(OPTIMISTIC_IOU_ACTION_ID, OPTIMISTIC_REPORT_ID),
        });
        await waitForBatchedUpdates();
    });

    it('leaves a response for another command untouched', async () => {
        const request = {command: 'ApproveMoneyRequest', data: {}, successData: buildSuccessData()} as Request<OnyxKey>;

        await handleMovedScanFailedExpenses(Promise.resolve(backendResponse()), request, false);

        expect(getSuccessData(request)).toHaveLength(2);
        expect(mockSetParams).not.toHaveBeenCalled();
    });

    it('leaves a hold split untouched, since it pays only part of the report and the backend reuses its optimistic report', async () => {
        const request = buildPayRequest({full: false});

        await handleMovedScanFailedExpenses(Promise.resolve(backendResponse()), request, false);

        expect(getSuccessData(request)).toHaveLength(2);
        expect(mockSetParams).not.toHaveBeenCalled();
    });

    it('leaves a failed payment to failureData, which rolls the move back on its own', async () => {
        const request = buildPayRequest();
        const response = backendResponse();
        response.jsonCode = 400;

        await handleMovedScanFailedExpenses(Promise.resolve(response), request, false);

        expect(getSuccessData(request)).toHaveLength(2);
        expect(mockSetParams).not.toHaveBeenCalled();
    });

    it('retires the optimistic report and its report preview once the backend report arrives', async () => {
        const request = buildPayRequest();

        await handleMovedScanFailedExpenses(Promise.resolve(backendResponse()), request, false);

        expect(findAppended(request, `${ONYXKEYS.COLLECTION.REPORT}${OPTIMISTIC_REPORT_ID}`)?.value).toBeNull();
        expect(findAppended(request, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${OPTIMISTIC_REPORT_ID}`)?.value).toBeNull();
        expect(findAppended(request, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CHAT_REPORT_ID}`)?.value).toEqual({[PREVIEW_ACTION_ID]: null});
    });

    it('removes the report actions after successData clears their pending state, never before', async () => {
        const request = buildPayRequest();

        await handleMovedScanFailedExpenses(Promise.resolve(backendResponse()), request, false);

        const successData = getSuccessData(request);
        for (const key of [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CHAT_REPORT_ID}`, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${OPTIMISTIC_REPORT_ID}`]) {
            const clearsPendingState = successData.findIndex((update) => update.key === key);
            const removes = successData.findLastIndex((update) => update.key === key);
            expect(clearsPendingState).toBeGreaterThanOrEqual(0);
            expect(removes).toBeGreaterThan(clearsPendingState);
        }
    });

    it("re-parents the moved expense's transaction thread onto the backend report action", async () => {
        const request = buildPayRequest();

        await handleMovedScanFailedExpenses(Promise.resolve(backendResponse()), request, false);

        expect(findAppended(request, `${ONYXKEYS.COLLECTION.REPORT}${THREAD_REPORT_ID}`)?.value).toEqual({
            parentReportID: REAL_REPORT_ID,
            parentReportActionID: REAL_IOU_ACTION_ID,
            chatReportID: REAL_REPORT_ID,
        });
        expect(findAppended(request, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REAL_REPORT_ID}`)?.value).toEqual({
            [REAL_IOU_ACTION_ID]: {childReportID: THREAD_REPORT_ID},
        });
    });

    it('moves every route showing the optimistic report onto the backend report before it is removed', async () => {
        const request = buildPayRequest();

        await handleMovedScanFailedExpenses(Promise.resolve(backendResponse()), request, false);

        expect(mockSetParams).toHaveBeenCalledWith({reportID: REAL_REPORT_ID}, 'report-route');
        expect(mockSetParams).toHaveBeenCalledWith({backTo: `/r/${REAL_REPORT_ID}`}, 'rhp-route');
    });

    it('does not mistake a report that carries none of the moved expenses for the backend report', async () => {
        const request = buildPayRequest();
        const response = buildResponse([backendReportUpdate(), backendReportActionsUpdate('some-other-transaction')]);

        await handleMovedScanFailedExpenses(Promise.resolve(response), request, false);

        expect(mockSetParams).toHaveBeenCalledWith({reportID: CHAT_REPORT_ID}, 'report-route');
        expect(findAppended(request, `${ONYXKEYS.COLLECTION.REPORT}${THREAD_REPORT_ID}`)).toBeUndefined();
    });

    it('falls back to the workspace chat when the response does not identify the backend report', async () => {
        const request = buildPayRequest();

        await handleMovedScanFailedExpenses(Promise.resolve(buildResponse([])), request, false);

        expect(mockSetParams).toHaveBeenCalledWith({reportID: CHAT_REPORT_ID}, 'report-route');
        expect(findAppended(request, `${ONYXKEYS.COLLECTION.REPORT}${OPTIMISTIC_REPORT_ID}`)?.value).toBeNull();
        expect(findAppended(request, `${ONYXKEYS.COLLECTION.REPORT}${THREAD_REPORT_ID}`)).toBeUndefined();
    });

    it('does nothing when the optimistic report is already gone', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${OPTIMISTIC_REPORT_ID}`, null);
        await waitForBatchedUpdates();
        const request = buildPayRequest();

        await handleMovedScanFailedExpenses(Promise.resolve(backendResponse()), request, false);

        expect(getSuccessData(request)).toHaveLength(2);
        expect(mockSetParams).not.toHaveBeenCalled();
    });
});

describe('replaceReportIDInPath', () => {
    it('replaces a whole report route segment', () => {
        expect(replaceReportIDInPath('/r/123', '123', '456')).toBe('/r/456');
        expect(replaceReportIDInPath('/search/view/123', '123', '456')).toBe('/search/view/456');
        expect(replaceReportIDInPath('/r/123/details', '123', '456')).toBe('/r/456/details');
    });

    it('leaves a longer report ID that merely starts with the same digits alone', () => {
        expect(replaceReportIDInPath('/r/1234', '123', '456')).toBe('/r/1234');
    });

    it('leaves an unrelated path alone', () => {
        expect(replaceReportIDInPath('/settings/123', '123', '456')).toBe('/settings/123');
    });
});
