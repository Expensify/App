/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook, waitFor} from '@testing-library/react-native';
import {useEffect} from 'react';
import Onyx from 'react-native-onyx';
import type {SearchQueryJSON, SelectedTransactions} from '@components/Search/types';
import useBulkDuplicateAction from '@hooks/useBulkDuplicateAction';
import useSearchBulkActions from '@hooks/useSearchBulkActions';
import {bulkDuplicateExpenses} from '@libs/actions/IOU/Duplicate';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, PolicyTagLists, Report} from '@src/types/onyx';
import createRandomTransaction, {createRandomDistanceRequestTransaction} from '../../utils/collections/transaction';

jest.mock('@libs/actions/IOU/Duplicate', () => ({
    bulkDuplicateExpenses: jest.fn(),
}));

jest.mock('@libs/actions/Search', () => ({
    getExportTemplates: jest.fn(() => []),
    exportSearchItemsToCSV: jest.fn(),
    queueExportSearchItemsToCSV: jest.fn(),
    queueExportSearchWithTemplate: jest.fn(),
    approveMoneyRequestOnSearch: jest.fn(),
    bulkDeleteReports: jest.fn(),
    getLastPolicyBankAccountID: jest.fn(),
    getLastPolicyPaymentMethod: jest.fn(),
    getPayMoneyOnSearchInvoiceParams: jest.fn(),
    getPayOption: jest.fn(() => ({shouldEnableBulkPayOption: false, isFirstTimePayment: false})),
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

jest.mock('@libs/actions/SplitExpenses.ts', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@libs/actions/Report', () => ({
    deleteAppReport: jest.fn(),
    moveIOUReportToPolicy: jest.fn(),
    moveIOUReportToPolicyAndInviteSubmitter: jest.fn(),
}));

jest.mock('@libs/actions/User', () => ({
    setNameValuePair: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => '/test'),
}));

const mockTranslate = jest.fn((key: string) => key);
const mockLocaleCompare = jest.fn((a: string, b: string) => a && b);
const mockFormatPhoneNumber = jest.fn((phone: string) => phone);

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: mockTranslate,
        localeCompare: mockLocaleCompare,
        formatPhoneNumber: mockFormatPhoneNumber,
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
    default: () => ({isProduction: false, isDevelopment: true, environment: 'development'}),
}));

jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    useDelegateNoAccessState: () => ({isDelegateAccessRestricted: false}),
    useDelegateNoAccessActions: () => ({showDelegateNoAccessModal: jest.fn()}),
}));

const mockShowConfirmModal = jest.fn();
jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: mockShowConfirmModal}),
}));

jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: () => false}),
}));

jest.mock('@hooks/useSelfDMReport', () => ({
    __esModule: true,
    default: () => undefined,
}));

jest.mock('@hooks/useBulkPayOptions', () => ({
    __esModule: true,
    default: () => ({bulkPayButtonOptions: [], latestBankItems: []}),
}));

let mockDefaultExpensePolicy: Policy | undefined;
jest.mock('@hooks/useDefaultExpensePolicy', () => ({
    __esModule: true,
    default: () => mockDefaultExpensePolicy,
}));

const mockClearSelectedTransactions = jest.fn();
const mockSelectAllMatchingItems = jest.fn();
let mockSelectedTransactions: SelectedTransactions = {};
let mockSelectedReports: never[] = [];
let mockAreAllMatchingItemsSelected = false;

