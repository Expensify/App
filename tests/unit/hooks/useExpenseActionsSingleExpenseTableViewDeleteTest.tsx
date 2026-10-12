import {act, renderHook, waitFor} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {useMoneyReportTransactionThread} from '@components/MoneyReportTransactionThreadContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useExpenseActions from '@hooks/useExpenseActions';

import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import showConfirmModalAfterMoreMenuDismiss from '@libs/showConfirmModalAfterMoreMenuDismiss';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomReportAction from '../../utils/collections/reportActions';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

// The confirm modal tells which delete path ran, so cancel it to stop before any navigation or deletion happens.
jest.mock('@libs/showConfirmModalAfterMoreMenuDismiss', () => ({__esModule: true, default: jest.fn(() => Promise.resolve({action: 'CLOSE'}))}));

// useConfirmModal reaches into the global ModalContext which isn't mounted here; stub it (the confirm result is
// provided by the showConfirmModalAfterMoreMenuDismiss mock above).
jest.mock('@hooks/useConfirmModal', () => ({__esModule: true, default: () => ({showConfirmModal: jest.fn(), closeModal: jest.fn()})}));

const mockDeleteTransactions = jest.fn(() => ({action: 'deleted', deletedTransactionThreadReportIDs: []}));
const mockShouldOpenSplitExpenseEditFlowOnDelete = jest.fn(() => false);

jest.mock('@hooks/useDeleteTransactions', () => ({
    __esModule: true,
    default: () => ({deleteTransactions: mockDeleteTransactions, shouldOpenSplitExpenseEditFlowOnDelete: mockShouldOpenSplitExpenseEditFlowOnDelete}),
}));

// The transaction-thread data normally comes from a context provider fed by Onyx; supply it directly.
jest.mock('@components/MoneyReportTransactionThreadContext', () => ({__esModule: true, useMoneyReportTransactionThread: jest.fn()}));

const mockShowConfirmModalAfterMoreMenuDismiss = jest.mocked(showConfirmModalAfterMoreMenuDismiss);

const expenseReportID = '41';
const transactionID = '42';
const iouActionID = '43';

const wrapper = ({children}: {children: React.ReactNode}) => (
    <OnyxListItemProvider>
        <LocaleContextProvider>{children}</LocaleContextProvider>
    </OnyxListItemProvider>
);

