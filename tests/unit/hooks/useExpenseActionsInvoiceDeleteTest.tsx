import {act, renderHook, waitFor} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {useMoneyReportTransactionThread} from '@components/MoneyReportTransactionThreadContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useExpenseActions from '@hooks/useExpenseActions';

import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import Navigation from '@libs/Navigation/Navigation';
import showConfirmModalAfterMoreMenuDismiss from '@libs/showConfirmModalAfterMoreMenuDismiss';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report, ReportAction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomReportAction from '../../utils/collections/reportActions';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';
import getOnyxValue from '../../utils/getOnyxValue';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

// The confirm modal is dismissed then confirmed; short-circuit it to a CONFIRM result so the delete proceeds.
// 'CONFIRM' is the literal value of ModalActions.CONFIRM (@components/Modal/Global/ModalContext).
jest.mock('@libs/showConfirmModalAfterMoreMenuDismiss', () => ({__esModule: true, default: jest.fn(() => Promise.resolve({action: 'CONFIRM'}))}));

// useConfirmModal reaches into the global ModalContext which isn't mounted here; stub it (the confirm result is
// provided by the showConfirmModalAfterMoreMenuDismiss mock above).
jest.mock('@hooks/useConfirmModal', () => ({__esModule: true, default: () => ({showConfirmModal: jest.fn(), closeModal: jest.fn()})}));

const mockDeleteAppReport = jest.fn();
const mockShowConfirmModalAfterMoreMenuDismiss = jest.mocked(showConfirmModalAfterMoreMenuDismiss);

jest.mock('@libs/actions/Report', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualReportActions = jest.requireActual('@libs/actions/Report');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {...actualReportActions, __esModule: true, deleteAppReport: (...args: unknown[]) => mockDeleteAppReport(...args)};
});

// The actual server delete is out of scope; assert on the navigate-back URL the delete writes, not the deletion itself.
const mockDeleteTransactions = jest.fn(() => ({action: 'deleted', deletedTransactionThreadReportIDs: []}));
const mockShouldOpenSplitExpenseEditFlowOnDelete = jest.fn(() => false);

jest.mock('@hooks/useDeleteTransactions', () => ({
    __esModule: true,
    default: () => ({deleteTransactions: mockDeleteTransactions, shouldOpenSplitExpenseEditFlowOnDelete: mockShouldOpenSplitExpenseEditFlowOnDelete}),
}));

// Keep all of ReportUtils real (we rely on the real isInvoiceReport) except navigateOnDeleteExpense, which we no-op so
// the delete stops right after writing the back URL (its afterTransition callback and real navigation don't run).
jest.mock('@libs/ReportUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualReportUtils = jest.requireActual('@libs/ReportUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {...actualReportUtils, __esModule: true, canEditFieldOfMoneyRequest: jest.fn(() => false), navigateOnDeleteExpense: jest.fn()};
});

// The transaction-thread data normally comes from a context provider fed by Onyx; supply it directly.
jest.mock('@components/MoneyReportTransactionThreadContext', () => ({__esModule: true, useMoneyReportTransactionThread: jest.fn()}));

const invoiceRoomID = '30';
const invoiceReportID = '31';
const transactionID = '32';
const iouActionID = '33';
const transactionThreadReportID = '34';

const wrapper = ({children}: {children: React.ReactNode}) => (
    <OnyxListItemProvider>
        <LocaleContextProvider>{children}</LocaleContextProvider>
    </OnyxListItemProvider>
);

