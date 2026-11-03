import {renderHook, waitFor} from '@testing-library/react-native';

import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {SearchQueryJSON, SelectedTransactions} from '@components/Search/types';

import useSearchBulkActions from '@hooks/useSearchBulkActions';
import type {SearchHeaderOptionValue} from '@hooks/useSearchBulkActions';

import type * as SearchActions from '@libs/actions/Search';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import type * as MockUsePaymentContextUtil from '../../utils/mockUsePaymentContext';

jest.mock('@libs/actions/Export', () => ({
    exportReportsToPDF: jest.fn(() => 'mock-pdf-export-id'),
    exportReceiptsToZip: jest.fn(() => 'mock-receipts-export-id'),
}));
jest.mock('@libs/actions/Report', () => ({
    exportReportToPDF: jest.fn(),
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: false}),
}));

jest.mock('@hooks/useEnvironment', () => ({
    __esModule: true,
    default: () => ({isProduction: false, isDevelopment: true, environment: 'development'}),
}));

// Edit multiple sits behind the bulk edit beta, so it is enabled for every test here.
jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: (beta: string) => beta === jest.requireActual<{default: typeof CONST}>('@src/CONST').default.BETAS.BULK_EDIT, isBetaEnabledOrUnknown: () => false}),
}));

jest.mock('@libs/actions/Search', () => ({
    // The hook and shouldShowDeleteOption resolve report actions through this helper, so the real implementation has to stay available
    getReportActionsFromSearchSnapshot: jest.requireActual<typeof SearchActions>('@libs/actions/Search').getReportActionsFromSearchSnapshot,
    openSearchCardFiltersPage: jest.fn(),
    getExportTemplates: jest.fn(() => ({customTemplates: [], defaultTemplates: []})),
    exportSearchItemsToCSV: jest.fn(),
    queueExportSearchItemsToCSV: jest.fn(),
    queueExportSearchWithTemplate: jest.fn(),
    approveMoneyRequestOnSearch: jest.fn(),
    getLastPolicyBankAccountID: jest.fn(),
    getLastPolicyPaymentMethod: jest.fn(),
    getPayMoneyOnSearchInvoiceParams: jest.fn(),
    getPayOption: jest.fn(() => ({shouldEnableBulkPayOption: false, isFirstTimePayment: false})),
    getReportFromSearchSnapshot: jest.fn(),
    getPolicyFromSearchSnapshot: jest.fn(),
    getReportType: jest.fn(),
    getTotalFormattedAmount: jest.fn(() => ''),
    isCurrencySupportWalletBulkPay: jest.fn(() => false),
    payMoneyRequestOnSearch: jest.fn(),
    submitMoneyRequestOnSearch: jest.fn(),
    unholdMoneyRequestOnSearch: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: (key: string) => key,
        localeCompare: (first: string, second: string) => first.localeCompare(second),
        formatPhoneNumber: (phone: string) => phone,
    }),
}));

let mockSelectedTransactions: SelectedTransactions = {};