/** Set up an open report owned by the current user (accountID 0) that holds exactly one of their expenses. */
async function setUpSingleExpenseReport(
    singleExpenseReportView: ValueOf<typeof CONST.REPORT_LAYOUT.SINGLE_EXPENSE_REPORT_VIEW>,
    reportType: typeof CONST.REPORT.TYPE.EXPENSE | typeof CONST.REPORT.TYPE.IOU = CONST.REPORT.TYPE.EXPENSE,
) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const iouAction = {
        ...createRandomReportAction(Number(iouActionID)),
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        actorAccountID: 0,
        originalMessage: {
            IOUReportID: expenseReportID,
            IOUTransactionID: transactionID,
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            amount: 100,
            currency: CONST.CURRENCY.USD,
        },
        pendingAction: null,
    } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>;
    const report: Report = {
        ...createRandomReport(Number(expenseReportID), undefined),
        type: reportType,
        ownerAccountID: 0,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    };
    const transaction = {
        ...createRandomTransaction(Number(transactionID)),
        transactionID,
        reportID: expenseReportID,
        status: CONST.TRANSACTION.STATUS.POSTED,
        comment: {originalTransactionID: '44'},
    };

    jest.mocked(useMoneyReportTransactionThread).mockReturnValue({
        iouTransactionID: transactionID,
        requestParentReportAction: iouAction,
        transactionThreadReportID: undefined,
        transactionThreadReport: undefined,
        reportActions: [iouAction],
    });

    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReportID}`, {[iouActionID]: iouAction});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
        await Onyx.set(ONYXKEYS.NVP_SINGLE_EXPENSE_REPORT_VIEW, singleExpenseReportView);
    });
    await waitForBatchedUpdatesWithAct();
}

describe('useExpenseActions - deleting a single-expense report from the More menu', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
        initOnyxDerivedValues();
        return waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        jest.clearAllMocks();
        mockShouldOpenSplitExpenseEditFlowOnDelete.mockReturnValue(false);
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('deletes the report, not the expense, in the table view', async () => {
        // Given the user chose the table view for single-expense reports and owns the report's only expense
        await setUpSingleExpenseReport(CONST.REPORT_LAYOUT.SINGLE_EXPENSE_REPORT_VIEW.TABLE);
        const {result} = renderHook(() => useExpenseActions({reportID: expenseReportID, isReportInSearch: false, backTo: undefined}), {wrapper});
        await waitFor(() => {
            // Wait for the translated label so the confirm modal below is built with loaded translations
            expect(result.current.actions[CONST.REPORT.SECONDARY_ACTIONS.DELETE]?.text).toBe('Delete');
        });

        // When the user selects More > Delete
        await act(async () => {
            await result.current.actions[CONST.REPORT.SECONDARY_ACTIONS.DELETE]?.onSelected?.();
        });

        // Then the report-level delete runs, which moves the expense to the self DM instead of deleting it
        expect(mockShowConfirmModalAfterMoreMenuDismiss).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({title: 'Delete report'}));
        expect(mockDeleteTransactions).not.toHaveBeenCalled();
    });

    it('deletes the expense in the expense view', async () => {
        // Given the user kept the default expense view and owns the report's only expense
        await setUpSingleExpenseReport(CONST.REPORT_LAYOUT.SINGLE_EXPENSE_REPORT_VIEW.EXPENSE);
        const {result} = renderHook(() => useExpenseActions({reportID: expenseReportID, isReportInSearch: false, backTo: undefined}), {wrapper});
        await waitFor(() => {
            // Wait for the translated label so the confirm modal below is built with loaded translations
            expect(result.current.actions[CONST.REPORT.SECONDARY_ACTIONS.DELETE]?.text).toBe('Delete');
        });

        // When the user selects More > Delete
        await act(async () => {
            await result.current.actions[CONST.REPORT.SECONDARY_ACTIONS.DELETE]?.onSelected?.();
        });

        // Then the expense-level delete runs, as the expense view shows a single expense
        expect(mockShowConfirmModalAfterMoreMenuDismiss).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({title: 'Delete expense'}));
    });

    it('deletes the expense of an IOU report in the table view', async () => {
        // Given the user chose the table view and owns the only expense of an IOU report, which can't be deleted as a report
        await setUpSingleExpenseReport(CONST.REPORT_LAYOUT.SINGLE_EXPENSE_REPORT_VIEW.TABLE, CONST.REPORT.TYPE.IOU);
        const {result} = renderHook(() => useExpenseActions({reportID: expenseReportID, isReportInSearch: false, backTo: undefined}), {wrapper});
        await waitFor(() => {
            // Wait for the translated label so the confirm modal below is built with loaded translations
            expect(result.current.actions[CONST.REPORT.SECONDARY_ACTIONS.DELETE]?.text).toBe('Delete');
        });

        // When the user selects More > Delete
        await act(async () => {
            await result.current.actions[CONST.REPORT.SECONDARY_ACTIONS.DELETE]?.onSelected?.();
        });

        // Then the expense-level delete still runs
        expect(mockShowConfirmModalAfterMoreMenuDismiss).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({title: 'Delete expense'}));
    });

    it('labels the action as Delete instead of Edit splits in the table view', async () => {
        // Given the report's only expense is part of a split that would open the edit splits flow on delete
        mockShouldOpenSplitExpenseEditFlowOnDelete.mockReturnValue(true);
        await setUpSingleExpenseReport(CONST.REPORT_LAYOUT.SINGLE_EXPENSE_REPORT_VIEW.TABLE);

        // When the actions are built in the table view
        const {result} = renderHook(() => useExpenseActions({reportID: expenseReportID, isReportInSearch: false, backTo: undefined}), {wrapper});

        // Then the menu says Delete, matching the report-level delete it runs
        await waitFor(() => {
            expect(result.current.actions[CONST.REPORT.SECONDARY_ACTIONS.DELETE]?.text).toBe('Delete');
        });
    });
});
