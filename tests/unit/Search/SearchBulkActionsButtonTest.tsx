import {render} from '@testing-library/react-native';

import SearchBulkActionsButton from '@components/Search/SearchBulkActionsButton';
import type {SelectedTransactions} from '@components/Search/types';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';

import React from 'react';

type MockBulkActionBarProps = {
    selectedCount: number;
    isSelectedCountLoading: boolean;
};

type MockButtonProps = {
    customText: string;
    isLoading: boolean;
};

const mockBulkActionBar = jest.fn<null, [MockBulkActionBarProps]>(() => null);
const mockButtonWithDropdownMenu = jest.fn<null, [MockButtonProps]>(() => null);
let mockExcludedTransactions: SelectedTransactions = {};
let mockSearchData: Record<string, unknown> = {};
let mockSearchCount: number | undefined;
let mockSearchReportCount: number | undefined;
let mockSearchIsLoading = false;
let mockIsOffline = false;
let mockSelectedTransactions: SelectedTransactions = {tx1: makeTransaction()};
let mockAreAllMatchingItemsSelected = true;
let mockShouldUseNarrowLayout = false;

jest.mock('@components/BulkActionBar', () => ({
    __esModule: true,
    default: (props: MockBulkActionBarProps) => mockBulkActionBar(props),
}));
jest.mock('@components/ButtonWithDropdownMenu', () => ({
    __esModule: true,
    default: (props: MockButtonProps) => mockButtonWithDropdownMenu(props),
}));
jest.mock('@components/DecisionModal', () => () => null);
jest.mock('@components/HoldOrRejectEducationalModal', () => () => null);
jest.mock('@components/HoldSubmitterEducationalModal', () => () => null);
jest.mock('@components/ReportPDFDownloadModal', () => () => null);
jest.mock('@components/KYCWall', () => ({
    __esModule: true,
    default: ({children}: {children: (triggerKYCFlow: jest.Mock, buttonRef: React.RefObject<null>) => React.ReactNode}) => children(jest.fn(), {current: null}),
}));
jest.mock('@components/LockedAccountModalProvider', () => ({
    useLockedAccountState: () => ({isAccountLocked: false}),
    useLockedAccountActions: () => ({showLockedAccountModal: jest.fn()}),
}));
jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    useDelegateNoAccessState: () => ({isDelegateAccessRestricted: false}),
    useDelegateNoAccessActions: () => ({showDelegateNoAccessModal: jest.fn()}),
}));
jest.mock('@hooks/useThemeStyles', () => ({__esModule: true, default: () => ({flexRow: {}, alignItemsCenter: {}, gap3: {}})}));
jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string, params?: {count?: number}) => (params?.count === undefined ? key : `${key}:${params.count}`)}),
}));
jest.mock('@hooks/useNetwork', () => ({__esModule: true, default: () => ({isOffline: mockIsOffline})}));
jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({shouldUseNarrowLayout: mockShouldUseNarrowLayout, isSmallScreenWidth: mockShouldUseNarrowLayout}),
}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({__esModule: true, default: () => ({accountID: 1})}));
jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: () => [undefined]}));
jest.mock('@hooks/usePolicy', () => ({__esModule: true, default: () => undefined}));
jest.mock('@hooks/useSortedActiveAdminPolicies', () => ({__esModule: true, default: () => []}));
jest.mock('@hooks/useSearchBulkActions', () => ({
    __esModule: true,
    default: () => ({
        headerButtonsOptions: [],
        dropdownButtonsOptions: [],
        selectedPolicyIDs: [],
        selectedTransactionReportIDs: [],
        selectedReportIDs: [],
        businessBankAccountOptions: [],
        emptyReportsCount: 0,
        isDuplicateOptionVisible: false,
        isDuplicateReportOptionVisible: false,
        allTransactions: {},
        allReports: {},
        searchData: mockSearchData,
    }),
}));
jest.mock('@components/Search/SearchContext', () => ({
    useSearchSelectionContext: () => ({
        selectedTransactions: mockSelectedTransactions,
        excludedTransactions: mockExcludedTransactions,
        selectedReports: [],
        areAllMatchingItemsSelected: mockAreAllMatchingItemsSelected,
    }),
    useSearchSelectionActions: () => ({
        clearSelectedTransactions: jest.fn(),
    }),
    useSearchResultsContext: () => ({
        currentSearchResults: {search: {count: mockSearchCount, reportCount: mockSearchReportCount, isLoading: mockSearchIsLoading}},
    }),
}));
jest.mock('@libs/ReportUtils', () => {
    const reportUtils: unknown = jest.requireActual('@libs/ReportUtils');
    if (!reportUtils || typeof reportUtils !== 'object') {
        throw new Error('Expected ReportUtils to export an object');
    }
    return {...reportUtils, isExpenseReport: () => false};
});
jest.mock('@libs/shouldPopoverUseScrollView', () => ({__esModule: true, default: () => false}));

