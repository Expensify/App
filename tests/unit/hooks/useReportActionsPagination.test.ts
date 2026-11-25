import {act, renderHook, waitFor} from '@testing-library/react-native';

import useReportActionsPagination from '@hooks/useReportActionsPagination';

import {buildOptimisticCreatedReportAction, buildOptimisticIOUReportAction} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const mockGetCurrencyDecimals = jest.fn(() => 2);

jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({getCurrencyDecimals: mockGetCurrencyDecimals})}));
jest.mock('@hooks/useDelegateAccountID', () => ({__esModule: true, default: () => undefined}));
jest.mock('@hooks/useNetwork', () => ({__esModule: true, default: () => ({isOffline: true})}));
jest.mock('@hooks/useParentReportAction', () => ({__esModule: true, default: () => undefined}));
jest.mock('@hooks/useTransactionThread', () => ({__esModule: true, default: () => ({})}));
jest.mock('@hooks/useReportIsArchived', () => ({__esModule: true, default: () => false}));

const reportID = '123';
const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}` as const;
const actionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}` as const;
const report: Report = {reportID, type: CONST.REPORT.TYPE.EXPENSE, ownerAccountID: 1, total: -100, currency: 'USD'};
const expense: ReportAction = {
    ...buildOptimisticIOUReportAction({
        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        amount: 100,
        currency: 'USD',
        comment: '',
        participants: [],
        transactionID: '10',
        iouReportID: reportID,
        created: '2026-11-01 12:00:00.000',
        getCurrencyDecimals: mockGetCurrencyDecimals,
    }),
    reportID,
};

beforeEach(async () => {
    Onyx.init({keys: ONYXKEYS});
    await Onyx.clear();
    await Onyx.set(reportKey, report);
    await Onyx.set(actionsKey, {[expense.reportActionID]: expense});
    await waitForBatchedUpdates();
});

it('keeps the placeholder identity through unrelated writes and newer actions', async () => {
    // Given an offline report whose CREATED action has not loaded.
    const {result} = renderHook(() => useReportActionsPagination(reportID, undefined));
    await waitFor(() => expect(result.current.reportActions).toHaveLength(2));
    const created = result.current.reportActions.at(-1);

    // When report metadata and then a newer message change through Onyx.
    await act(async () => {
        await Onyx.merge(reportKey, {lastReadTime: '2026-11-02 12:00:00.000'});
    });
    expect(result.current.reportActions.at(-1)).toBe(created);
    const newer: ReportAction = {...expense, reportActionID: '999', created: '2026-11-02 12:00:00.000'};
    await act(async () => {
        await Onyx.merge(actionsKey, {[newer.reportActionID]: newer});
    });

    // Then the real pipeline preserves the oldest synthetic row and newest-first ordering.
    await waitFor(() => expect(result.current.reportActions).toHaveLength(3));
    expect(result.current.reportActions.at(-1)).toBe(created);
    expect(result.current.reportActions.at(0)?.reportActionID).toBe('999');
});

it('decorates a stored CREATED action without leaking pending state through acknowledgement, deletion or rollback', async () => {
    // Given a persisted CREATED action and an optimistic expense.
    const created: ReportAction = {...buildOptimisticCreatedReportAction({emailCreatingAction: '1', created: '2026-11-01 11:00:00.000'}), reportID, pendingAction: null};
    await Onyx.merge(actionsKey, {[created.reportActionID]: created});
    const {result} = renderHook(() => useReportActionsPagination(reportID, undefined));
    await waitFor(() => expect(result.current.reportActions.at(-1)?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE));
    const pendingCreated = result.current.reportActions.at(-1);
    expect(result.current.allReportActions.at(-1)?.pendingAction).toBeFalsy();
    expect(pendingCreated?.reportID).toBe(reportID);

    // When an unrelated report field changes, the decorated action remains identical.
    await act(async () => {
        await Onyx.merge(reportKey, {lastReadTime: '2026-11-02 12:00:00.000'});
    });
    expect(result.current.reportActions.at(-1)).toBe(pendingCreated);

    // When the server acknowledges the expense, the displayed action returns to the stored value.
    await act(async () => {
        await Onyx.merge(actionsKey, {[expense.reportActionID]: {pendingAction: null}});
    });
    await waitFor(() => expect(result.current.reportActions.at(-1)?.pendingAction).toBeFalsy());
    expect(result.current.reportActions.at(-1)).toBe(result.current.allReportActions.at(-1));

    // Then an offline deletion and rollback update decoration without changing the stored CREATED action.
    await act(async () => {
        await Onyx.merge(actionsKey, {[expense.reportActionID]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}});
    });
    await waitFor(() => expect(result.current.reportActions.at(-1)?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE));
    await act(async () => {
        await Onyx.merge(actionsKey, {[expense.reportActionID]: {pendingAction: null}});
    });
    await waitFor(() => expect(result.current.reportActions.at(-1)?.pendingAction).toBeFalsy());
    expect(result.current.allReportActions.at(-1)?.pendingAction).toBeFalsy();
});

it('only builds a missing-expense placeholder while the preview count exceeds the loaded count', async () => {
    // Given a report whose only expense has already loaded.
    await Onyx.merge(reportKey, {chatReportID: '456'});
    await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}456`, {
        preview: {
            reportActionID: 'preview',
            actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            actorAccountID: 1,
            created: expense.created,
            childMoneyRequestCount: 1,
            // Legacy previews remain valid pipeline inputs until their server migration completes.
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            originalMessage: {linkedReportID: reportID},
        },
    });
    mockGetCurrencyDecimals.mockClear();
    const {result} = renderHook(() => useReportActionsPagination(reportID, undefined));
    await waitFor(() => expect(result.current.reportActions).toHaveLength(2));
    expect(mockGetCurrencyDecimals).not.toHaveBeenCalled();

    // When the preview reports another expense, the missing row gets its placeholder.
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}456`, {preview: {childMoneyRequestCount: 2}});
    });
    await waitFor(() => expect(result.current.reportActions).toHaveLength(3));
    expect(mockGetCurrencyDecimals).toHaveBeenCalled();
    const placeholder = result.current.reportActions.at(1);
    expect(placeholder?.reportID).toBe(reportID);

    // When an unrelated report field changes, the synthetic expense remains identical.
    await act(async () => {
        await Onyx.merge(reportKey, {lastReadTime: '2026-11-02 12:00:00.000'});
    });
    expect(result.current.reportActions.at(1)).toBe(placeholder);

    // Then a real expense replaces it without entering the persisted action ID list.
    const received = {...expense, reportActionID: '998', created: '2026-11-02 12:00:00.000', pendingAction: null};
    await act(async () => {
        await Onyx.merge(actionsKey, {[received.reportActionID]: received});
    });
    await waitFor(() => expect(result.current.reportActions.some((action) => action.reportActionID === '998')).toBe(true));
    expect(result.current.reportActions).not.toContain(placeholder);
    expect(result.current.persistedReportActionIDs).not.toContain(placeholder?.reportActionID);
});
