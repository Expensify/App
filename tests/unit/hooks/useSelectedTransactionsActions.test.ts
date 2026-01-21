/* eslint-disable @typescript-eslint/naming-convention */
import {act, renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {SelectedTransactions} from '@components/Search/types';
import useSelectedTransactionsActions from '@hooks/useSelectedTransactionsActions';
import {initSplitExpense} from '@libs/actions/IOU';
import {unholdRequest} from '@libs/actions/IOU/Hold';
import {setupMergeTransactionDataAndNavigate} from '@libs/actions/MergeTransaction';
import {exportReportToCSV} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReportAction, Session} from '@src/types/onyx';
import createRandomPolicy from '../../utils/collections/policies';
import createRandomReportAction from '../../utils/collections/reportActions';
import {createRandomReport} from '../../utils/collections/reports';
import createRandomTransaction from '../../utils/collections/transaction';

// Mock dependencies
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    removeReportScreen: jest.fn(),
    getActiveRoute: jest.fn(() => '/test'),
}));

jest.mock('@libs/actions/Search', () => ({
    getExportTemplates: jest.fn(() => []),
}));

jest.mock('@libs/actions/IOU', () => ({
    initSplitExpense: jest.fn(),
}));

jest.mock('@libs/actions/IOU/Hold', () => ({
    unholdRequest: jest.fn(),
}));

jest.mock('@libs/actions/MergeTransaction', () => ({
    setupMergeTransactionDataAndNavigate: jest.fn(),
}));

jest.mock('@libs/actions/Report', () => ({
    exportReportToCSV: jest.fn(),
    getCurrentUserEmail: jest.fn(() => 'test@example.com'),
}));

const mockTranslate = jest.fn((key: string) => key);
const mockLocalCompare = jest.fn((a: string, b: string) => a && b);

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: mockTranslate,
        localeCompare: mockLocalCompare,
    }),
}));

const mockClearSelectedTransactions = jest.fn();
const mockSelectedTransactionIDs: string[] = [];
const mockSelectedTransactions: SelectedTransactions = {};
const mockCurrentSearchHash = 12345;

jest.mock('@components/Search/SearchContext', () => ({
    useSearchContext: () => ({
        selectedTransactionIDs: mockSelectedTransactionIDs,
        clearSelectedTransactions: mockClearSelectedTransactions,
        currentSearchHash: mockCurrentSearchHash,
        selectedTransactions: mockSelectedTransactions,
    }),
}));

const mockDuplicateTransactions: string[] = [];
const mockDuplicateTransactionViolations: string[] = [];

jest.mock('@hooks/useDuplicateTransactionsAndViolations', () => ({
    __esModule: true,
    default: () => ({
        duplicateTransactions: mockDuplicateTransactions,
        duplicateTransactionViolations: mockDuplicateTransactionViolations,
    }),
}));

const mockIsReportArchived = false;

jest.mock('@hooks/useReportIsArchived', () => ({
    __esModule: true,
    default: () => mockIsReportArchived,
}));

const mockDeleteTransactions = jest.fn(() => []);

jest.mock('@hooks/useDeleteTransactions', () => ({
    __esModule: true,
    default: () => ({
        deleteTransactions: mockDeleteTransactions,
    }),
}));

let mockIsOffline = false;

jest.mock('@hooks/useNetworkWithOfflineStatus', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        isOffline: mockIsOffline,
    })),
}));
const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_LOGIN = 'test@example.com';
jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(() => ({
        login: CURRENT_USER_LOGIN,
        accountID: CURRENT_USER_ACCOUNT_ID,
    })),
}));