describe('useExpenseActions delete', () => {
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

    // Regression test for issue #97399. Opening an invoice from the invoice room lands on `/e/:reportID`
    // (SearchMoneyRequestReportPage). Its header "More → Delete" runs useExpenseActions' DELETE action, which calls
    // getNavigationUrlOnMoneyRequestDelete to build the navigate-back URL and stores it in
    // NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL. Invoice reports are excluded by useGetIOUReportFromReportAction, so
    // before the fallback iouReport was undefined, the URL was undefined, no navigation happened, and the RHP was
    // left on "Not here". With the fallback the URL must resolve to the invoice room.
    it('writes the invoice-room back URL when deleting the only expense of an invoice', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const iouAction = {
            ...createRandomReportAction(Number(iouActionID)),
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            actorAccountID: 0,
            childReportID: transactionThreadReportID,
            originalMessage: {
                IOUReportID: invoiceReportID,
                IOUTransactionID: transactionID,
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: 100,
                currency: CONST.CURRENCY.USD,
            },
            pendingAction: null,
        } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>;

        const transactionThreadReport: Report = {
            ...createRandomReport(Number(transactionThreadReportID), undefined),
            parentReportID: invoiceReportID,
            parentReportActionID: iouActionID,
        };

        jest.mocked(useMoneyReportTransactionThread).mockReturnValue({
            iouTransactionID: transactionID,
            requestParentReportAction: iouAction,
            transactionThreadReportID,
            transactionThreadReport,
            reportActions: [iouAction],
        });

        const invoiceRoom: Report = createRandomReport(Number(invoiceRoomID), CONST.REPORT.CHAT_TYPE.INVOICE);
        const invoiceReport: Report = {
            ...createRandomReport(Number(invoiceReportID), undefined),
            type: CONST.REPORT.TYPE.INVOICE,
            chatReportID: invoiceRoomID,
            // Owned by the test's default current user (accountID 0) and open, so the expense is deletable.
            ownerAccountID: 0,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        };
        // The invoice's only transaction, so deleting it deletes the whole invoice report -> navigate back to the room.
        const transaction = {...createRandomTransaction(Number(transactionID)), transactionID, reportID: invoiceReportID, comment: {}};

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${invoiceRoomID}`, invoiceRoom);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${invoiceReportID}`, invoiceReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, transactionThreadReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${invoiceReportID}`, {[iouActionID]: iouAction});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
        });
        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => useExpenseActions({reportID: invoiceReportID, isReportInSearch: false, backTo: undefined}), {wrapper});

        // The derived transactions-by-report value must resolve to this invoice's single transaction before the
        // DELETE handler's `transactionCount === 1` branch runs.
        await waitFor(() => {
            expect(result.current.actions[CONST.REPORT.SECONDARY_ACTIONS.DELETE]).toBeDefined();
        });

        await act(async () => {
            await result.current.actions[CONST.REPORT.SECONDARY_ACTIONS.DELETE]?.onSelected?.();
        });
        await waitForBatchedUpdatesWithAct();

        const backUrl = await getOnyxValue(ONYXKEYS.NVP_DELETE_TRANSACTION_NAVIGATE_BACK_URL);
        expect(backUrl).toBe(ROUTES.REPORT_WITH_ID.getRoute(invoiceRoomID));
    });

    it("labels a non-owner's report-level action as Delete when the expense can be edited as a split", async () => {
        const memberAccountID = 1;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const iouAction = {
            ...createRandomReportAction(Number(iouActionID)),
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            actorAccountID: memberAccountID,
            originalMessage: {
                IOUReportID: invoiceReportID,
                IOUTransactionID: transactionID,
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: 100,
                currency: CONST.CURRENCY.USD,
            },
        } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>;
        const report: Report = {
            ...createRandomReport(Number(invoiceReportID), undefined),
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: memberAccountID,
            stateNum: undefined,
            statusNum: undefined,
        };
        const transaction = {...createRandomTransaction(Number(transactionID)), transactionID, reportID: invoiceReportID, comment: {originalTransactionID: '35'}};

        jest.mocked(useMoneyReportTransactionThread).mockReturnValue({
            iouTransactionID: transactionID,
            requestParentReportAction: iouAction,
            transactionThreadReportID: undefined,
            transactionThreadReport: undefined,
            reportActions: [iouAction],
        });
        mockShouldOpenSplitExpenseEditFlowOnDelete.mockReturnValue(true);

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${invoiceReportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${invoiceReportID}`, {[iouActionID]: iouAction});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
        });
        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => useExpenseActions({reportID: invoiceReportID, isReportInSearch: false, backTo: undefined}), {wrapper});

        await waitFor(() => {
            expect(result.current.actions[CONST.REPORT.SECONDARY_ACTIONS.DELETE]?.text).toBe('Delete');
        });
    });

    it('deletes the report instead of its only restricted card expense', async () => {
        // Given a draft report whose only restricted card expense was created by the current user
        const currentUserAccountID = 0;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const iouAction = {
            ...createRandomReportAction(Number(iouActionID)),
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            actorAccountID: currentUserAccountID,
            originalMessage: {
                IOUReportID: invoiceReportID,
                IOUTransactionID: transactionID,
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: 100,
                currency: CONST.CURRENCY.USD,
            },
        } as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>;
        const report: Report = {
            ...createRandomReport(Number(invoiceReportID), undefined),
            type: CONST.REPORT.TYPE.EXPENSE,
            chatReportID: invoiceRoomID,
            ownerAccountID: currentUserAccountID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        };
        const chatReport = createRandomReport(Number(invoiceRoomID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
        const transaction = {
            ...createRandomTransaction(Number(transactionID)),
            transactionID,
            reportID: invoiceReportID,
            managedCard: true,
            comment: {liabilityType: CONST.TRANSACTION.LIABILITY_TYPE.RESTRICT},
        };

        jest.mocked(useMoneyReportTransactionThread).mockReturnValue({
            iouTransactionID: transactionID,
            requestParentReportAction: iouAction,
            transactionThreadReportID: undefined,
            transactionThreadReport: undefined,
            reportActions: [iouAction],
        });
        const goBackSpy = jest.spyOn(Navigation, 'goBack').mockImplementation((_backToRoute, options) => options?.afterTransition?.());

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${invoiceRoomID}`, chatReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${invoiceReportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${invoiceReportID}`, {[iouActionID]: iouAction});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
        });
        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => useExpenseActions({reportID: invoiceReportID, isReportInSearch: false, backTo: undefined}), {wrapper});
        await waitFor(() => {
            expect(result.current.actions[CONST.REPORT.SECONDARY_ACTIONS.DELETE]).toBeDefined();
        });

        // When Delete is selected and the report navigation finishes
        jest.useFakeTimers();
        await act(async () => {
            await result.current.actions[CONST.REPORT.SECONDARY_ACTIONS.DELETE]?.onSelected?.();
            jest.runAllTimers();
        });
        jest.useRealTimers();
        goBackSpy.mockRestore();

        // Then the report-level delete path is used so the card expense becomes unreported
        expect(mockShowConfirmModalAfterMoreMenuDismiss).toHaveBeenCalledWith(
            expect.any(Function),
            expect.objectContaining({prompt: 'Are you sure that you want to delete this report? All expenses in this report will become unreported.'}),
        );
        expect(mockDeleteTransactions).not.toHaveBeenCalled();
        expect(mockDeleteAppReport).toHaveBeenCalledWith(expect.objectContaining({report}));
    });
});
