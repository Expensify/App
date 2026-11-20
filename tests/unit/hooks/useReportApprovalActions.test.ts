import {act, renderHook} from '@testing-library/react-native';

import {ModalActions} from '@components/Modal/Global/ModalContext';

import useHoldMenuSubmit from '@hooks/useHoldMenuSubmit';
import useLifecycleActions from '@hooks/useLifecycleActions';
import useReportTransactions from '@hooks/useReportTransactions';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';

import {approveMoneyRequest} from '@userActions/IOU/ReportWorkflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomTransaction from '../../utils/collections/transaction';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@userActions/IOU/ReportWorkflow', () => ({approveMoneyRequest: jest.fn()}));
jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    useDelegateNoAccessState: () => ({isDelegateAccessRestricted: false}),
    useDelegateNoAccessActions: () => ({showDelegateNoAccessModal: jest.fn()}),
}));
jest.mock('@components/LockedAccountModalProvider', () => ({
    useLockedAccountState: () => ({isAccountLocked: false}),
    useLockedAccountActions: () => ({showLockedAccountModal: jest.fn()}),
}));
jest.mock('@components/ReportSubmitToPopoverAnchor', () => ({useOpenReportSubmitToPopover: () => jest.fn()}));
const mockClearSelectedTransactions = jest.fn();
jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => ({}),
    useSearchResultsContext: () => ({}),
    useSearchSelectionContext: () => ({selectedTransactionIDs: []}),
    useSearchSelectionActions: () => ({clearSelectedTransactions: mockClearSelectedTransactions}),
}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({getCurrencyDecimals: () => 2})}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({__esModule: true, default: () => ({accountID: 1, email: 'approver@test.com'})}));
jest.mock('@hooks/usePermissions', () => ({__esModule: true, default: () => ({isBetaEnabled: () => false})}));
jest.mock('@hooks/useDelegateAccountID', () => ({__esModule: true, default: () => undefined}));
jest.mock('@hooks/useTransactionsAndViolationsForReport', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@hooks/useReportTransactions', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@hooks/usePersonalDetailByLogin', () => ({useGetPersonalDetailsByLogin: () => () => ({}), usePersonalDetailsByLogins: () => ({})}));
jest.mock('@hooks/usePersonalDetails', () => ({usePersonalDetail: () => [undefined]}));
jest.mock('@hooks/usePaginatedReportActions', () => ({__esModule: true, default: () => ({reportActions: []})}));
jest.mock('@hooks/useStrictPolicyRules', () => ({__esModule: true, default: () => ({areStrictPolicyRulesEnabled: false})}));
jest.mock('@hooks/useReportIsArchived', () => ({__esModule: true, default: () => false}));
jest.mock('@hooks/useSearchShouldCalculateTotals', () => ({__esModule: true, default: () => false}));
jest.mock('@hooks/useShouldReturnTripRooms', () => ({__esModule: true, default: () => false}));
jest.mock('@hooks/useNetwork', () => ({__esModule: true, default: () => ({isOffline: false})}));
jest.mock('@hooks/useThemeStyles', () => ({__esModule: true, default: () => ({})}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({})}));
jest.mock('@hooks/usePayChatReportActions', () => ({__esModule: true, default: () => jest.fn()}));
jest.mock('@hooks/usePayWithWiseQuote', () => ({__esModule: true, default: () => ({payWithWiseQuote: jest.fn()})}));
const mockShowConfirmModal = jest.fn();
jest.mock('@hooks/useConfirmModal', () => ({__esModule: true, default: () => ({showConfirmModal: mockShowConfirmModal})}));
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: () => ({translate: (key: string) => key})}));
jest.mock('@libs/showConfirmModalAfterMoreMenuDismiss', () => ({
    __esModule: true,
    default: (showConfirmModal: (options: unknown) => Promise<unknown>, options: unknown) => showConfirmModal(options),
}));

const REPORT_ID = '1001';
const report: Report = {reportID: REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'};
const unheldTransaction: Transaction = {...createRandomTransaction(1), transactionID: 'A', reportID: REPORT_ID, amount: -100, comment: {}};
const heldTransaction: Transaction = {...createRandomTransaction(2), transactionID: 'B', reportID: REPORT_ID, amount: -200, comment: {hold: 'holdReportActionID'}};
const violation = {name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION, type: CONST.VIOLATION_TYPES.WARNING};
const violations = {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${unheldTransaction.transactionID}`]: [violation]};
const mockedApproveMoneyRequest = jest.mocked(approveMoneyRequest);

beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
    return waitForBatchedUpdates();
});

beforeEach(async () => {
    jest.clearAllMocks();
    mockShowConfirmModal.mockReset().mockResolvedValue({action: ModalActions.CLOSE});
    jest.mocked(useTransactionsAndViolationsForReport).mockReturnValue({
        transactions: {[`${ONYXKEYS.COLLECTION.TRANSACTION}${unheldTransaction.transactionID}`]: unheldTransaction},
        violations,
        isLoaded: true,
    });
    jest.mocked(useReportTransactions).mockReturnValue([unheldTransaction, heldTransaction]);
    await Onyx.clear();
    await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
    await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${unheldTransaction.transactionID}`, [violation]);
    await waitForBatchedUpdates();
});