jest.mock('@components/Search/SearchContext', () => ({
    useSearchSelectionContext: () => ({
        selectedTransactions: mockSelectedTransactions,
        selectedReports: [],
        areAllMatchingItemsSelected: false,
    }),
    useSearchResultsContext: () => ({
        currentSearchResults: undefined,
    }),
    useSearchQueryContext: () => ({
        currentSearchKey: undefined,
    }),
    useSearchSelectionActions: () => ({
        clearSelectedTransactions: jest.fn(),
        selectAllMatchingItems: jest.fn(),
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

jest.mock('@hooks/usePolicyForMovingExpenses', () => ({
    __esModule: true,
    default: () => ({policyForMovingExpensesID: 'policy1'}),
}));

// ---- helpers ----

const GROUP_KEY = `${CONST.SEARCH.GROUP_PREFIX}category`;

const groupedQueryJSON: SearchQueryJSON = {
    inputQuery: 'type:expense groupBy:category',
    hash: 54321,
    recentSearchHash: 54321,
    similarSearchHash: 54321,
    flatFilters: [],
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    groupBy: CONST.SEARCH.GROUP_BY.CATEGORY,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    view: CONST.SEARCH.VIEW.TABLE,
    filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.AND, left: 'type', right: 'expense'},
};

// Unreported expenses skip the per-report permission checks in canEditMultipleTransactions, so these tests only exercise the group rule.
function makeTransaction(transactionID: string): Transaction {
    return {
        transactionID,
        reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
        amount: 100,
        currency: 'USD',
        created: '2024-01-01',
        merchant: '',
    };
}

function makeSelectedTransaction(transactionID: string, overrides: Partial<SelectedTransactions[string]> = {}): SelectedTransactions[string] {
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
        reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
        policyID: 'policy1',
        amount: 100,
        displayAmount: 100,
        currency: 'USD',
        isFromOneTransactionReport: false,
        transaction: makeTransaction(transactionID),
        ...overrides,
    };
}

function getEditMultipleOption(options: Array<DropdownOption<SearchHeaderOptionValue>>): DropdownOption<SearchHeaderOptionValue> | undefined {
    return options.find((option) => option.value === CONST.SEARCH.BULK_ACTION_TYPES.EDIT);
}

// ---- tests ----

const renderHookWithProvider: typeof renderHook = (callback, options) => renderHook(callback, {...options, wrapper: OnyxListItemProvider});

describe('useSearchBulkActions - Edit multiple in grouped views', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        mockSelectedTransactions = {};

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID, email: 'test@example.com'});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy1`, {
            id: 'policy1',
            role: CONST.POLICY.ROLE.ADMIN,
        });
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('shows Edit multiple when only individual expenses are selected', async () => {
        // Given two expenses ticked one by one inside an expanded group
        mockSelectedTransactions = {
            tx1: makeSelectedTransaction('tx1', {groupKey: GROUP_KEY}),
            tx2: makeSelectedTransaction('tx2', {groupKey: GROUP_KEY}),
        };

        // When the bulk actions are built
        const {result} = renderHookWithProvider(() => useSearchBulkActions({queryJSON: groupedQueryJSON}));

        // Then Edit multiple is offered, because the user picked every expense it would edit
        await waitFor(() => {
            expect(getEditMultipleOption(result.current.headerButtonsOptions)).toBeDefined();
        });
    });

    it('hides Edit multiple when a group checkbox selected the loaded expenses', async () => {
        // Given a group checkbox that selected its loaded expenses, which may not be all of the group's expenses
        mockSelectedTransactions = {
            tx1: makeSelectedTransaction('tx1', {groupKey: GROUP_KEY, isSelectedViaGroup: true}),
            tx2: makeSelectedTransaction('tx2', {groupKey: GROUP_KEY, isSelectedViaGroup: true}),
        };

        // When the bulk actions are built
        const {result} = renderHookWithProvider(() => useSearchBulkActions({queryJSON: groupedQueryJSON}));

        // Then Edit multiple is hidden, so it never edits only part of a group the user selected as a whole
        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });
        expect(getEditMultipleOption(result.current.headerButtonsOptions)).toBeUndefined();
    });

    it('hides Edit multiple when a group with no loaded expenses is selected alongside individual expenses', async () => {
        // Given a collapsed group selected under its own key, plus two expenses ticked individually
        mockSelectedTransactions = {
            [GROUP_KEY]: makeSelectedTransaction(GROUP_KEY, {transaction: undefined}),
            tx1: makeSelectedTransaction('tx1'),
            tx2: makeSelectedTransaction('tx2'),
        };

        // When the bulk actions are built
        const {result} = renderHookWithProvider(() => useSearchBulkActions({queryJSON: groupedQueryJSON}));

        // Then Edit multiple is hidden, because the edit would silently skip every expense in the selected group
        await waitFor(() => {
            expect(result.current.headerButtonsOptions.length).toBeGreaterThan(0);
        });
        expect(getEditMultipleOption(result.current.headerButtonsOptions)).toBeUndefined();
    });

    it('shows Edit multiple again once an expense is deselected from a group selection', async () => {
        // Given a group selection where one expense was deselected, which turns the rest into individual selections
        mockSelectedTransactions = {
            tx1: makeSelectedTransaction('tx1', {groupKey: GROUP_KEY, isSelectedViaGroup: false}),
            tx2: makeSelectedTransaction('tx2', {groupKey: GROUP_KEY, isSelectedViaGroup: false}),
        };

        // When the bulk actions are built
        const {result} = renderHookWithProvider(() => useSearchBulkActions({queryJSON: groupedQueryJSON}));

        // Then Edit multiple is offered, because only the loaded expenses the user can see are selected
        await waitFor(() => {
            expect(getEditMultipleOption(result.current.headerButtonsOptions)).toBeDefined();
        });
    });
});