const queryJSON = buildSearchQueryJSON('type:expense');
const reportQueryJSON = buildSearchQueryJSON('type:expense-report');
if (!queryJSON || !reportQueryJSON) {
    throw new Error('Expected the search queries to be valid');
}

function makeTransaction(reportID = 'report1'): SelectedTransactions[string] {
    return {
        isSelected: true,
        canReject: false,
        canHold: false,
        canSplit: false,
        hasBeenSplit: false,
        canChangeReport: false,
        isHeld: false,
        canUnhold: false,
        isFromOneTransactionReport: false,
        action: CONST.SEARCH.ACTION_TYPES.VIEW,
        reportID,
        policyID: 'policy1',
        amount: 100,
        displayAmount: 100,
        currency: 'USD',
    };
}

/** The wide layout's floating bar, which labels the selection with a count of its own. */
function getBarProps(): {selectedCount: number; isSelectedCountLoading: boolean} {
    const props = mockBulkActionBar.mock.calls.at(-1)?.at(0);
    if (!props) {
        throw new Error('BulkActionBar was not rendered');
    }
    return {selectedCount: props.selectedCount, isSelectedCountLoading: props.isSelectedCountLoading};
}

/** The narrow layout's dropdown, which is the only place the selection label itself is rendered. */
function getButtonProps(): MockButtonProps {
    const props = mockButtonWithDropdownMenu.mock.calls.at(-1)?.at(0);
    if (!props) {
        throw new Error('ButtonWithDropdownMenu was not rendered');
    }
    return {customText: props.customText, isLoading: props.isLoading};
}