describe('useSelectedTransactionsActions', () => {
    const mockBeginExportWithTemplate = jest.fn();
    const mockOnExportFailed = jest.fn();
    const mockOnExportOffline = jest.fn();

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        mockSelectedTransactionIDs.length = 0;
        for (const key of Object.keys(mockSelectedTransactions)) {
            delete mockSelectedTransactions[key];
        }
        mockIsOffline = false;
    });

    afterEach(async () => {
        jest.restoreAllMocks();
        await Onyx.clear();
    });

    it('should return empty options when no transactions are selected', () => {
        const report = createRandomReport(1, undefined);
        const reportActions: ReportAction[] = [];

        const {result} = renderHook(() =>
            useSelectedTransactionsActions({
                report,
                reportActions,
                allTransactionsLength: 0,
                beginExportWithTemplate: mockBeginExportWithTemplate,
            }),
        );

        expect(result.current.options).toEqual([]);
        expect(result.current.isDeleteModalVisible).toBe(false);
    });

    it('should return export option when transactions are selected', async () => {
        const transactionID = '123';
        const report = createRandomReport(1, undefined);
        const reportActions: ReportAction[] = [];
        const transaction = createRandomTransaction(1);
        transaction.transactionID = transactionID;

        mockSelectedTransactionIDs.push(transactionID);

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);

        const {result} = renderHook(() =>
            useSelectedTransactionsActions({
                report,
                reportActions,
                allTransactionsLength: 1,
                beginExportWithTemplate: mockBeginExportWithTemplate,
            }),
        );

        await waitFor(() => {
            expect(result.current.options.length).toBeGreaterThan(0);
        });

        const exportOption = result.current.options.find((option) => option.value === CONST.REPORT.SECONDARY_ACTIONS.EXPORT);
        expect(exportOption).toBeDefined();
        expect(exportOption?.text).toBe('common.export');
    });

    it('should show edit multiple option when multiple transactions are editable', async () => {
        const transactionID1 = '123';
        const transactionID2 = '456';
        const report = createRandomReport(1, undefined);
        const reportActions: ReportAction[] = [];
        const transaction1 = createRandomTransaction(1);
        transaction1.transactionID = transactionID1;
        transaction1.amount = 1000;
        const transaction2 = createRandomTransaction(2);
        transaction2.transactionID = transactionID2;
        transaction2.amount = 2000;

        mockSelectedTransactionIDs.push(transactionID1, transactionID2);

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID1}`, transaction1);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID2}`, transaction2);
        });

        jest.spyOn(require('@libs/ReportUtils'), 'canEditMultipleTransactions').mockReturnValue(true);

        const {result} = renderHook(() =>
            useSelectedTransactionsActions({
                report,
                reportActions,
                allTransactionsLength: 2,
                beginExportWithTemplate: mockBeginExportWithTemplate,
            }),
        );

        await waitFor(() => {
            expect(result.current.options.length).toBeGreaterThan(0);
        });

        const editOption = result.current.options.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.EDIT);
        expect(editOption).toBeDefined();

        editOption?.onSelected?.();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_EDIT_MULTIPLE_TRANSACTIONS_RHP);
    });

    it('should handle basic export when online', async () => {
        const transactionID = '123';
        const report = createRandomReport(1, undefined);
        report.reportID = 'report123';
        const reportActions: ReportAction[] = [];
        const transaction = createRandomTransaction(1);
        transaction.transactionID = transactionID;

        mockSelectedTransactionIDs.push(transactionID);

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);

        const {result} = renderHook(() =>
            useSelectedTransactionsActions({
                report,
                reportActions,
                allTransactionsLength: 1,
                beginExportWithTemplate: mockBeginExportWithTemplate,
                onExportFailed: mockOnExportFailed,
            }),
        );

        await waitFor(() => {
            expect(result.current.options.length).toBeGreaterThan(0);
        });

        const exportOption = result.current.options.find((option) => option.value === CONST.REPORT.SECONDARY_ACTIONS.EXPORT);
        expect(exportOption).toBeDefined();
        expect(exportOption?.subMenuItems).toBeDefined();

        const basicExportOption = exportOption?.subMenuItems?.find((item) => item.text === 'export.basicExport');
        expect(basicExportOption).toBeDefined();

        basicExportOption?.onSelected?.();

        expect(exportReportToCSV).toHaveBeenCalledTimes(1);
        const mockExportReportToCSV = exportReportToCSV as jest.MockedFunction<typeof exportReportToCSV>;
        const exportCall = mockExportReportToCSV.mock.calls.at(0);
        expect(exportCall).toBeDefined();
        if (!exportCall) {
            throw new Error('exportReportToCSV was not called');
        }
        expect(exportCall[0]).toEqual({
            reportID: report.reportID,
            transactionIDList: [transactionID],
        });

        const onDownloadFailed = exportCall[1];
        expect(typeof onDownloadFailed).toBe('function');
        onDownloadFailed();
        expect(mockOnExportFailed).toHaveBeenCalledTimes(1);

        expect(mockClearSelectedTransactions).toHaveBeenCalledWith(true);
    });

    it('should handle export offline callback when offline', async () => {
        const transactionID = '123';
        const report = createRandomReport(1, undefined);
        report.reportID = 'report123';
        const reportActions: ReportAction[] = [];
        const transaction = createRandomTransaction(1);
        transaction.transactionID = transactionID;

        mockSelectedTransactionIDs.push(transactionID);

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);

        // Mock offline status by changing the mock variable
        mockIsOffline = true;

        const {result} = renderHook(() =>
            useSelectedTransactionsActions({
                report,
                reportActions,
                allTransactionsLength: 1,
                beginExportWithTemplate: mockBeginExportWithTemplate,
                onExportOffline: mockOnExportOffline,
            }),
        );

        await waitFor(() => {
            expect(result.current.options.length).toBeGreaterThan(0);
        });

        const exportOption = result.current.options.find((option) => option.value === CONST.REPORT.SECONDARY_ACTIONS.EXPORT);
        const basicExportOption = exportOption?.subMenuItems?.find((item) => item.text === 'export.basicExport');
        basicExportOption?.onSelected?.();

        expect(mockOnExportOffline).toHaveBeenCalled();
        expect(exportReportToCSV).not.toHaveBeenCalled();
    });

    it('should show delete option when transactions can be deleted', async () => {
        const transactionID = '123';
        const report = createRandomReport(1, undefined);
        const session: Session = {accountID: 1};
        const reportActions: ReportAction[] = [
            {
                ...createRandomReportAction(1),
                reportActionID: 'action1',
                actorAccountID: 1,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUReportID: 'iou123',
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    transactionID,
                },
            },
        ];
        const transaction = createRandomTransaction(1);
        transaction.transactionID = transactionID;
        transaction.reportID = report.reportID;

        mockSelectedTransactionIDs.push(transactionID);

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);

        jest.spyOn(require('@libs/ReportUtils'), 'canDeleteCardTransactionByLiabilityType').mockReturnValue(true);
        jest.spyOn(require('@libs/ReportUtils'), 'canDeleteTransaction').mockReturnValue(true);
        jest.spyOn(require('@libs/ReportActionsUtils'), 'isDeletedAction').mockReturnValue(false);
        jest.spyOn(require('@libs/ReportActionsUtils'), 'getIOUActionForTransactionID').mockReturnValue(reportActions.at(0) as OnyxEntry<ReportAction>);

        const {result} = renderHook(() =>
            useSelectedTransactionsActions({
                report,
                reportActions,
                allTransactionsLength: 1,
                session,
                beginExportWithTemplate: mockBeginExportWithTemplate,
            }),
        );

        await waitFor(() => {
            expect(result.current.options.length).toBeGreaterThan(0);
        });

        const deleteOption = result.current.options.find((option) => option.value === CONST.REPORT.SECONDARY_ACTIONS.DELETE);
        expect(deleteOption).toBeDefined();
        expect(deleteOption?.text).toBe('common.delete');
    });

    it('should handle delete transactions', async () => {
        const transactionID = '123';
        const report = createRandomReport(1, undefined);
        const reportActions: ReportAction[] = [];
        const transaction = createRandomTransaction(1);
        transaction.transactionID = transactionID;

        mockSelectedTransactionIDs.push(transactionID);
        (mockDeleteTransactions as jest.Mock<string[]>).mockReturnValue(['report1', 'report2']);

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);

        const {result} = renderHook(() =>
            useSelectedTransactionsActions({
                report,
                reportActions,
                allTransactionsLength: 1,
                beginExportWithTemplate: mockBeginExportWithTemplate,
            }),
        );

        result.current.handleDeleteTransactions();

        expect(mockDeleteTransactions).toHaveBeenCalledWith([transactionID], mockDuplicateTransactions, mockDuplicateTransactionViolations, mockCurrentSearchHash, false);
        expect(mockClearSelectedTransactions).toHaveBeenCalledWith(true);
        expect(Navigation.removeReportScreen).toHaveBeenCalledWith(new Set(['report1', 'report2']));
        expect(result.current.isDeleteModalVisible).toBe(false);
    });

    it('should show and hide delete modal', async () => {
        const report = createRandomReport(1, undefined);
        const reportActions: ReportAction[] = [];

        const {result} = renderHook(() =>
            useSelectedTransactionsActions({
                report,
                reportActions,
                allTransactionsLength: 0,
                beginExportWithTemplate: mockBeginExportWithTemplate,
            }),
        );

        expect(result.current.isDeleteModalVisible).toBe(false);

        result.current.showDeleteModal();
        await waitFor(() => {
            expect(result.current.isDeleteModalVisible).toBe(true);
        });

        result.current.hideDeleteModal();
        await waitFor(() => {
            expect(result.current.isDeleteModalVisible).toBe(false);
        });
    });

    it('should show hold option for money request report', async () => {
        const transactionID = '123';
        const report = createRandomReport(1, undefined);
        report.type = CONST.REPORT.TYPE.EXPENSE;
        const reportActions: ReportAction[] = [
            {
                ...createRandomReportAction(1),
                reportActionID: 'action1',
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUReportID: 'iou123',
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    transactionID,
                },
            },
        ];
        const transaction = createRandomTransaction(1);
        transaction.transactionID = transactionID;

        mockSelectedTransactionIDs.push(transactionID);

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);

        jest.spyOn(require('@libs/ReportUtils'), 'isMoneyRequestReport').mockReturnValue(true);
        jest.spyOn(require('@libs/ReportUtils'), 'canHoldUnholdReportAction').mockReturnValue({
            canHoldRequest: true,
            canUnholdRequest: false,
        });

        const {result} = renderHook(() =>
            useSelectedTransactionsActions({
                report,
                reportActions,
                allTransactionsLength: 1,
                beginExportWithTemplate: mockBeginExportWithTemplate,
            }),
        );

        await waitFor(() => {
            expect(result.current.options.length).toBeGreaterThan(0);
        });

        const holdOption = result.current.options.find((option) => option.value === 'HOLD');
        expect(holdOption).toBeDefined();
        expect(holdOption?.text).toBe('iou.hold');
    });

    it('should handle hold navigation', async () => {
        const transactionID = '123';
        const report = createRandomReport(1, undefined);
        report.reportID = 'report123';
        report.type = CONST.REPORT.TYPE.EXPENSE;
        const reportActions: ReportAction[] = [
            {
                ...createRandomReportAction(1),
                reportActionID: 'action1',
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUReportID: 'iou123',
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    transactionID,
                },
            },
        ];
        const transaction = createRandomTransaction(1);
        transaction.transactionID = transactionID;

        mockSelectedTransactionIDs.push(transactionID);

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);

        jest.spyOn(require('@libs/ReportUtils'), 'isMoneyRequestReport').mockReturnValue(true);
        jest.spyOn(require('@libs/ReportUtils'), 'canHoldUnholdReportAction').mockReturnValue({
            canHoldRequest: true,
            canUnholdRequest: false,
        });

        const {result} = renderHook(() =>
            useSelectedTransactionsActions({
                report,
                reportActions,
                allTransactionsLength: 1,
                beginExportWithTemplate: mockBeginExportWithTemplate,
            }),
        );

        await waitFor(() => {
            expect(result.current.options.length).toBeGreaterThan(0);
        });

        const holdOption = result.current.options.find((option) => option.value === 'HOLD');
        holdOption?.onSelected?.();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS.getRoute({reportID: report.reportID}));
    });

    it('should show unhold option and handle unhold action', async () => {
        const transactionID = '123';
        const report = createRandomReport(1, undefined);
        report.type = CONST.REPORT.TYPE.EXPENSE;
        const reportActions: ReportAction[] = [
            {
                ...createRandomReportAction(1),
                reportActionID: 'action1',
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                childReportID: 'child123',
                originalMessage: {
                    IOUReportID: 'iou123',
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    transactionID,
                },
            },
        ];
        const transaction = createRandomTransaction(1);
        transaction.transactionID = transactionID;

        mockSelectedTransactionIDs.push(transactionID);

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);

        jest.spyOn(require('@libs/ReportUtils'), 'isMoneyRequestReport').mockReturnValue(true);
        jest.spyOn(require('@libs/ReportUtils'), 'canHoldUnholdReportAction').mockReturnValue({
            canHoldRequest: false,
            canUnholdRequest: true,
        });
        jest.spyOn(require('@libs/ReportActionsUtils'), 'getIOUActionForTransactionID').mockReturnValue(reportActions.at(0) as OnyxEntry<ReportAction>);

        const {result} = renderHook(() =>
            useSelectedTransactionsActions({
                report,
                reportActions,
                allTransactionsLength: 1,
                beginExportWithTemplate: mockBeginExportWithTemplate,
            }),
        );

        await waitFor(() => {
            expect(result.current.options.length).toBeGreaterThan(0);
        });

        const unholdOption = result.current.options.find((option) => option.value === 'UNHOLD');
        expect(unholdOption).toBeDefined();
        expect(unholdOption?.text).toBe('iou.unhold');

        unholdOption?.onSelected?.();

        expect(unholdRequest).toHaveBeenCalledWith(transactionID, 'child123', undefined);
        expect(mockClearSelectedTransactions).toHaveBeenCalledWith(true);
    });

    it('should show move option when transactions can be moved', async () => {
        const transactionID = '123';
        const report = createRandomReport(1, undefined);
        report.type = CONST.REPORT.TYPE.EXPENSE;
        const reportActions: ReportAction[] = [
            {
                ...createRandomReportAction(1),
                reportActionID: 'action1',
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUReportID: 'iou123',
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    transactionID,
                },
            },
        ];
        const transaction = createRandomTransaction(1);
        transaction.transactionID = transactionID;
        transaction.reportID = report.reportID;

        mockSelectedTransactionIDs.push(transactionID);

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);

        jest.spyOn(require('@libs/ReportUtils'), 'canEditFieldOfMoneyRequest').mockReturnValue(true);
        jest.spyOn(require('@libs/ReportUtils'), 'canUserPerformWriteAction').mockReturnValue(true);

        const {result} = renderHook(() =>
            useSelectedTransactionsActions({
                report,
                reportActions,
                allTransactionsLength: 1,
                beginExportWithTemplate: mockBeginExportWithTemplate,
            }),
        );

        await waitFor(() => {
            expect(result.current.options.length).toBeGreaterThan(0);
        });

        const moveOption = result.current.options.find((option) => option.value === 'MOVE');
        expect(moveOption).toBeDefined();
        expect(moveOption?.text).toBe('iou.moveExpenses');
    });

    it('should show split option when transaction can be split', async () => {
        const transactionID = '123';
        const report = {
            ...createRandomReport(1, undefined),
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        };
        const policy = {
            ...createRandomPolicy(1),
            isPolicyExpenseChatEnabled: true,
            role: CONST.POLICY.ROLE.ADMIN,
            employeeList: {
                [CURRENT_USER_LOGIN]: {role: CONST.POLICY.ROLE.ADMIN},
            },
        };
        const reportActions: ReportAction[] = [];
        const transaction = {
            ...createRandomTransaction(1),
            transactionID,
            amount: 1000,
            status: CONST.TRANSACTION.STATUS.POSTED,
        };

        mockSelectedTransactionIDs.push(transactionID);

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID});

        jest.spyOn(require('@libs/TransactionUtils'), 'getOriginalTransactionWithSplitInfo').mockReturnValue({
            isBillSplit: false,
            isExpenseSplit: false,
            originalTransaction: transaction,
        });

        const {result} = renderHook(() =>
            useSelectedTransactionsActions({
                report,
                reportActions,
                allTransactionsLength: 1,
                policy,
                beginExportWithTemplate: mockBeginExportWithTemplate,
            }),
        );

        await waitFor(() => {
            expect(result.current.options.length).toBeGreaterThan(0);
        });

        const splitOption = result.current.options.find((option) => option.value === 'SPLIT');
        expect(splitOption).toBeDefined();
        expect(splitOption?.text).toBe('iou.split');

        splitOption?.onSelected?.();

        expect(initSplitExpense).toHaveBeenCalled();
    });

    it('should show merge option when transaction can be merged', async () => {
        const transactionID = '123';
        const report = createRandomReport(1, undefined);
        report.type = CONST.REPORT.TYPE.EXPENSE;
        report.statusNum = 0;
        report.stateNum = 0;
        const policy = createRandomPolicy(1);
        const reportActions: ReportAction[] = [];
        const transaction = createRandomTransaction(1);
        transaction.transactionID = transactionID;
        transaction.managedCard = false;
        transaction.cardName = CONST.EXPENSE.TYPE.CASH_CARD_NAME;

        mockSelectedTransactionIDs.push(transactionID);

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);

        jest.spyOn(require('@libs/ReportSecondaryActionUtils'), 'isMergeActionForSelectedTransactions').mockReturnValue(true);

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: 1});
        const {result} = renderHook(() =>
            useSelectedTransactionsActions({
                report,
                reportActions,
                allTransactionsLength: 1,
                policy,
                beginExportWithTemplate: mockBeginExportWithTemplate,
                isOnSearch: false,
            }),
        );

        await waitFor(() => {
            expect(result.current.options.length).toBeGreaterThan(0);
        });

        const mergeOption = result.current.options.find((option) => option.value === 'MERGE');
        expect(mergeOption).toBeDefined();
        expect(mergeOption?.text).toBe('common.merge');

        mergeOption?.onSelected?.();

        expect(setupMergeTransactionDataAndNavigate).toHaveBeenCalledWith(transaction.transactionID, [transaction], mockLocalCompare, [], false, false);
    });
});
