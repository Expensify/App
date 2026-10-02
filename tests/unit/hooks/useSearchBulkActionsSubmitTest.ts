import {act, renderHook, waitFor} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SearchQueryJSON, SelectedReports, SelectedTransactions} from '@components/Search/types';

import useSearchBulkActions from '@hooks/useSearchBulkActions';

import {submitMoneyRequestOnSearch} from '@libs/actions/Search';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolation} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import type * as MockUsePaymentContextUtil from '../../utils/mockUsePaymentContext';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const mockSubmitMoneyRequestOnSearch = jest.mocked(submitMoneyRequestOnSearch);

jest.mock('@libs/actions/SplitExpenses.ts', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@libs/actions/Report', () => ({
    deleteAppReport: jest.fn(),
    moveIOUReportToPolicy: jest.fn(),
    moveIOUReportToPolicyAndInviteSubmitter: jest.fn(),
    exportReportToPDF: jest.fn(),
    markAsManuallyExported: jest.fn(),
}));

jest.mock('@libs/actions/Search', () => ({
    getExportTemplates: jest.fn(() => ({customTemplates: [], defaultTemplates: []})),
    exportSearchItemsToCSV: jest.fn(),
    queueExportSearchItemsToCSV: jest.fn(),
    queueExportSearchWithTemplate: jest.fn(),
    getSearchApproveOnyxData: jest.fn(() => ({})),
    getSearchPayOnyxData: jest.fn(() => ({})),
    getLastPolicyBankAccountID: jest.fn(),
    getLastPolicyPaymentMethod: jest.fn(),
    getPayMoneyOnSearchInvoiceParams: jest.fn(),
    getPayOption: jest.fn(() => ({shouldEnableBulkPayOption: false, isFirstTimePayment: false})),
    getReportFromSearchSnapshot: jest.fn(),
    getReportType: jest.fn(),
    getTotalFormattedAmount: jest.fn(() => ''),
    isCurrencySupportWalletBulkPay: jest.fn(() => false),
    payMoneyRequestOnSearch: jest.fn(),
    submitMoneyRequestOnSearch: jest.fn(),
    unholdMoneyRequestOnSearch: jest.fn(),
}));

jest.mock('@libs/actions/MergeTransaction', () => ({
    setupMergeTransactionDataAndNavigate: jest.fn(),
}));

jest.mock('@libs/actions/User', () => ({
    setNameValuePair: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => '/test'),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: (key: string) => key,
        localeCompare: (a: string, b: string) => a && b,
        formatPhoneNumber: (phone: string) => phone,
    }),
}));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({colorMuted: {}, fontWeightNormal: {}, textWrap: {}}),
}));

jest.mock('@hooks/useTheme', () => ({
    __esModule: true,
    default: () => ({icon: ''}),
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: false}),
}));

jest.mock('@hooks/useEnvironment', () => ({
    __esModule: true,
    default: () => ({isProduction: true, isDevelopment: false, environment: 'production'}),
}));

jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    useDelegateNoAccessState: () => ({isDelegateAccessRestricted: false}),
    useDelegateNoAccessActions: () => ({showDelegateNoAccessModal: jest.fn()}),
}));

const mockShowConfirmModal = jest.fn<Promise<{action: string}>, [{prompt?: unknown}]>();
jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: mockShowConfirmModal}),
}));

const mockOpenSearchReportSubmitToPopover = jest.fn();
jest.mock('@components/ReportSubmitToPopoverAnchor', () => ({
    useOpenSearchReportSubmitToPopover: () => mockOpenSearchReportSubmitToPopover,
}));

jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: () => false, isBetaEnabledOrUnknown: () => false}),
}));

jest.mock('@hooks/useSelfDMReport', () => ({
    __esModule: true,
    default: () => undefined,
}));

jest.mock('@hooks/useBulkPayOptions', () => ({
    __esModule: true,
    default: () => ({bulkPayButtonOptions: [], latestBankItems: []}),
}));

