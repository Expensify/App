import {act, renderHook, waitFor} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {useMoneyReportTransactionThread} from '@components/MoneyReportTransactionThreadContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useExpenseActions from '@hooks/useExpenseActions';

import initOnyxDerivedValues from '@libs/actions/OnyxDerived';

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

// The actual server delete is out of scope; assert on the navigate-back URL the delete writes, not the deletion itself.
jest.mock('@hooks/useDeleteTransactions', () => ({
    __esModule: true,
    default: () => ({deleteTransactions: jest.fn(() => ({action: 'deleted', deletedTransactionThreadReportIDs: []})), shouldOpenSplitExpenseEditFlowOnDelete: () => false}),
}));

// Keep all of ReportUtils real (we rely on the real isInvoiceReport) except navigateOnDeleteExpense, which we no-op so
// the delete stops right after writing the back URL (its afterTransition callback and real navigation don't run).
jest.mock('@libs/ReportUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualReportUtils = jest.requireActual('@libs/ReportUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {...actualReportUtils, __esModule: true, navigateOnDeleteExpense: jest.fn()};
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

describe('useExpenseActions - invoice delete on the /e/:reportID (expense report) page', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
        initOnyxDerivedValues();
        return waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        jest.clearAllMocks();
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
});
