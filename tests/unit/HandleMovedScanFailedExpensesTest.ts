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

function buildIOUAction(reportActionID: string, reportID: string): ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> {
    return {
        reportActionID,
        reportID,
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        created: '2026-08-24 10:00:00.000',
        originalMessage: {IOUTransactionID: TRANSACTION_ID, IOUReportID: reportID, amount: 0, currency: CONST.CURRENCY.USD, type: CONST.IOU.REPORT_ACTION_TYPE.CREATE},
        message: [],
    };
}

function buildRequest(data: Record<string, unknown>): Request<OnyxKey> {
    return {command: 'PayMoneyRequest', data};
}

function buildPayRequest(overrides: Record<string, unknown> = {}): Request<OnyxKey> {
    return buildRequest({
        full: true,
        chatReportID: CHAT_REPORT_ID,
        iouReportID: PAID_REPORT_ID,
        optimisticHoldReportID: OPTIMISTIC_REPORT_ID,
        ...overrides,
    });
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

function backendReportActionsUpdate(): AnyOnyxUpdate {
    return {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REAL_REPORT_ID}`,
        value: {[REAL_IOU_ACTION_ID]: buildIOUAction(REAL_IOU_ACTION_ID, REAL_REPORT_ID)},
    };
}

function findUpdate(onyxData: AnyOnyxUpdate[] | undefined, key: string) {
    return onyxData?.find((update) => update.key === key);
}

/** The reconciliation appends its updates, so the last one for a key is the one it added. */
function findAppendedUpdate(onyxData: AnyOnyxUpdate[] | undefined, key: string) {
    return onyxData?.findLast((update) => update.key === key);
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
        const response = buildResponse([backendReportUpdate()]);

        await handleMovedScanFailedExpenses(Promise.resolve(response), {command: 'ApproveMoneyRequest', data: {}} as Request<OnyxKey>, false);

        expect(response.onyxData).toHaveLength(1);
        expect(mockSetParams).not.toHaveBeenCalled();
    });

    it('leaves a hold split untouched, since it pays only part of the report and the backend reuses its optimistic report', async () => {
        const response = buildResponse([backendReportUpdate()]);

        await handleMovedScanFailedExpenses(Promise.resolve(response), buildPayRequest({full: false}), false);

        expect(response.onyxData).toHaveLength(1);
        expect(mockSetParams).not.toHaveBeenCalled();
    });

    it('retires the optimistic report and its report preview once the backend report arrives', async () => {
        const response = buildResponse([backendReportUpdate(), backendReportActionsUpdate()]);

        await handleMovedScanFailedExpenses(Promise.resolve(response), buildPayRequest(), false);

        expect(findUpdate(response.onyxData, `${ONYXKEYS.COLLECTION.REPORT}${OPTIMISTIC_REPORT_ID}`)?.value).toBeNull();
        expect(findUpdate(response.onyxData, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${OPTIMISTIC_REPORT_ID}`)?.value).toBeNull();
        expect(findUpdate(response.onyxData, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CHAT_REPORT_ID}`)?.value).toEqual({[PREVIEW_ACTION_ID]: null});
    });

    it("re-parents the moved expense's transaction thread onto the backend report action", async () => {
        const response = buildResponse([backendReportUpdate(), backendReportActionsUpdate()]);

        await handleMovedScanFailedExpenses(Promise.resolve(response), buildPayRequest(), false);

        expect(findUpdate(response.onyxData, `${ONYXKEYS.COLLECTION.REPORT}${THREAD_REPORT_ID}`)?.value).toEqual({
            parentReportID: REAL_REPORT_ID,
            parentReportActionID: REAL_IOU_ACTION_ID,
            chatReportID: REAL_REPORT_ID,
        });
        expect(findAppendedUpdate(response.onyxData, `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REAL_REPORT_ID}`)?.value).toEqual({
            [REAL_IOU_ACTION_ID]: {childReportID: THREAD_REPORT_ID},
        });
    });

    it('moves every route showing the optimistic report onto the backend report before it is removed', async () => {
        const response = buildResponse([backendReportUpdate(), backendReportActionsUpdate()]);

        await handleMovedScanFailedExpenses(Promise.resolve(response), buildPayRequest(), false);

        expect(mockSetParams).toHaveBeenCalledWith({reportID: REAL_REPORT_ID}, 'report-route');
        expect(mockSetParams).toHaveBeenCalledWith({backTo: `/r/${REAL_REPORT_ID}`}, 'rhp-route');
    });

    it('falls back to the workspace chat when the response does not identify the backend report', async () => {
        const response = buildResponse([
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${PAID_REPORT_ID}`,
                value: {reportID: PAID_REPORT_ID, chatReportID: CHAT_REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE},
            },
        ]);

        await handleMovedScanFailedExpenses(Promise.resolve(response), buildPayRequest(), false);

        expect(mockSetParams).toHaveBeenCalledWith({reportID: CHAT_REPORT_ID}, 'report-route');
        expect(findUpdate(response.onyxData, `${ONYXKEYS.COLLECTION.REPORT}${OPTIMISTIC_REPORT_ID}`)?.value).toBeNull();
        expect(findUpdate(response.onyxData, `${ONYXKEYS.COLLECTION.REPORT}${THREAD_REPORT_ID}`)).toBeUndefined();
    });

    it('leaves a failed payment to failureData, which rolls the move back on its own', async () => {
        const response = buildResponse([backendReportUpdate(), backendReportActionsUpdate()]);
        response.jsonCode = 400;

        await handleMovedScanFailedExpenses(Promise.resolve(response), buildPayRequest(), false);

        expect(response.onyxData).toHaveLength(2);
        expect(mockSetParams).not.toHaveBeenCalled();
    });

    it('does nothing when the optimistic report is already gone', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${OPTIMISTIC_REPORT_ID}`, null);
        await waitForBatchedUpdates();
        const response = buildResponse([backendReportUpdate(), backendReportActionsUpdate()]);

        await handleMovedScanFailedExpenses(Promise.resolve(response), buildPayRequest(), false);

        expect(response.onyxData).toHaveLength(2);
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