jest.mock('@hooks/useDefaultExpensePolicy', () => ({
    __esModule: true,
    default: () => undefined,
}));

jest.mock('@hooks/usePolicyForMovingExpenses', () => ({
    __esModule: true,
    default: () => ({policyForMovingExpensesID: undefined}),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({}),
}));

jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({
        getCurrencyDecimals: jest.fn(() => 2),
        convertToDisplayString: jest.fn((amount: number) => `$${amount}`),
    }),
}));

jest.mock('@hooks/useUndeleteTransactions', () => ({
    __esModule: true,
    default: () => jest.fn(),
}));

jest.mock('@hooks/useDuplicateTransactionsAndViolations', () => ({
    __esModule: true,
    default: () => ({duplicateTransactions: {}, duplicateTransactionViolations: {}}),
}));

// Run TransitionTracker callbacks immediately, there is no real modal transition to wait for in a unit test.
jest.mock('@libs/Navigation/TransitionTracker', () => ({
    __esModule: true,
    default: {
        runAfterTransitions: ({callback}: {callback: () => void | Promise<void>}) => {
            callback();
            return {cancel: jest.fn()};
        },
        startTransition: jest.fn(),
        endTransition: jest.fn(),
    },
}));

// ---------------------------------------------------------------------------
// Mutable context state
// ---------------------------------------------------------------------------

const mockClearSelectedTransactions = jest.fn();
const mockSelectAllMatchingItems = jest.fn();
let mockSelectedReports: SelectedReports[] = [];
let mockSelectedTransactions: SelectedTransactions = {};
let mockCurrentSearchResults: {data: Record<string, {reportName: string}>; search: {type: string}} | undefined;

jest.mock('@components/Search/SearchContext', () => ({
    useSearchSelectionContext: () => ({
        selectedTransactions: mockSelectedTransactions,
        selectedReports: mockSelectedReports,
        areAllMatchingItemsSelected: false,
    }),
    useSearchResultsContext: () => ({
        currentSearchResults: mockCurrentSearchResults,
    }),
    useSearchQueryContext: () => ({
        currentSearchKey: undefined,
        currentSearchHash: 12345,
        currentSearchQueryJSON: undefined,
        suggestedSearches: undefined,
    }),
    useSearchSelectionActions: () => ({
        clearSelectedTransactions: mockClearSelectedTransactions,
        selectAllMatchingItems: mockSelectAllMatchingItems,
    }),
}));

const CURRENT_USER_ACCOUNT_ID = 1;

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        login: 'test@example.com',
        accountID: CURRENT_USER_ACCOUNT_ID,
        email: 'test@example.com',
    })),
}));

jest.mock('@hooks/usePaymentContext', () => {
    const {default: mockUsePaymentContext} = jest.requireActual<typeof MockUsePaymentContextUtil>('../../utils/mockUsePaymentContext');
    return mockUsePaymentContext;
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const POLICY_ID = 'policy1';
const SUBMIT_POLICY_ID = 'policySubmit';
const REPORT_A_ID = 'reportA';
const REPORT_B_ID = 'reportB';
const REPORT_C_ID = 'reportC';
const REPORT_D_ID = 'reportD';

const baseQueryJSON: SearchQueryJSON = {
    inputQuery: 'type:expense-report status:all',
    hash: 12345,
    recentSearchHash: 12345,
    similarSearchHash: 12345,
    flatFilters: [],
    type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    view: CONST.SEARCH.VIEW.TABLE,
    filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.AND, left: 'type', right: 'expense-report'},
};

function makeSelectedReport(reportID: string, policyID = POLICY_ID): SelectedReports {
    return {
        reportID,
        policyID,
        action: CONST.SEARCH.ACTION_TYPES.SUBMIT,
        canPay: false,
        canApprove: false,
        canSubmit: true,
        canChangeApprover: false,
        total: 100,
        currency: 'USD',
        chatReportID: `chat-${reportID}`,
        ownerAccountID: CURRENT_USER_ACCOUNT_ID,
    };
}

async function mergeTransaction(transactionID: string, reportID: string, overrides: Record<string, unknown> = {}) {
    await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        transactionID,
        reportID,
        amount: -100,
        currency: 'USD',
        merchant: 'Test Merchant',
        created: '2026-01-01',
        comment: {},
        ...overrides,
    });
    mockSelectedTransactions[transactionID] = {
        isSelected: true,
        canReject: false,
        canHold: false,
        canSplit: false,
        hasBeenSplit: false,
        canChangeReport: false,
        isHeld: false,
        canUnhold: false,
        action: CONST.SEARCH.ACTION_TYPES.SUBMIT,
        reportID,
        policyID: POLICY_ID,
        amount: 100,
        displayAmount: 100,
        currency: 'USD',
        isFromOneTransactionReport: false,
    };
}