describe('useLifecycleActions approval confirmation', () => {
    describe.each([false, true])('skipAnimation=%s', (skipAnimation) => {
        it.each([ModalActions.CLOSE, ModalActions.CONFIRM])('gates approval, animation, and selection cleanup on %s', async (action) => {
            // Given a selected report with a warning, using the real approval confirmation hook
            mockShowConfirmModal.mockResolvedValue({action});
            const startApprovedAnimation = jest.fn();
            const startAnimation = jest.fn();
            const startSubmittingAnimation = jest.fn();
            const onCleanup = jest.fn();
            const {result} = renderHook(() =>
                useLifecycleActions({reportID: REPORT_ID, startApprovedAnimation, startAnimation, startSubmittingAnimation, onHoldMenuOpen: jest.fn(), onCleanup}),
            );
            await act(waitForBatchedUpdates);

            // When approval is requested, all side effects must wait for the warning modal
            await act(async () => {
                result.current.confirmApproval(skipAnimation);
                expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
                expect(mockedApproveMoneyRequest).not.toHaveBeenCalled();
                expect(startApprovedAnimation).not.toHaveBeenCalled();
                expect(mockClearSelectedTransactions).not.toHaveBeenCalled();
                expect(onCleanup).not.toHaveBeenCalled();
            });

            // Then cancellation preserves selection, while confirmation retains each caller's animation and cleanup behavior
            const isConfirmed = action === ModalActions.CONFIRM;
            expect(mockedApproveMoneyRequest).toHaveBeenCalledTimes(isConfirmed ? 1 : 0);
            expect(startApprovedAnimation).toHaveBeenCalledTimes(isConfirmed && !skipAnimation ? 1 : 0);
            expect(mockClearSelectedTransactions).toHaveBeenCalledTimes(isConfirmed && skipAnimation ? 1 : 0);
            expect(onCleanup).toHaveBeenCalledTimes(isConfirmed && skipAnimation ? 1 : 0);
            expect(startAnimation).not.toHaveBeenCalled();
            expect(startSubmittingAnimation).not.toHaveBeenCalled();
            if (!isConfirmed) {
                return;
            }
            expect(mockedApproveMoneyRequest).toHaveBeenCalledWith(expect.objectContaining({expenseReport: report, full: true}));
            if (skipAnimation) {
                expect(mockClearSelectedTransactions).toHaveBeenCalledWith(true);
            }
            act(() => mockedApproveMoneyRequest.mock.calls.at(0)?.at(0)?.onApproved?.());
            expect(startApprovedAnimation).toHaveBeenCalledTimes(skipAnimation ? 0 : 2);
            expect(mockClearSelectedTransactions).toHaveBeenCalledTimes(skipAnimation ? 1 : 0);
            expect(onCleanup).toHaveBeenCalledTimes(skipAnimation ? 1 : 0);
        });
    });
});

describe('useHoldMenuSubmit approval confirmation', () => {
    describe.each([false, true])('full=%s', (full) => {
        it.each([ModalActions.CLOSE, ModalActions.CONFIRM])('gates approval and its completion callback on %s', async (action) => {
            // Given a hold menu with an unheld expense warning, so both partial and full approval require confirmation
            mockShowConfirmModal.mockResolvedValue({action});
            const onConfirm = jest.fn();
            const onClose = jest.fn();
            const {result} = renderHook(() => useHoldMenuSubmit({moneyRequestReport: report, chatReport: undefined, requestType: CONST.IOU.REPORT_ACTION_TYPE.APPROVE, onClose, onConfirm}));
            await act(waitForBatchedUpdates);

            // When the user chooses the scope, the hold menu closes but approval must wait for the warning
            await act(async () => {
                result.current.onSubmit(full);
                expect(onClose).toHaveBeenCalledTimes(1);
                expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
                expect(mockedApproveMoneyRequest).not.toHaveBeenCalled();
                expect(onConfirm).not.toHaveBeenCalled();
            });

            // Then only confirmation approves, and the animation callback runs only when approval completes
            expect(mockedApproveMoneyRequest).toHaveBeenCalledTimes(action === ModalActions.CONFIRM ? 1 : 0);
            expect(onConfirm).not.toHaveBeenCalled();
            if (action !== ModalActions.CONFIRM) {
                return;
            }
            expect(mockedApproveMoneyRequest).toHaveBeenCalledWith(expect.objectContaining({expenseReport: report, full}));
            act(() => mockedApproveMoneyRequest.mock.calls.at(0)?.at(0)?.onApproved?.());
            expect(onConfirm).toHaveBeenCalledTimes(1);
            expect(onConfirm).toHaveBeenCalledWith(full);
        });

        it('excludes held expense warnings only for partial approval', async () => {
            // Given a report whose only warning belongs to a held expense
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${unheldTransaction.transactionID}`, []);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${heldTransaction.transactionID}`, [violation]);
            const {result} = renderHook(() => useHoldMenuSubmit({moneyRequestReport: report, chatReport: undefined, requestType: CONST.IOU.REPORT_ACTION_TYPE.APPROVE, onClose: jest.fn()}));
            await act(waitForBatchedUpdates);

            // When approval is requested, held warnings must not block approval of only the unheld expenses
            await act(async () => result.current.onSubmit(full));

            // Then full approval still warns, while partial approval proceeds without a warning and forwards its scope
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(full ? 1 : 0);
            expect(mockedApproveMoneyRequest).toHaveBeenCalledTimes(full ? 0 : 1);
            if (!full) {
                expect(mockedApproveMoneyRequest).toHaveBeenCalledWith(expect.objectContaining({full: false}));
            }
        });
    });
});