describe('SearchBulkActionsButton all-matching count', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockExcludedTransactions = {};
        mockSelectedTransactions = {tx1: makeTransaction()};
        mockSearchData = {};
        mockSearchCount = undefined;
        mockSearchReportCount = undefined;
        mockSearchIsLoading = false;
        mockIsOffline = false;
        mockSelectedTransactions = {tx1: makeTransaction()};
        mockAreAllMatchingItemsSelected = true;
        mockShouldUseNarrowLayout = false;
    });

    it('shows the all-matching label and keeps loading while the server count is missing', () => {
        mockShouldUseNarrowLayout = true;
        mockSearchIsLoading = true;

        render(<SearchBulkActionsButton queryJSON={queryJSON} />);

        expect(getButtonProps()).toEqual({customText: 'search.exportAll.allMatchingItemsSelected', isLoading: true});
    });

    it('keeps the all-matching label when the server count arrives and there are no exclusions', () => {
        mockShouldUseNarrowLayout = true;
        mockSearchCount = 172;

        render(<SearchBulkActionsButton queryJSON={queryJSON} />);

        expect(getButtonProps()).toEqual({customText: 'search.exportAll.allMatchingItemsSelected', isLoading: false});
    });

    it('counts the whole matching set on the bar, which has no room for the all-matching label', () => {
        mockSearchCount = 172;

        render(<SearchBulkActionsButton queryJSON={queryJSON} />);

        expect(getBarProps()).toEqual({selectedCount: 172, isSelectedCountLoading: false});
    });

    it('keeps the bar loading while the server count is missing, falling back to the loaded count', () => {
        mockSearchIsLoading = true;

        render(<SearchBulkActionsButton queryJSON={queryJSON} />);

        expect(getBarProps()).toEqual({selectedCount: 1, isSelectedCountLoading: true});
    });

    it('shows the exact count after an item is excluded', () => {
        mockSearchCount = 172;
        mockExcludedTransactions = {tx2: makeTransaction()};

        render(<SearchBulkActionsButton queryJSON={queryJSON} />);

        expect(getBarProps()).toEqual({selectedCount: 171, isSelectedCountLoading: false});
    });

    it('keeps the numeric label for page-only selection', () => {
        mockShouldUseNarrowLayout = true;
        mockAreAllMatchingItemsSelected = false;

        render(<SearchBulkActionsButton queryJSON={queryJSON} />);

        expect(getButtonProps()).toEqual({customText: 'workspace.common.selected:1', isLoading: false});
    });

    it('counts the rows of a group checked through its header as the whole group, including the rows not loaded', () => {
        // Given a group of 692 expenses checked through its header with only two of its rows loaded, next to an expense of another group checked on its own
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}2026_10_07`;
        mockAreAllMatchingItemsSelected = false;
        mockSearchData = {[groupKey]: {count: 692, total: 12990, currency: CONST.CURRENCY.USD}};
        mockSelectedTransactions = {
            tx1: {...makeTransaction(), groupKey, isSelectedViaGroup: true},
            tx2: {...makeTransaction(), groupKey, isSelectedViaGroup: true},
            tx3: {...makeTransaction(), groupKey: `${CONST.SEARCH.GROUP_PREFIX}2026_10_03`},
        };

        // When the bar shows that selection
        render(<SearchBulkActionsButton queryJSON={queryJSON} />);

        // Then it counts what an export of the selection covers, which is the whole group plus the other expense
        expect(getBarProps()).toEqual({selectedCount: 693, isSelectedCountLoading: false});
    });

    it('subtracts one expense for a row excluded from Select all after its group was checked through the header', () => {
        // Given Select all with one row unchecked, where the row still carries the claim of the group header that checked it
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}2026_10_07`;
        mockSearchCount = 694;
        mockSearchData = {[groupKey]: {count: 692, total: 12990, currency: CONST.CURRENCY.USD}};
        mockExcludedTransactions = {tx2: {...makeTransaction(), groupKey, isSelectedViaGroup: true}};

        // When the bar shows the selection
        render(<SearchBulkActionsButton queryJSON={queryJSON} />);

        // Then only that row leaves the count, since the rest of its group stays selected
        expect(getBarProps()).toEqual({selectedCount: 693, isSelectedCountLoading: false});
    });

    it('counts a row checked again inside a group excluded whole from Select all', () => {
        // Given Select all over ten expenses, a five-expense group excluded whole, and one of its rows checked again on its own
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}2026_10_07`;
        mockSearchCount = 10;
        mockSearchData = {[groupKey]: {count: 5, total: 500, currency: CONST.CURRENCY.USD}};
        mockExcludedTransactions = {[groupKey]: makeTransaction()};
        mockSelectedTransactions = {tx1: {...makeTransaction(), groupKey}};

        // When the bar shows the selection
        render(<SearchBulkActionsButton queryJSON={queryJSON} />);

        // Then the row counts alongside the five expenses still selected, as its checkbox shows
        expect(getBarProps()).toEqual({selectedCount: 6, isSelectedCountLoading: false});
    });

    it('keeps loading when an exclusion exists before the count arrives', () => {
        mockSearchIsLoading = true;
        mockExcludedTransactions = {tx2: makeTransaction()};

        render(<SearchBulkActionsButton queryJSON={queryJSON} />);

        expect(getBarProps()).toEqual({selectedCount: 1, isSelectedCountLoading: true});
    });

    it('shows the loaded selected count when an expense is excluded offline before the server count is available', () => {
        mockIsOffline = true;
        mockExcludedTransactions = {tx2: makeTransaction()};

        render(<SearchBulkActionsButton queryJSON={queryJSON} />);

        expect(getBarProps()).toEqual({selectedCount: 1, isSelectedCountLoading: false});
    });

    it('keeps loading for expense reports while the server report count is missing, falling back to the loaded report count', () => {
        mockSearchIsLoading = true;

        render(<SearchBulkActionsButton queryJSON={reportQueryJSON} />);

        expect(getBarProps()).toEqual({selectedCount: 1, isSelectedCountLoading: true});
    });

    it('labels expense reports with the server report count, not the expense count', () => {
        // `count` is the expense total; `reportCount` is the matching-report total the Reports tab must show.
        mockSearchCount = 320;
        mockSearchReportCount = 50;

        render(<SearchBulkActionsButton queryJSON={reportQueryJSON} />);

        expect(getBarProps()).toEqual({selectedCount: 50, isSelectedCountLoading: false});
    });

    it('subtracts excluded reports from the server report count', () => {
        mockSearchCount = 320;
        mockSearchReportCount = 50;
        mockSelectedTransactions = {tx1: makeTransaction('report1'), tx2: makeTransaction('report2')};
        mockExcludedTransactions = {tx3: makeTransaction('report3'), tx4: makeTransaction('report3')};

        render(<SearchBulkActionsButton queryJSON={reportQueryJSON} />);

        expect(getBarProps()).toEqual({selectedCount: 49, isSelectedCountLoading: false});
    });

    it('falls back to the loaded report count for expense reports offline before the report count arrives', () => {
        mockIsOffline = true;

        render(<SearchBulkActionsButton queryJSON={reportQueryJSON} />);

        expect(getBarProps()).toEqual({selectedCount: 1, isSelectedCountLoading: false});
    });
});

describe('SearchBulkActionsButton group selection label', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockExcludedTransactions = {};
        mockSelectedTransactions = {};
        mockSearchData = {};
        mockSearchCount = undefined;
        mockSearchIsLoading = false;
        mockIsOffline = false;
        mockAreAllMatchingItemsSelected = false;
        mockShouldUseNarrowLayout = false;
    });

    const selectGroups = (...keys: string[]) => {
        mockSelectedTransactions = Object.fromEntries(keys.map((key) => [key, makeTransaction()]));
    };

    it('counts the expenses a selected settlement group holds', () => {
        // Given a selected settlement that holds 12 expenses
        mockSearchData = {[`${CONST.SEARCH.GROUP_PREFIX}cleared`]: {count: 12}};
        selectGroups(`${CONST.SEARCH.GROUP_PREFIX}cleared`);

        // When the selection count renders
        render(<SearchBulkActionsButton queryJSON={queryJSON} />);

        // Then the count reflects the expenses inside the settlement
        expect(getBarProps().selectedCount).toBe(12);
    });

    it('counts a selected cash back group as one item even though it holds no expenses', () => {
        // Given a selected cash back row, which holds no expenses
        mockSearchData = {[`${CONST.SEARCH.GROUP_PREFIX}cashBack`]: {count: 0, isCashBack: true}};
        selectGroups(`${CONST.SEARCH.GROUP_PREFIX}cashBack`);

        // When the selection count renders
        render(<SearchBulkActionsButton queryJSON={queryJSON} />);

        // Then it still counts as one selected item, so the header never says 0 selected
        expect(getBarProps().selectedCount).toBe(1);
    });

    it('keeps the all-matching count when the cash back row is unchecked after selecting all', () => {
        // Given every match is selected and the cash back row is then unchecked
        mockAreAllMatchingItemsSelected = true;
        mockSearchCount = 50;
        mockSearchData = {[`${CONST.SEARCH.GROUP_PREFIX}cashBack`]: {count: 0, isCashBack: true}};
        mockExcludedTransactions = {[`${CONST.SEARCH.GROUP_PREFIX}cashBack`]: makeTransaction()};

        // When the selection count renders
        render(<SearchBulkActionsButton queryJSON={queryJSON} />);

        // Then nothing is taken off the server count, because that count only sums expenses and the credit holds none
        expect(getBarProps().selectedCount).toBe(50);
    });

    it('adds the cash back row to the expenses of the settlements selected alongside it', () => {
        // Given a cash back row selected alongside a settlement of 12 expenses
        mockSearchData = {
            [`${CONST.SEARCH.GROUP_PREFIX}cashBack`]: {count: 0, isCashBack: true},
            [`${CONST.SEARCH.GROUP_PREFIX}cleared`]: {count: 12},
        };
        selectGroups(`${CONST.SEARCH.GROUP_PREFIX}cashBack`, `${CONST.SEARCH.GROUP_PREFIX}cleared`);

        // When the selection count renders
        render(<SearchBulkActionsButton queryJSON={queryJSON} />);

        // Then the cash back row adds one to the settlement's expenses
        expect(getBarProps().selectedCount).toBe(13);
    });
});