async function mergeViolations(transactionID: string, violations: Array<Pick<TransactionViolation, 'name' | 'type'>>) {
    await Onyx.merge(
        `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
        violations.map((violation) => createMock<TransactionViolation>(violation)),
    );
}

async function triggerBulkSubmit() {
    const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}), {wrapper: OnyxListItemProvider});

    await waitForBatchedUpdates();
    await waitFor(() => {
        expect(result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT)).toBeDefined();
    });

    await act(async () => {
        result.current.headerButtonsOptions.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.SUBMIT)?.onSelected?.();
        await waitForBatchedUpdates();
    });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useSearchBulkActions - bulk submit with blocked reports', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockShowConfirmModal.mockResolvedValue({action: 'CONFIRM'});
        await Onyx.clear();
        mockSelectedReports = [];
        mockSelectedTransactions = {};

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'test@example.com'});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
            id: POLICY_ID,
            name: 'Test Policy',
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${SUBMIT_POLICY_ID}`, {
            id: SUBMIT_POLICY_ID,
            name: 'Submit Policy',
            type: CONST.POLICY.TYPE.SUBMIT,
            role: CONST.POLICY.ROLE.ADMIN,
        });
        // The live report name differs from the snapshot name to prove the modal uses the snapshot, as the rows do.
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_A_ID}`, {reportID: REPORT_A_ID, policyID: POLICY_ID, reportName: 'Live A'});
        mockCurrentSearchResults = {
            data: {
                [`${ONYXKEYS.COLLECTION.REPORT}${REPORT_A_ID}`]: {reportName: 'Report A &amp; travel'},
                [`${ONYXKEYS.COLLECTION.REPORT}${REPORT_B_ID}`]: {reportName: 'Report B'},
                [`${ONYXKEYS.COLLECTION.REPORT}${REPORT_C_ID}`]: {reportName: 'Report C'},
                [`${ONYXKEYS.COLLECTION.REPORT}${REPORT_D_ID}`]: {reportName: 'Report D'},
            },
            search: {type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT},
        };
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('submits the submittable report and lists the held-only report that was skipped', async () => {
        mockSelectedReports = [makeSelectedReport(REPORT_A_ID), makeSelectedReport(REPORT_B_ID)];
        await mergeTransaction('txHeld', REPORT_A_ID, {comment: {hold: 'holdReportAction1'}});
        await mergeTransaction('txNormal', REPORT_B_ID);

        await triggerBulkSubmit();

        await waitFor(() => {
            expect(mockSubmitMoneyRequestOnSearch).toHaveBeenCalledTimes(1);
        });
        expect(mockSubmitMoneyRequestOnSearch.mock.calls.at(0)?.at(1)).toEqual([expect.objectContaining({reportID: REPORT_B_ID})]);
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'iou.error.reportsNotSubmittedTitle',
                subtitle: 'iou.error.reportsNotSubmittedDescription',
                prompt: `${CONST.DOT_SEPARATOR} Report A & travel`,
                confirmText: 'common.buttonConfirm',
                shouldShowCancelButton: false,
            }),
        );
    });

    it('lists every skipped report when the selection mixes held-only and pending-only reports', async () => {
        mockSelectedReports = [makeSelectedReport(REPORT_A_ID), makeSelectedReport(REPORT_B_ID), makeSelectedReport(REPORT_C_ID)];
        await mergeTransaction('txHeld', REPORT_A_ID, {comment: {hold: 'holdReportAction1'}});
        await mergeTransaction('txPending', REPORT_B_ID, {status: CONST.TRANSACTION.STATUS.PENDING});
        await mergeTransaction('txNormal', REPORT_C_ID);

        await triggerBulkSubmit();

        await waitFor(() => {
            expect(mockSubmitMoneyRequestOnSearch).toHaveBeenCalledTimes(1);
        });
        expect(mockSubmitMoneyRequestOnSearch.mock.calls.at(0)?.at(1)).toEqual([expect.objectContaining({reportID: REPORT_C_ID})]);
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- this specific prompt (blocked-reports list) is always a plain string, unlike the violations modal's ReactNode prompt
        expect((mockShowConfirmModal.mock.calls.at(0)?.at(0)?.prompt as string | undefined)?.split('\n').sort()).toEqual([
            `${CONST.DOT_SEPARATOR} Report A & travel`,
            `${CONST.DOT_SEPARATOR} Report B`,
        ]);
    });

    it('lists every selected report, submits nothing and keeps the selection when all of them are blocked', async () => {
        mockSelectedReports = [makeSelectedReport(REPORT_A_ID), makeSelectedReport(REPORT_B_ID)];
        await mergeTransaction('txHeld', REPORT_A_ID, {comment: {hold: 'holdReportAction1'}});
        await mergeTransaction('txPending', REPORT_B_ID, {status: CONST.TRANSACTION.STATUS.PENDING});

        await triggerBulkSubmit();

        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({title: 'iou.error.reportsNotSubmittedTitle'}));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- this specific prompt (blocked-reports list) is always a plain string, unlike the violations modal's ReactNode prompt
        expect((mockShowConfirmModal.mock.calls.at(0)?.at(0)?.prompt as string | undefined)?.split('\n').sort()).toEqual([
            `${CONST.DOT_SEPARATOR} Report A & travel`,
            `${CONST.DOT_SEPARATOR} Report B`,
        ]);
        expect(mockSubmitMoneyRequestOnSearch).not.toHaveBeenCalled();
        expect(mockClearSelectedTransactions).not.toHaveBeenCalled();
    });

    it('shows the list modal instead of the manager picker when the single submit-policy report is blocked', async () => {
        mockSelectedReports = [makeSelectedReport(REPORT_D_ID, SUBMIT_POLICY_ID)];
        await mergeTransaction('txHeld', REPORT_D_ID, {comment: {hold: 'holdReportAction1'}});

        await triggerBulkSubmit();

        expect(mockOpenSearchReportSubmitToPopover).not.toHaveBeenCalled();
        expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({title: 'iou.error.reportsNotSubmittedTitle', prompt: `${CONST.DOT_SEPARATOR} Report D`}));
        expect(mockSubmitMoneyRequestOnSearch).not.toHaveBeenCalled();
    });

    it('submits every report without a warning when none are blocked', async () => {
        mockSelectedReports = [makeSelectedReport(REPORT_A_ID), makeSelectedReport(REPORT_B_ID)];
        await mergeTransaction('txNormalA', REPORT_A_ID);
        await mergeTransaction('txNormalB', REPORT_B_ID);

        await triggerBulkSubmit();

        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        await waitFor(() => {
            expect(mockSubmitMoneyRequestOnSearch).toHaveBeenCalledTimes(2);
        });
    });

    it('shows the violations confirmation modal once for a shared violation across two reports, and submits without asking the backend to resolve anything for an "other" violation', async () => {
        // Given two selected reports that each have the same "other" violation (over category limit) on their one transaction
        mockSelectedReports = [makeSelectedReport(REPORT_A_ID), makeSelectedReport(REPORT_B_ID)];
        await mergeTransaction('txNormalA', REPORT_A_ID);
        await mergeTransaction('txNormalB', REPORT_B_ID);
        await mergeViolations('txNormalA', [{name: CONST.VIOLATIONS.OVER_CATEGORY_LIMIT, type: CONST.VIOLATION_TYPES.VIOLATION}]);
        await mergeViolations('txNormalB', [{name: CONST.VIOLATIONS.OVER_CATEGORY_LIMIT, type: CONST.VIOLATION_TYPES.VIOLATION}]);

        // When the user bulk-submits both reports
        await triggerBulkSubmit();

        // Then the modal must show a single deduped bullet instead of repeating the same violation once per report,
        // and since it's an "other" violation with nothing for the backend to resolve, both submits must be sent
        // with shouldResolveAcknowledgedViolations=false even though the user confirmed the modal
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'iou.confirmSubmitReportViolations.title',
                // The same violation on both reports collapses into a single bullet. The mock translate returns
                // the bare key (ignoring the interpolated amount), so the full violation message from
                // ViolationsUtils.getViolationTranslation collapses to just the translation key here.
                prompt: expect.objectContaining({props: expect.objectContaining({violations: ['violations.overCategoryLimit']})}),
            }),
        );
        await waitFor(() => {
            expect(mockSubmitMoneyRequestOnSearch).toHaveBeenCalledTimes(2);
        });
        // An "other" violation (e.g. over category limit) has nothing for the backend to resolve.
        expect(mockSubmitMoneyRequestOnSearch.mock.calls.at(0)?.at(11)).toBe(false);
        expect(mockSubmitMoneyRequestOnSearch.mock.calls.at(1)?.at(11)).toBe(false);
    });

    it('marks the rejected report as resolved with the backend when the user confirms the violations modal', async () => {
        // Given a selected report whose transaction has a rejected-expense violation
        mockSelectedReports = [makeSelectedReport(REPORT_A_ID)];
        await mergeTransaction('txRejected', REPORT_A_ID);
        await mergeViolations('txRejected', [{name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE, type: CONST.VIOLATION_TYPES.VIOLATION}]);

        // When the user bulk-submits and confirms the violations modal
        await triggerBulkSubmit();

        // Then the modal must show the rejected-expense bullet, and the submit call must carry
        // shouldResolveAcknowledgedViolations=true so the backend marks the violation resolved instead of leaving it dangling
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({prompt: expect.objectContaining({props: expect.objectContaining({violations: ['iou.confirmSubmitReportViolations.rejectedExpense']})})}),
        );
        await waitFor(() => {
            expect(mockSubmitMoneyRequestOnSearch).toHaveBeenCalledTimes(1);
        });
        expect(mockSubmitMoneyRequestOnSearch.mock.calls.at(0)?.at(11)).toBe(true);
    });

    it('does not submit when the user cancels the violations confirmation modal', async () => {
        // Given a selected report with a rejected-expense violation, and a user who is about to cancel the modal
        mockSelectedReports = [makeSelectedReport(REPORT_A_ID)];
        await mergeTransaction('txRejected', REPORT_A_ID);
        await mergeViolations('txRejected', [{name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE, type: CONST.VIOLATION_TYPES.VIOLATION}]);
        mockShowConfirmModal.mockResolvedValue({action: 'CLOSE'});

        // When the user cancels the violations confirmation modal instead of confirming
        await triggerBulkSubmit();

        // Then nothing may be submitted and the selection must be preserved, so the user can fix the violation
        // and retry instead of losing their bulk selection
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(mockSubmitMoneyRequestOnSearch).not.toHaveBeenCalled();
        expect(mockClearSelectedTransactions).not.toHaveBeenCalled();
    });
});
