import {render, renderHook} from '@testing-library/react-native';
import MultiSelectPopup from '@components/Search/FilterDropdowns/MultiSelectPopup';
import UserSelectPopup from '@components/Search/FilterDropdowns/UserSelectPopup';
import useSearchFiltersBar from '@components/Search/SearchPageHeader/useSearchFiltersBar';
import useAdvancedSearchFilters from '@hooks/useAdvancedSearchFilters';
import CONST from '@src/CONST';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';

jest.mock('@components/Search/FilterDropdowns/UserSelectPopup', () => jest.fn(() => null));
jest.mock('@components/Search/FilterDropdowns/MultiSelectPopup', () => jest.fn(() => null));
jest.mock('@components/Search/FilterDropdowns/SingleSelectPopup', () => jest.fn(() => null));
jest.mock('@components/Search/SearchPageHeader/DatePickerFilterPopup', () => jest.fn(() => null));
jest.mock('@components/Search/SearchPageHeader/MultiSelectFilterPopup', () => jest.fn(() => null));
jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: jest.fn(() => ({})),
}));
jest.mock('@components/Search/SearchContext', () => ({
    useSearchStateContext: jest.fn(() => ({
        selectedTransactions: {},
        shouldShowFiltersBarLoading: false,
        currentSearchResults: {errors: {}},
    })),
}));
jest.mock('@hooks/useAdvancedSearchFilters', () =>
    jest.fn(() => ({
        typeFiltersKeys: [[]],
        workspaces: [],
        shouldShowWorkspaceSearchInput: false,
    })),
);
jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: jest.fn(() => ({
        getCurrencySymbol: jest.fn(() => '$'),
    })),
    useCurrencyListState: jest.fn(() => ({
        currencyList: [],
    })),
}));
jest.mock('@hooks/useFeedKeysWithAssignedCards', () => jest.fn(() => []));
jest.mock('@hooks/useFilterFormValues', () => jest.fn(() => ({})));
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({Filter: 'Filter', Columns: 'Columns'})),
}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        localeCompare: (left: string, right: string) => left.localeCompare(right),
    })),
);
jest.mock('@hooks/useNetwork', () =>
    jest.fn(() => ({
        isOffline: false,
    })),
);
jest.mock('@hooks/useOnyx', () =>
    jest.fn((key: string) => {
        if (key === 'searchAdvancedFiltersForm') {
            return [{from: ['123']}];
        }
        if (key === 'session') {
            return ['current@test.com'];
        }
        return [undefined];
    }),
);
jest.mock('@hooks/useResponsiveLayout', () =>
    jest.fn(() => ({
        shouldUseNarrowLayout: false,
        isLargeScreenWidth: true,
    })),
);
jest.mock('@hooks/useTheme', () => jest.fn(() => ({})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({})));
jest.mock('@libs/actions/Modal', () => ({
    close: jest.fn((callback?: () => void) => callback?.()),
}));
jest.mock('@libs/actions/Search', () => ({
    updateAdvancedFilters: jest.fn(),
}));
jest.mock('@libs/DateUtils', () => ({
    formatToReadableString: jest.fn((value: string) => value),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    setParams: jest.fn(),
}));
jest.mock('@libs/PersonalDetailsUtils', () => ({
    getDisplayNameOrDefault: jest.fn((_details: unknown, fallback: string) => fallback),
}));
jest.mock('@libs/SearchQueryUtils', () => ({
    buildFilterQueryWithSortDefaults: jest.fn(() => 'type:expense'),
    isFilterSupported: jest.fn(() => true),
    isSearchDatePreset: jest.fn(() => false),
}));
jest.mock('@libs/SearchUIUtils', () => ({
    filterValidHasValues: jest.fn((value: unknown) => value),
    getFeedOptions: jest.fn(() => []),
    getGroupByOptions: jest.fn(() => []),
    getGroupCurrencyOptions: jest.fn(() => []),
    getHasOptions: jest.fn(() => []),
    getStatusOptions: jest.fn(() => []),
    getTypeOptions: jest.fn(() => [{text: 'Expense', value: 'expense'}]),
    getViewOptions: jest.fn(() => [{text: 'Default', value: 'default'}]),
    getWithdrawalTypeOptions: jest.fn(() => []),
}));

describe('useSearchFiltersBar', () => {
    const mockedUserSelectPopup = jest.mocked(UserSelectPopup);
    const mockedMultiSelectPopup = jest.mocked(MultiSelectPopup);
    const mockedUseAdvancedSearchFilters = jest.mocked(useAdvancedSearchFilters);

    beforeEach(() => {
        mockedUserSelectPopup.mockClear();
        mockedMultiSelectPopup.mockClear();
        mockedUseAdvancedSearchFilters.mockReturnValue({
            typeFiltersKeys: [[]],
            shouldShowWorkspaceSearchInput: false,
            workspaces: [],
        });
    });

    it('passes popup visibility through to the From user popup', () => {
        const {result} = renderHook(() =>
            useSearchFiltersBar(
                {
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    sortBy: 'date',
                    sortOrder: 'desc',
                    flatFilters: [],
                },
                false,
            ),
        );

        const fromFilter = result.current.filters.find((filter) => filter.filterKey === FILTER_KEYS.FROM);
        expect(fromFilter).toBeDefined();

        render(fromFilter?.PopoverComponent({closeOverlay: jest.fn(), isVisible: true}));

        const popupProps = mockedUserSelectPopup.mock.lastCall?.[0];
        expect(popupProps?.isVisible).toBe(true);
    });

    it('passes reorder-on-open through to the Workspace popup', () => {
        mockedUseAdvancedSearchFilters.mockReturnValue({
            typeFiltersKeys: [[]],
            shouldShowWorkspaceSearchInput: true,
            workspaces: [
                {
                    title: 'Workspaces',
                    data: [
                        {text: 'Workspace A', policyID: 'policyA', icons: []},
                        {text: 'Workspace B', policyID: 'policyB', icons: []},
                    ],
                },
            ],
        });

        const {result} = renderHook(() =>
            useSearchFiltersBar(
                {
                    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                    sortBy: 'date',
                    sortOrder: 'desc',
                    flatFilters: [],
                    policyID: ['policyA', 'policyB'],
                },
                false,
            ),
        );

        const workspaceFilter = result.current.filters.find((filter) => filter.filterKey === FILTER_KEYS.POLICY_ID);
        expect(workspaceFilter).toBeDefined();

        render(workspaceFilter?.PopoverComponent({closeOverlay: jest.fn(), isVisible: true}));

        const popupProps = mockedMultiSelectPopup.mock.lastCall?.[0];
        expect(popupProps?.isVisible).toBe(true);
        expect(popupProps?.shouldMoveSelectedItemsToTopOnOpen).toBe(true);
    });
});
