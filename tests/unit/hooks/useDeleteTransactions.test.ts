import {act, renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useDeleteTransactions from '@hooks/useDeleteTransactions';

import {updateSplitTransactions} from '@libs/actions/IOU/SplitTransactionUpdate';
import {WRITE_COMMANDS} from '@libs/API/types';
import {buildOptimisticIOUReportAction} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import DateUtils from '@src/libs/DateUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx';
import type ReportAction from '@src/types/onyx/ReportAction';
import type Transaction from '@src/types/onyx/Transaction';

import Onyx from 'react-native-onyx';

import {createExpenseReport, createSelfDM} from '../../utils/collections/reports';
import getOnyxValue from '../../utils/getOnyxValue';
import {expectAPICommandToHaveBeenCalled, expectAPICommandToHaveBeenCalledWith, getCurrencyDecimalsLocal, getGlobalFetchMock} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
    goBack: jest.fn(),
    getTopmostReportId: jest.fn(() => '1'),
    setNavigationActionToMicrotaskQueue: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getReportRouteByID: jest.fn(),
    getActiveRoute: jest.fn(),
    navigationRef: {getRootState: jest.fn(), isReady: jest.fn(() => true)},
}));
jest.mock('@react-navigation/native');
jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn());
jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => jest.fn());
jest.mock('@libs/actions/IOU/SplitTransactionUpdate', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/IOU/SplitTransactionUpdate'),
    updateSplitTransactions: jest.fn(),
}));
jest.mock('@src/libs/actions/Report', () => ({
    ...jest.requireActual<Record<string, unknown>>('@src/libs/actions/Report'),
    setDeleteTransactionNavigateBackUrl: jest.fn(),
}));

const RORY_EMAIL = 'rory@expensifail.com';
const RORY_ACCOUNT_ID = 3;

beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
    return waitForBatchedUpdates();
});

beforeEach(async () => {
    global.fetch = getGlobalFetchMock();
    await Onyx.clear();
    await Onyx.multiSet({
        [ONYXKEYS.SESSION]: {accountID: RORY_ACCOUNT_ID, email: RORY_EMAIL},
        [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[RORY_ACCOUNT_ID]: {accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}},
    });
});

