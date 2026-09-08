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
let mockSearchCount: number | undefined;
let mockSearchReportCount: number | undefined;
let mockSearchIsLoading = false;
let mockIsOffline = false;
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
        selectedPolicyIDs: [],
        selectedTransactionReportIDs: [],
        selectedReportIDs: [],
        businessBankAccountOptions: [],
        emptyReportsCount: 0,
        isDuplicateOptionVisible: false,
        isDuplicateReportOptionVisible: false,
        allTransactions: {},
        allReports: {},
        searchData: {},
    }),
}));
jest.mock('@components/Search/SearchContext', () => ({
    useSearchSelectionContext: () => ({
        selectedTransactions: {tx1: {isSelected: true, reportID: 'report1'}},
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

function makeTransaction(): SelectedTransactions[string] {
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
        reportID: 'report1',
        policyID: 'policy1',
        amount: 100,
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

describe('SearchBulkActionsButton all-matching label', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockExcludedTransactions = {};
        mockSearchCount = undefined;
        mockSearchReportCount = undefined;
        mockSearchIsLoading = false;
        mockIsOffline = false;
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
        mockExcludedTransactions = {tx2: makeTransaction()};

        render(<SearchBulkActionsButton queryJSON={reportQueryJSON} />);

        expect(getBarProps()).toEqual({selectedCount: 50, isSelectedCountLoading: false});
    });

    it('falls back to the loaded report count for expense reports offline before the report count arrives', () => {
        mockIsOffline = true;

        render(<SearchBulkActionsButton queryJSON={reportQueryJSON} />);

        expect(getBarProps()).toEqual({selectedCount: 1, isSelectedCountLoading: false});
    });
});