jest.mock('@components/Search/SearchContext', () => ({
    useSearchStateContext: () => ({
        selectedTransactions: mockSelectedTransactions,
        selectedReports: mockSelectedReports,
        areAllMatchingItemsSelected: mockAreAllMatchingItemsSelected,
        currentSearchResults: undefined,
    }),
    useSearchActionsContext: () => ({
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

const baseQueryJSON: SearchQueryJSON = {
    inputQuery: 'type:expense status:all',
    hash: 12345,
    recentSearchHash: 12345,
    similarSearchHash: 12345,
    flatFilters: [],
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    status: CONST.SEARCH.STATUS.EXPENSE.ALL,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    view: CONST.SEARCH.VIEW.TABLE,
    filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.AND, left: 'type', right: 'expense'},
};

function makeSelectedTransaction(overrides: Partial<SelectedTransactions[string]> = {}): SelectedTransactions[string] {
    return {
        isSelected: true,
        canReject: false,
        canHold: false,
        canSplit: false,
        hasBeenSplit: false,
        canChangeReport: false,
        isHeld: false,
        canUnhold: false,
        action: CONST.SEARCH.ACTION_TYPES.VIEW,
        reportID: 'report1',
        policyID: 'policy1',
        amount: 100,
        currency: 'USD',
        isFromOneTransactionReport: false,
        ...overrides,
    };
}

/**
 * Renders useSearchBulkActions + useBulkDuplicateAction together (mirrors the real app tree
 * where BulkDuplicateHandler mounts when the option is visible and populates the handler ref).
 */
function useSearchBulkActionsWithDuplicate({queryJSON}: {queryJSON: SearchQueryJSON}) {
    const actions = useSearchBulkActions({queryJSON});
    const {setDuplicateHandler, allTransactions, allReports, searchData} = actions;
    const handleDuplicate = useBulkDuplicateAction({
        selectedTransactionsKeys: Object.keys(mockSelectedTransactions),
        allTransactions,
        allReports,
        searchData,
    });
    useEffect(() => {
        setDuplicateHandler(handleDuplicate);
    }, [handleDuplicate, setDuplicateHandler]);
    return actions;
}

describe('useSearchBulkActions - duplicate option', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        mockSelectedTransactions = {};
        mockSelectedReports = [];
        mockAreAllMatchingItemsSelected = false;
        mockDefaultExpensePolicy = undefined;

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'test@example.com'});

        const defaultReportIDs = ['report1', 'r0', 'r1', 'r2', 'r3'];
        for (const reportID of defaultReportIDs) {
            // eslint-disable-next-line no-await-in-loop
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
                reportID,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                reportName: `Report ${reportID}`,
            });
        }
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    // ============================================================
    // Visibility tests
    // ============================================================

    it('should show duplicate option for a single cash expense', async () => {
        const transactionID = '100';
        const transaction = {
            ...createRandomTransaction(1),
            transactionID,
            managedCard: false,
        };

        mockSelectedTransactions = {[transactionID]: makeSelectedTransaction()};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            const opt = result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE);
            expect(opt).toBeDefined();
            expect(opt?.text).toBe('search.bulkActions.duplicateExpense');
        });
    });

    it('should not show duplicate option for a card expense', async () => {
        const transactionID = '200';
        const transaction = {...createRandomTransaction(1), transactionID, managedCard: true};

        mockSelectedTransactions = {[transactionID]: makeSelectedTransaction()};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));
        await waitFor(() => expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0));

        expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeUndefined();
    });

    it('should not show duplicate option when selection includes a mix of cash and card expenses', async () => {
        const cashTxn = {...createRandomTransaction(1), transactionID: '300', managedCard: false};
        const cardTxn = {...createRandomTransaction(2), transactionID: '301', managedCard: true};

        mockSelectedTransactions = {
            '300': makeSelectedTransaction({reportID: 'r1'}),
            '301': makeSelectedTransaction({reportID: 'r2'}),
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}300`, cashTxn);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}301`, cardTxn);

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));
        await waitFor(() => expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0));

        expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeUndefined();
    });

    it('should show duplicate option for multiple cash expenses', async () => {
        const txn1 = {...createRandomTransaction(1), transactionID: '400', managedCard: false};
        const txn2 = {...createRandomTransaction(2), transactionID: '401', managedCard: false};

        mockSelectedTransactions = {
            '400': makeSelectedTransaction({reportID: 'r1'}),
            '401': makeSelectedTransaction({reportID: 'r2'}),
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}400`, txn1);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}401`, txn2);

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));
        await waitFor(() => {
            expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeDefined();
        });
    });

    it('should not show duplicate option for expense_report type', async () => {
        const txn = {...createRandomTransaction(1), transactionID: '500', managedCard: false};
        mockSelectedTransactions = {'500': makeSelectedTransaction()};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}500`, txn);

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: {...baseQueryJSON, type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT}}));
        await waitFor(() => expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0));

        expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeUndefined();
    });

    it('should not show duplicate option when no transactions are selected', () => {
        mockSelectedTransactions = {};
        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));
        expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeUndefined();
    });

    it('should show duplicate option for a Per Diem expense with dates', async () => {
        const txnID = '1500';
        const policyID = 'policy1';
        mockDefaultExpensePolicy = {id: policyID, type: CONST.POLICY.TYPE.TEAM, name: 'Test WS'} as Policy;
        const txn = {
            ...createRandomTransaction(1),
            transactionID: txnID,
            managedCard: false,
            iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
            comment: {
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                customUnit: {
                    name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                    attributes: {dates: {start: '2026-03-01', end: '2026-03-05'}},
                },
            },
        };

        mockSelectedTransactions = {[txnID]: makeSelectedTransaction()};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${txnID}`, txn);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}report1`, {reportID: 'report1', policyID});

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeDefined();
        });
    });

    it('should show duplicate option for a Distance expense', async () => {
        const txnID = '1600';
        const txn = {
            ...createRandomDistanceRequestTransaction(1),
            transactionID: txnID,
            managedCard: false,
        };

        mockSelectedTransactions = {[txnID]: makeSelectedTransaction()};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${txnID}`, txn);

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeDefined();
        });
    });

    it('should show duplicate option for a mix of cash, Per Diem, and Distance expenses', async () => {
        const policyID = 'policy1';
        mockDefaultExpensePolicy = {id: policyID, type: CONST.POLICY.TYPE.TEAM, name: 'Test WS'} as Policy;
        const cashTxn = {...createRandomTransaction(1), transactionID: '1700', managedCard: false};
        const perDiemTxn = {
            ...createRandomTransaction(2),
            transactionID: '1701',
            managedCard: false,
            iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
            comment: {
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                customUnit: {
                    name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                    attributes: {dates: {start: '2026-03-01', end: '2026-03-05'}},
                },
            },
        };
        const distanceTxn = {...createRandomDistanceRequestTransaction(3), transactionID: '1702', managedCard: false};

        mockSelectedTransactions = {
            '1700': makeSelectedTransaction({reportID: 'r1'}),
            '1701': makeSelectedTransaction({reportID: 'r2'}),
            '1702': makeSelectedTransaction({reportID: 'r3'}),
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}1700`, cashTxn);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}1701`, perDiemTxn);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}1702`, distanceTxn);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}r1`, {reportID: 'r1', policyID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}r2`, {reportID: 'r2', policyID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}r3`, {reportID: 'r3', policyID});

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeDefined();
        });
    });

    it('should not show duplicate option when card expense is mixed with Per Diem or Distance', async () => {
        const cardTxn = {...createRandomTransaction(1), transactionID: '1800', managedCard: true};
        const perDiemTxn = {
            ...createRandomTransaction(2),
            transactionID: '1801',
            managedCard: false,
            iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
            comment: {
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                customUnit: {
                    name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                    attributes: {dates: {start: '2026-03-01', end: '2026-03-05'}},
                },
            },
        };
        const distanceTxn = {...createRandomDistanceRequestTransaction(3), transactionID: '1802', managedCard: false};

        mockSelectedTransactions = {
            '1800': makeSelectedTransaction({reportID: 'r1'}),
            '1801': makeSelectedTransaction({reportID: 'r2'}),
            '1802': makeSelectedTransaction({reportID: 'r3'}),
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}1800`, cardTxn);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}1801`, perDiemTxn);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}1802`, distanceTxn);

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));
        await waitFor(() => expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0));

        expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeUndefined();
    });

    it('should show duplicate option for expenses in any state (submit, approve, pay, done)', async () => {
        const states = [CONST.SEARCH.ACTION_TYPES.SUBMIT, CONST.SEARCH.ACTION_TYPES.APPROVE, CONST.SEARCH.ACTION_TYPES.PAY, CONST.SEARCH.ACTION_TYPES.DONE];

        const transactionIDs = states.map((_, i) => `1900${i}`);
        for (const [i, txnID] of transactionIDs.entries()) {
            const txn = {...createRandomTransaction(i + 1), transactionID: txnID, managedCard: false};
            // eslint-disable-next-line no-await-in-loop
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${txnID}`, txn);
        }

        mockSelectedTransactions = Object.fromEntries(
            transactionIDs.map((id, i) => [id, makeSelectedTransaction({reportID: `r${i}`, action: states.at(i) ?? CONST.SEARCH.ACTION_TYPES.VIEW})]),
        );

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeDefined();
        });
    });

    it('should show duplicate option for expenses with VIEW action (unreported/paid)', async () => {
        const txnID = '2000';
        const txn = {...createRandomTransaction(1), transactionID: txnID, managedCard: false};
        mockSelectedTransactions = {[txnID]: makeSelectedTransaction({action: CONST.SEARCH.ACTION_TYPES.VIEW})};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${txnID}`, txn);

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeDefined();
        });
    });

    // ============================================================
    // Data / invocation tests
    // ============================================================

    it('should call bulkDuplicateExpenses with all selected transaction IDs', async () => {
        const txn1 = {...createRandomTransaction(1), transactionID: '600', managedCard: false};
        const txn2 = {...createRandomTransaction(2), transactionID: '601', managedCard: false};

        mockSelectedTransactions = {
            '600': makeSelectedTransaction({reportID: 'r1'}),
            '601': makeSelectedTransaction({reportID: 'r2'}),
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}600`, txn1);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}601`, txn2);

        const {result} = renderHook(() => useSearchBulkActionsWithDuplicate({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeDefined();
        });

        result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)?.onSelected?.();

        expect(bulkDuplicateExpenses).toHaveBeenCalledTimes(1);
        expect(bulkDuplicateExpenses).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionIDs: expect.arrayContaining(['600', '601']),
            }),
        );
        expect(mockClearSelectedTransactions).toHaveBeenCalled();
    });

    it('should pass defaultExpensePolicy as targetPolicy when available', async () => {
        const policyID = 'POLICY_TEAM_1';
        const teamPolicy = {id: policyID, type: CONST.POLICY.TYPE.TEAM, name: 'Test Workspace'} as Policy;
        mockDefaultExpensePolicy = teamPolicy;

        const txnID = '700';
        const txn = {...createRandomTransaction(1), transactionID: txnID, managedCard: false};
        mockSelectedTransactions = {[txnID]: makeSelectedTransaction({policyID})};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${txnID}`, txn);

        const {result} = renderHook(() => useSearchBulkActionsWithDuplicate({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeDefined();
        });

        result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)?.onSelected?.();

        expect(bulkDuplicateExpenses).toHaveBeenCalledWith(
            expect.objectContaining({
                targetPolicy: teamPolicy,
            }),
        );
    });

    it('should pass undefined targetPolicy when no defaultExpensePolicy exists', async () => {
        mockDefaultExpensePolicy = undefined;

        const txnID = '800';
        const txn = {...createRandomTransaction(1), transactionID: txnID, managedCard: false};
        mockSelectedTransactions = {[txnID]: makeSelectedTransaction()};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${txnID}`, txn);

        const {result} = renderHook(() => useSearchBulkActionsWithDuplicate({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeDefined();
        });

        result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)?.onSelected?.();

        expect(bulkDuplicateExpenses).toHaveBeenCalledWith(
            expect.objectContaining({
                targetPolicy: undefined,
            }),
        );
    });

    it('should resolve policy categories and tags from defaultExpensePolicy', async () => {
        const policyID = 'POLICY_CAT_TEST';
        const teamPolicy = {id: policyID, type: CONST.POLICY.TYPE.TEAM, name: 'Category WS'} as Policy;
        mockDefaultExpensePolicy = teamPolicy;

        const categories: PolicyCategories = {
            Food: {name: 'Food', enabled: true, areCommentsRequired: false, externalID: '', origin: ''},
            Travel: {name: 'Travel', enabled: true, areCommentsRequired: false, externalID: '', origin: ''},
        };
        const tags: PolicyTagLists = {
            Tag: {name: 'Tag', required: false, tags: {ProjectA: {name: 'ProjectA', enabled: true, 'GL Code': '', pendingAction: undefined}}, orderWeight: 1},
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, categories);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, tags);

        const txnID = '900';
        const txn = {...createRandomTransaction(1), transactionID: txnID, managedCard: false, category: 'Food'};
        mockSelectedTransactions = {[txnID]: makeSelectedTransaction({policyID})};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${txnID}`, txn);

        const {result} = renderHook(() => useSearchBulkActionsWithDuplicate({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeDefined();
        });

        result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)?.onSelected?.();

        expect(bulkDuplicateExpenses).toHaveBeenCalledWith(
            expect.objectContaining({
                targetPolicy: teamPolicy,
                targetPolicyCategories: categories,
                targetPolicyTags: tags,
            }),
        );
    });

    it('should pass activePolicyExpenseChat as targetReport when it exists', async () => {
        const policyID = 'POLICY_REPORT_TEST';
        const teamPolicy = {id: policyID, type: CONST.POLICY.TYPE.TEAM, name: 'Report WS'} as Policy;
        mockDefaultExpensePolicy = teamPolicy;

        const policyExpenseChat: Report = {
            reportID: 'pec_123',
            policyID,
            type: CONST.REPORT.TYPE.EXPENSE,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            reportName: 'Test Workspace',
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`, policyExpenseChat);

        const txnID = '1000';
        const txn = {...createRandomTransaction(1), transactionID: txnID, managedCard: false};
        mockSelectedTransactions = {[txnID]: makeSelectedTransaction({policyID})};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${txnID}`, txn);

        const {result} = renderHook(() => useSearchBulkActionsWithDuplicate({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeDefined();
        });

        result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)?.onSelected?.();

        expect(bulkDuplicateExpenses).toHaveBeenCalledWith(
            expect.objectContaining({
                targetReport: expect.objectContaining({
                    reportID: policyExpenseChat.reportID,
                    policyID,
                }),
            }),
        );
    });

    it('should duplicate expenses from multiple policies using the default expense policy data', async () => {
        const defaultPolicyID = 'DEFAULT_POLICY';
        const otherPolicyID = 'OTHER_POLICY';
        const teamPolicy = {id: defaultPolicyID, type: CONST.POLICY.TYPE.TEAM, name: 'Default WS'} as Policy;
        mockDefaultExpensePolicy = teamPolicy;

        const defaultCategories: PolicyCategories = {
            Materials: {name: 'Materials', enabled: true, areCommentsRequired: false, externalID: '', origin: ''},
        };
        const otherCategories: PolicyCategories = {
            Supplies: {name: 'Supplies', enabled: true, areCommentsRequired: false, externalID: '', origin: ''},
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${defaultPolicyID}`, defaultCategories);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${otherPolicyID}`, otherCategories);

        const txn1 = {...createRandomTransaction(1), transactionID: '1100', managedCard: false, category: 'Materials'};
        const txn2 = {...createRandomTransaction(2), transactionID: '1101', managedCard: false, category: 'Supplies'};

        mockSelectedTransactions = {
            '1100': makeSelectedTransaction({reportID: 'r1', policyID: defaultPolicyID}),
            '1101': makeSelectedTransaction({reportID: 'r2', policyID: otherPolicyID}),
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}1100`, txn1);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}1101`, txn2);

        const {result} = renderHook(() => useSearchBulkActionsWithDuplicate({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeDefined();
        });

        result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)?.onSelected?.();

        expect(bulkDuplicateExpenses).toHaveBeenCalledTimes(1);
        expect(bulkDuplicateExpenses).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionIDs: expect.arrayContaining(['1100', '1101']),
                targetPolicy: teamPolicy,
                targetPolicyCategories: defaultCategories,
            }),
        );
    });

    it('should pass empty categories and tags when defaultExpensePolicy is undefined', async () => {
        mockDefaultExpensePolicy = undefined;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}somePolicyID`, {
            Ignored: {name: 'Ignored', enabled: true, areCommentsRequired: false, externalID: '', origin: ''},
        });

        const txnID = '1200';
        const txn = {...createRandomTransaction(1), transactionID: txnID, managedCard: false, category: 'Ignored'};
        mockSelectedTransactions = {[txnID]: makeSelectedTransaction()};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${txnID}`, txn);

        const {result} = renderHook(() => useSearchBulkActionsWithDuplicate({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeDefined();
        });

        result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)?.onSelected?.();

        expect(bulkDuplicateExpenses).toHaveBeenCalledWith(
            expect.objectContaining({
                targetPolicy: undefined,
                targetPolicyCategories: {},
                targetPolicyTags: {},
            }),
        );
    });

    it('should include allTransactions data in bulkDuplicateExpenses call', async () => {
        const txn1 = {...createRandomTransaction(1), transactionID: '1300', managedCard: false, category: 'A', amount: 5000};
        const txn2 = {...createRandomTransaction(2), transactionID: '1301', managedCard: false, category: 'B', amount: 7500};

        mockSelectedTransactions = {
            '1300': makeSelectedTransaction({reportID: 'r1'}),
            '1301': makeSelectedTransaction({reportID: 'r2'}),
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}1300`, txn1);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}1301`, txn2);

        const {result} = renderHook(() => useSearchBulkActionsWithDuplicate({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeDefined();
        });

        result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)?.onSelected?.();

        expect(bulkDuplicateExpenses).toHaveBeenCalledWith(
            expect.objectContaining({
                allTransactions: expect.objectContaining({
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}1300`]: expect.objectContaining({transactionID: '1300', category: 'A', amount: 5000}),
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}1301`]: expect.objectContaining({transactionID: '1301', category: 'B', amount: 7500}),
                }),
            }),
        );
    });

    it('should not show duplicate option for per-diem expense on non-default workspace', async () => {
        const defaultPolicyID = 'DEFAULT_POLICY';
        const otherPolicyID = 'OTHER_POLICY';
        mockDefaultExpensePolicy = {id: defaultPolicyID, type: CONST.POLICY.TYPE.TEAM, name: 'Default WS'} as Policy;

        const txnID = '2100';
        const txn = {
            ...createRandomTransaction(1),
            transactionID: txnID,
            managedCard: false,
            iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
            comment: {type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT, customUnit: {name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL}},
        };

        const report: Report = {
            reportID: 'r_other',
            policyID: otherPolicyID,
            type: CONST.REPORT.TYPE.EXPENSE,
            reportName: 'Other WS Report',
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}r_other`, report);

        mockSelectedTransactions = {[txnID]: makeSelectedTransaction({reportID: 'r_other', policyID: otherPolicyID})};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${txnID}`, txn);

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));
        await waitFor(() => expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0));

        expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeUndefined();
    });

    it('should not show duplicate option for transaction with custom unit out of policy violation', async () => {
        const txnID = '2200';
        const txn = {...createRandomTransaction(1), transactionID: txnID, managedCard: false};

        mockSelectedTransactions = {[txnID]: makeSelectedTransaction()};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${txnID}`, txn);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${txnID}`, [{name: CONST.VIOLATIONS.CUSTOM_UNIT_OUT_OF_POLICY, type: CONST.VIOLATION_TYPES.VIOLATION}]);

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));
        await waitFor(() => expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0));

        expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeUndefined();
    });

    it('should not show duplicate option for distance expense from archived report', async () => {
        const txnID = '2300';
        const reportID = 'r_archived';
        const txn = {
            ...createRandomDistanceRequestTransaction(1),
            transactionID: txnID,
            managedCard: false,
        };

        const report: Report = {
            reportID,
            policyID: 'policy1',
            type: CONST.REPORT.TYPE.EXPENSE,
            reportName: 'Archived Report',
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {private_isArchived: new Date().toISOString()});

        mockSelectedTransactions = {[txnID]: makeSelectedTransaction({reportID})};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${txnID}`, txn);

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));
        await waitFor(() => expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0));

        expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeUndefined();
    });

    it('should not show duplicate option for distance expense from DM chat', async () => {
        const defaultPolicyID = 'DEFAULT_POLICY';
        mockDefaultExpensePolicy = {id: defaultPolicyID, type: CONST.POLICY.TYPE.TEAM, name: 'Default WS'} as Policy;

        const txnID = '2400';
        const expenseReportID = 'r_expense_dm';
        const chatReportID = 'r_chat_dm';
        const txn = {
            ...createRandomDistanceRequestTransaction(1),
            transactionID: txnID,
            managedCard: false,
        };

        const policyExpenseChat: Report = {
            reportID: 'pec_dm',
            policyID: defaultPolicyID,
            type: CONST.REPORT.TYPE.EXPENSE,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            reportName: 'Default WS',
        };
        const chatReport: Report = {
            reportID: chatReportID,
            type: CONST.REPORT.TYPE.CHAT,
            reportName: 'DM Chat',
        };
        const expenseReport: Report = {
            reportID: expenseReportID,
            policyID: defaultPolicyID,
            type: CONST.REPORT.TYPE.EXPENSE,
            chatReportID,
            reportName: 'DM Expense',
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`, policyExpenseChat);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, chatReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`, expenseReport);

        mockSelectedTransactions = {[txnID]: makeSelectedTransaction({reportID: expenseReportID})};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${txnID}`, txn);

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));
        await waitFor(() => expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0));

        expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeUndefined();
    });

    it('should not show duplicate option when all selected transactions are scanning', async () => {
        const txnID = '1400';
        const txn = {
            ...createRandomTransaction(1),
            transactionID: txnID,
            managedCard: false,
            merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
            modifiedMerchant: '',
            receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_READY, source: 'test.jpg'},
        };

        mockSelectedTransactions = {[txnID]: makeSelectedTransaction()};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${txnID}`, txn);

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));

        await waitFor(() => expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0));
        expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeUndefined();
    });

    it('should not show duplicate option for unreported per diem expense (no policyID on report)', async () => {
        const defaultPolicyID = 'DEFAULT_POLICY';
        mockDefaultExpensePolicy = {id: defaultPolicyID, type: CONST.POLICY.TYPE.TEAM, name: 'Default WS'} as Policy;

        const txnID = '2500';
        const txn = {
            ...createRandomTransaction(1),
            transactionID: txnID,
            managedCard: false,
            iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
            comment: {
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                customUnit: {
                    name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                    attributes: {dates: {start: '2026-03-01', end: '2026-03-05'}},
                },
            },
        };

        mockSelectedTransactions = {[txnID]: makeSelectedTransaction({reportID: CONST.REPORT.UNREPORTED_REPORT_ID})};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${txnID}`, txn);

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));
        await waitFor(() => expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0));

        expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeUndefined();
    });

    it('should not show duplicate option for unreported distance expense when policy expense chat exists', async () => {
        const defaultPolicyID = 'DEFAULT_POLICY';
        mockDefaultExpensePolicy = {id: defaultPolicyID, type: CONST.POLICY.TYPE.TEAM, name: 'Default WS'} as Policy;

        const txnID = '2600';
        const txn = {
            ...createRandomDistanceRequestTransaction(1),
            transactionID: txnID,
            managedCard: false,
        };

        const policyExpenseChat: Report = {
            reportID: 'pec_unreported',
            policyID: defaultPolicyID,
            type: CONST.REPORT.TYPE.EXPENSE,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            reportName: 'Default WS',
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`, policyExpenseChat);

        mockSelectedTransactions = {[txnID]: makeSelectedTransaction({reportID: CONST.REPORT.UNREPORTED_REPORT_ID})};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${txnID}`, txn);

        const {result} = renderHook(() => useSearchBulkActions({queryJSON: baseQueryJSON}));
        await waitFor(() => expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0));

        expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeUndefined();
    });

    it('should show modal instead of duplicating when more than 50 expenses are selected', async () => {
        const selected: SelectedTransactions = {};
        const mergePromises: Array<Promise<void>> = [];
        for (let i = 0; i < CONST.SEARCH.BULK_DUPLICATE_LIMIT + 1; i++) {
            const txnID = `limit_${i}`;
            selected[txnID] = makeSelectedTransaction({reportID: `r_limit_${i}`});
            mergePromises.push(
                Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${txnID}`, {
                    ...createRandomTransaction(i),
                    transactionID: txnID,
                    managedCard: false,
                }),
            );
            mergePromises.push(
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}r_limit_${i}`, {
                    reportID: `r_limit_${i}`,
                    ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                } as Report),
            );
        }
        await Promise.all(mergePromises);
        mockSelectedTransactions = selected;

        const {result} = renderHook(() => useSearchBulkActionsWithDuplicate({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeDefined();
        });

        result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)?.onSelected?.();

        expect(bulkDuplicateExpenses).not.toHaveBeenCalled();
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'common.duplicateExpense',
                prompt: 'iou.bulkDuplicateLimit',
            }),
        );
    });

    it('should call clearSelectedTransactions with no arguments after bulk duplicate on search page', async () => {
        const txnID = '2700';
        const txn = {...createRandomTransaction(1), transactionID: txnID, managedCard: false};

        mockSelectedTransactions = {[txnID]: makeSelectedTransaction()};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${txnID}`, txn);

        const {result} = renderHook(() => useSearchBulkActionsWithDuplicate({queryJSON: baseQueryJSON}));

        await waitFor(() => {
            expect(result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)).toBeDefined();
        });

        result.current.headerButtonsOptions.find((o) => o.value === CONST.SEARCH.BULK_ACTION_TYPES.DUPLICATE)?.onSelected?.();

        expect(bulkDuplicateExpenses).toHaveBeenCalledTimes(1);
        expect(mockClearSelectedTransactions).toHaveBeenCalledTimes(1);
        expect(mockClearSelectedTransactions).toHaveBeenCalledWith();
    });
});
