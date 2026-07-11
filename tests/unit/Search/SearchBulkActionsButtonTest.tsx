import {render} from '@testing-library/react-native';

import SearchBulkActionsButton from '@components/Search/SearchBulkActionsButton';
import type {SearchQueryJSON, SelectedTransactions} from '@components/Search/types';

import CONST from '@src/CONST';

import React from 'react';

const mockButtonWithDropdownMenu = jest.fn(() => null);
let mockExcludedTransactions: SelectedTransactions = {};
let mockSearchCount: number | undefined;
let mockSearchIsLoading = false;

jest.mock('@components/ButtonWithDropdownMenu', () => ({
    __esModule: true,
    default: (props: unknown) => mockButtonWithDropdownMenu(props),
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
jest.mock('@hooks/useNetwork', () => ({__esModule: true, default: () => ({isOffline: false})}));
jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({shouldUseNarrowLayout: false, isSmallScreenWidth: false}),
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
        selectedTransactions: {tx_1: {isSelected: true}},
        excludedTransactions: mockExcludedTransactions,
        selectedReports: [],
        areAllMatchingItemsSelected: true,
    }),
    useSearchResultsContext: () => ({
        currentSearchResults: {search: {count: mockSearchCount, isLoading: mockSearchIsLoading}},
    }),
}));
jest.mock('@libs/ReportUtils', () => ({...jest.requireActual('@libs/ReportUtils'), isExpenseReport: () => false}));
jest.mock('@libs/shouldPopoverUseScrollView', () => ({__esModule: true, default: () => false}));

const queryJSON = {
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    hash: 1,
} as SearchQueryJSON;

function getButtonProps(): {customText: string; isLoading: boolean} {
    const props = mockButtonWithDropdownMenu.mock.calls.at(-1)?.at(0);
    if (!props || typeof props !== 'object' || !('customText' in props) || !('isLoading' in props)) {
        throw new Error('ButtonWithDropdownMenu was not rendered');
    }
    return {customText: props.customText as string, isLoading: props.isLoading as boolean};
}

describe('SearchBulkActionsButton all-matching label', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockExcludedTransactions = {};
        mockSearchCount = undefined;
        mockSearchIsLoading = false;
    });

    it('shows the all-matching label without loading while totals are requested', () => {
        mockSearchIsLoading = true;

        render(<SearchBulkActionsButton queryJSON={queryJSON} />);

        expect(getButtonProps()).toEqual({customText: 'search.exportAll.allMatchingItemsSelected', isLoading: false});
    });

    it('keeps the all-matching label when the server count arrives and there are no exclusions', () => {
        mockSearchCount = 172;

        render(<SearchBulkActionsButton queryJSON={queryJSON} />);

        expect(getButtonProps()).toEqual({customText: 'search.exportAll.allMatchingItemsSelected', isLoading: false});
    });

    it('shows the exact count after an item is excluded', () => {
        mockSearchCount = 172;
        mockExcludedTransactions = {tx_2: {isSelected: true} as SelectedTransactions[string]};

        render(<SearchBulkActionsButton queryJSON={queryJSON} />);

        expect(getButtonProps()).toEqual({customText: 'workspace.common.selected:171', isLoading: false});
    });

    it('loads only when an exclusion exists before the count arrives', () => {
        mockSearchIsLoading = true;
        mockExcludedTransactions = {tx_2: {isSelected: true} as SelectedTransactions[string]};

        render(<SearchBulkActionsButton queryJSON={queryJSON} />);

        expect(getButtonProps()).toEqual({customText: 'search.exportAll.allMatchingItemsSelected', isLoading: true});
    });
});