describe('useDeleteTransactions', () => {
    it('deletes the self-DM IOU action along with an unreported expense instead of leaving an orphaned preview', async () => {
        // Given an unreported (self-DM) expense whose IOU action lives in the self-DM chat, with no IOU report
        const selfDMReport = createSelfDM(2, RORY_ACCOUNT_ID);
        const transactionID = 'unreported-transaction';
        const transaction: Transaction = {
            transactionID,
            amount: -10000,
            currency: 'USD',
            merchant: 'Test Merchant',
            comment: {comment: 'Test comment'},
            created: DateUtils.getDBTime(),
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
        };
        const iouAction: ReportAction = {
            ...buildOptimisticIOUReportAction({
                type: CONST.IOU.REPORT_ACTION_TYPE.TRACK,
                amount: 10000,
                currency: 'USD',
                comment: '',
                participants: [{accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}],
                transactionID,
                isPersonalTrackingExpense: true,
                getCurrencyDecimals: getCurrencyDecimalsLocal,
            }),
            reportID: selfDMReport.reportID,
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);
        await Onyx.merge(ONYXKEYS.SELF_DM_REPORT_ID, selfDMReport.reportID);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`, {[iouAction.reportActionID]: iouAction});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDeleteTransactions({report: selfDMReport, reportActions: [iouAction]}), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdates();

        // When the expense is deleted (e.g. from Search / a bulk selection)
        act(() => {
            result.current.deleteTransactions([transactionID], {}, {});
        });
        await waitForBatchedUpdates();

        // Then the IOU action in the self-DM report is emptied out along with the transaction
        const selfDMActions = (await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`)) as ReportActions | undefined;
        const deletedAction = selfDMActions?.[iouAction.reportActionID];
        expect(Array.isArray(deletedAction?.message) ? deletedAction?.message.at(0)?.html : undefined).toBe('');

        // And the report actions are keyed on the self-DM report, not on a missing IOU report
        await expect(getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}undefined`)).resolves.toBeFalsy();
    });

    it('deletes an expense that has no IOU action instead of silently skipping it', async () => {
        // Given an expense on an expense report whose IOU action was never created
        const expenseReport = createExpenseReport(1);
        const transactionID = 'transaction';
        const transaction: Transaction = {
            transactionID,
            amount: -10000,
            currency: 'USD',
            merchant: 'Test Merchant',
            comment: {comment: 'Test comment'},
            created: DateUtils.getDBTime(),
            reportID: expenseReport.reportID,
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDeleteTransactions({report: expenseReport, reportActions: []}), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdates();

        // When the expense is bulk-deleted from Search
        act(() => {
            result.current.deleteTransactions([transactionID], {}, {});
        });
        await waitForBatchedUpdates();

        // Then DeleteMoneyRequest is sent with the transaction ID, since the API deletes expenses without an IOU action
        expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.DELETE_MONEY_REQUEST, 1);
        expectAPICommandToHaveBeenCalledWith(WRITE_COMMANDS.DELETE_MONEY_REQUEST, 0, {transactionID});

        // And the expense is removed from Onyx once the request succeeds
        await expect(getOnyxValue(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`)).resolves.toBeFalsy();
    });

    it('finds the IOU action in the Onyx collection when the passed report actions miss it', async () => {
        // Given an expense whose IOU action is in Onyx but not in the paginated report actions passed to the hook
        const expenseReport = createExpenseReport(1);
        const transactionID = 'transaction';
        const transaction: Transaction = {
            transactionID,
            amount: -10000,
            currency: 'USD',
            merchant: 'Test Merchant',
            comment: {comment: 'Test comment'},
            created: DateUtils.getDBTime(),
            reportID: expenseReport.reportID,
        };
        const iouAction: ReportAction = {
            ...buildOptimisticIOUReportAction({
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: 10000,
                currency: 'USD',
                comment: '',
                participants: [{accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}],
                transactionID,
                iouReportID: expenseReport.reportID,
                getCurrencyDecimals: getCurrencyDecimalsLocal,
            }),
            reportID: expenseReport.reportID,
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`, {[iouAction.reportActionID]: iouAction});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDeleteTransactions({report: expenseReport, reportActions: []}), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdates();

        // When the expense is deleted
        act(() => {
            result.current.deleteTransactions([transactionID], {}, {});
        });
        await waitForBatchedUpdates();

        // Then DeleteMoneyRequest is sent with the IOU action found in the collection, so its optimistic cleanup runs
        expectAPICommandToHaveBeenCalledWith(WRITE_COMMANDS.DELETE_MONEY_REQUEST, 0, {transactionID, reportActionID: iouAction.reportActionID});
    });

    it('finds the IOU action of an unreported expense under the self-DM report when the passed report actions miss it', async () => {
        // Given an unreported expense whose IOU action lives in the self-DM chat, and no report actions passed to the hook
        const selfDMReport = createSelfDM(2, RORY_ACCOUNT_ID);
        const transactionID = 'unreported-transaction';
        const transaction: Transaction = {
            transactionID,
            amount: -10000,
            currency: 'USD',
            merchant: 'Test Merchant',
            comment: {comment: 'Test comment'},
            created: DateUtils.getDBTime(),
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
        };
        const iouAction: ReportAction = {
            ...buildOptimisticIOUReportAction({
                type: CONST.IOU.REPORT_ACTION_TYPE.TRACK,
                amount: 10000,
                currency: 'USD',
                comment: '',
                participants: [{accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}],
                transactionID,
                isPersonalTrackingExpense: true,
                getCurrencyDecimals: getCurrencyDecimalsLocal,
            }),
            reportID: selfDMReport.reportID,
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);
        await Onyx.merge(ONYXKEYS.SELF_DM_REPORT_ID, selfDMReport.reportID);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`, {[iouAction.reportActionID]: iouAction});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDeleteTransactions({report: selfDMReport, reportActions: []}), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdates();

        // When the expense is deleted
        act(() => {
            result.current.deleteTransactions([transactionID], {}, {});
        });
        await waitForBatchedUpdates();

        // Then the tracked-expense cleanup still empties the self-DM IOU action, because it was found under the self-DM report rather than under reportID '0'
        const selfDMActions = (await getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`)) as ReportActions | undefined;
        const deletedAction = selfDMActions?.[iouAction.reportActionID];
        expect(Array.isArray(deletedAction?.message) ? deletedAction?.message.at(0)?.html : undefined).toBe('');
    });

    it('picks each expense its own IOU action when deleting several expenses of one report, preferring a live action from either source', async () => {
        // Given three expenses on one report: the first has a deleted action in Onyx and a live one only in the passed actions,
        // the second has its action only in Onyx, and the third only in the passed actions
        const expenseReport = createExpenseReport(1);
        const buildTransaction = (transactionID: string): Transaction => ({
            transactionID,
            amount: -10000,
            currency: 'USD',
            merchant: 'Test Merchant',
            comment: {comment: 'Test comment'},
            created: DateUtils.getDBTime(),
            reportID: expenseReport.reportID,
        });
        const buildIOUAction = (transactionID: string, reportActionID: string): ReportAction => ({
            ...buildOptimisticIOUReportAction({
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: 10000,
                currency: 'USD',
                comment: '',
                participants: [{accountID: RORY_ACCOUNT_ID, login: RORY_EMAIL}],
                transactionID,
                iouReportID: expenseReport.reportID,
                getCurrencyDecimals: getCurrencyDecimalsLocal,
            }),
            reportActionID,
            reportID: expenseReport.reportID,
            pendingAction: null,
        });
        const deletedAction: ReportAction = {...buildIOUAction('t1', 'deleted-action'), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};
        const liveAction = buildIOUAction('t1', 'live-action');
        const collectionOnlyAction = buildIOUAction('t2', 'collection-action');
        const passedOnlyAction = buildIOUAction('t3', 'passed-action');

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
        for (const transactionID of ['t1', 't2', 't3']) {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, buildTransaction(transactionID));
        }
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`, {
            [deletedAction.reportActionID]: deletedAction,
            [collectionOnlyAction.reportActionID]: collectionOnlyAction,
        });
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDeleteTransactions({report: expenseReport, reportActions: [liveAction, passedOnlyAction]}), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdates();

        // When the three expenses are deleted together
        act(() => {
            result.current.deleteTransactions(['t1', 't2', 't3'], {}, {});
        });
        await waitForBatchedUpdates();

        // Then each DeleteMoneyRequest carries the action the single-expense lookup would pick for that expense
        expectAPICommandToHaveBeenCalled(WRITE_COMMANDS.DELETE_MONEY_REQUEST, 3);
        expectAPICommandToHaveBeenCalledWith(WRITE_COMMANDS.DELETE_MONEY_REQUEST, 0, {transactionID: 't1', reportActionID: liveAction.reportActionID});
        expectAPICommandToHaveBeenCalledWith(WRITE_COMMANDS.DELETE_MONEY_REQUEST, 1, {transactionID: 't2', reportActionID: collectionOnlyAction.reportActionID});
        expectAPICommandToHaveBeenCalledWith(WRITE_COMMANDS.DELETE_MONEY_REQUEST, 2, {transactionID: 't3', reportActionID: passedOnlyAction.reportActionID});
    });

    it('keeps only the live split siblings of the deleted split, ignoring deleted siblings and splits of another expense', async () => {
        // Given an expense split in four, where one split is pending deletion, and a split of another expense on the same report
        const expenseReport = {...createExpenseReport(1), statusNum: CONST.REPORT.STATUS_NUM.OPEN};
        const buildSplit = (transactionID: string, originalTransactionID: string, pendingAction?: Transaction['pendingAction']): Transaction => ({
            transactionID,
            amount: -1000,
            currency: 'USD',
            merchant: 'Test Merchant',
            comment: {comment: '', originalTransactionID, source: CONST.IOU.TYPE.SPLIT},
            created: DateUtils.getDBTime(),
            reportID: expenseReport.reportID,
            pendingAction,
        });
        const splits = [
            buildSplit('split-deleted-now', 'original'),
            buildSplit('split-kept-1', 'original'),
            buildSplit('split-kept-2', 'original'),
            buildSplit('split-already-deleted', 'original', CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
            buildSplit('split-of-other-expense', 'other-original'),
        ];
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
        for (const split of splits) {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${split.transactionID}`, split);
        }
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDeleteTransactions({report: expenseReport, reportActions: []}), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdates();

        // When one split is deleted
        act(() => {
            result.current.deleteTransactions(['split-deleted-now'], {}, {});
        });
        await waitForBatchedUpdates();

        // Then the split is rebuilt from its two live siblings only
        expect(updateSplitTransactions).toHaveBeenCalledTimes(1);
        const remainingSplitIDs = jest
            .mocked(updateSplitTransactions)
            .mock.calls.at(0)?.[0]
            .transactionData.splitExpenses.map((splitExpense) => splitExpense.transactionID);
        expect(remainingSplitIDs).toEqual(['split-kept-1', 'split-kept-2']);
    });
});
