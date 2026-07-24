import {renderHook} from '@testing-library/react-native';

import {
    buildNavigationSuggestions,
    isNavigationIntentOnlyQuery,
    matchesNavigationQuery,
    MAX_NAVIGATION_SUGGESTIONS,
    sortNavigationSuggestionItems,
    stripNavigationIntentPrefix,
} from '@components/Search/SearchRouter/SearchRouterHelpers';
import useNavigationSuggestions, {buildSpendNavigationItems, buildTopLevelNavigationItems} from '@components/Search/SearchRouter/useNavigationSuggestions';

import {setSearchContext} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import navigateToCannedSpendSearch from '@libs/SearchNavigationUtils';
import type {SearchTypeMenuItem, SearchTypeMenuSection} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';

import {isValidElement} from 'react';

type MockSearchTypeMenuSectionsResult = {
    typeMenuSections: SearchTypeMenuSection[];
    activeItemIndex: number;
    activeKey: string | undefined;
};

const mockUseSearchTypeMenuSections = jest.fn<MockSearchTypeMenuSectionsResult, [queryParams: unknown, isScreenFocused: boolean]>();
const mockUseMemoizedLazyExpensifyIcons = jest.fn<Record<string, IconAsset>, []>();
const mockClearSelectedTransactions = jest.fn();

jest.mock('@components/Search/SearchContext', () => ({
    useSearchSelectionActions: () => ({clearSelectedTransactions: mockClearSelectedTransactions}),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => mockUseMemoizedLazyExpensifyIcons(),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        localeCompare: (firstValue: string, secondValue: string) => firstValue.localeCompare(secondValue),
        translate: (key: string, params?: {destination?: string}) => {
            if (key === 'search.goTo') {
                return `Go to ${params?.destination}`;
            }

            const translations = new Map([
                ['common.home', 'Home'],
                ['common.inbox', 'Inbox'],
                ['common.spend', 'Spend'],
                ['common.workspacesTabTitle', 'Workspaces'],
                ['initialSettingsPage.account', 'Account'],
                ['search.tabs.reports', 'Reports'],
                ['search.tabs.expenses', 'Expenses'],
            ]);
            return translations.get(key) ?? key;
        },
    }),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [undefined],
}));

jest.mock('@hooks/useSearchTypeMenuSections', () => ({
    __esModule: true,
    default: (queryParams: unknown, isScreenFocused: boolean) => mockUseSearchTypeMenuSections(queryParams, isScreenFocused),
}));

jest.mock('@libs/actions/Search', () => ({
    setSearchContext: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
    },
}));

const localeCompare = (firstValue: string, secondValue: string) => firstValue.localeCompare(secondValue);
const mockIcon: IconAsset = () => null;
const spendIcons = {
    Basket: mockIcon,
    CalendarSolid: mockIcon,
    Receipt: mockIcon,
    MoneyBag: mockIcon,
    CreditCard: mockIcon,
    MoneyHourglass: mockIcon,
    CreditCardHourglass: mockIcon,
    Bank: mockIcon,
    User: mockIcon,
    Folder: mockIcon,
    Document: mockIcon,
    Pencil: mockIcon,
    ThumbsUp: mockIcon,
    CheckCircle: mockIcon,
};

function createSpendMenuItem(
    key: SearchTypeMenuItem['key'],
    translationPath: SearchTypeMenuItem['translationPath'],
    icon: SearchTypeMenuItem['icon'],
    searchQuery: string,
): SearchTypeMenuItem {
    return {
        key,
        translationPath,
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        icon,
        searchQuery,
        searchQueryJSON: undefined,
        hash: 1,
        similarSearchHash: 1,
        recentSearchHash: 1,
    };
}

describe('Search Router navigation query helpers', () => {
    it.each([
        ['go inbox', 'inbox'],
        ['go        inbox', 'inbox'],
        ['go to inbox', 'inbox'],
        ['go       to      inbox', 'inbox'],
        ['Go To Inbox', 'Inbox'],
        ['  go to inbox  ', 'inbox'],
        ['inbox', 'inbox'],
    ])('normalizes navigation intent in "%s"', (query, expectedQuery) => {
        expect(stripNavigationIntentPrefix(query)).toBe(expectedQuery);
    });

    it.each(['go', 'go to', 'Go', 'Go To'])('recognizes "%s" as a navigation-only query', (query) => {
        expect(isNavigationIntentOnlyQuery(query)).toBe(true);
    });

    it('matches case-insensitively and ignores accents', () => {
        expect(matchesNavigationQuery('INBOX', 'Go to Inbox')).toBe(true);
        expect(matchesNavigationQuery('cafe', 'Café')).toBe(true);
        expect(matchesNavigationQuery('inbox', 'Go to Home')).toBe(false);
    });

    it('does not return navigation rows for one- or two-character non-intent queries', () => {
        const source = [[{text: 'Go to Inbox', keyForList: 'inbox', matchTerms: ['Inbox']}]];

        expect(buildNavigationSuggestions('a', source, localeCompare)).toEqual([]);
        expect(buildNavigationSuggestions('ab', source, localeCompare)).toEqual([]);
    });

    it('returns before processing navigation sources for an empty query', () => {
        const source = [[{text: 'Go to Inbox', keyForList: 'inbox', matchTerms: ['Inbox']}]];
        const compare = jest.fn(localeCompare);

        expect(buildNavigationSuggestions('   ', source, compare)).toEqual([]);
        expect(compare).not.toHaveBeenCalled();
    });

    it('does not match text from the Go to label', () => {
        const source = [[{text: 'Go to Inbox', keyForList: 'inbox', matchTerms: ['Inbox']}]];

        expect(buildNavigationSuggestions('to i', source, localeCompare)).toEqual([]);
        expect(buildNavigationSuggestions('o inbox', source, localeCompare)).toEqual([]);
    });

    it('does not include internal matching terms in returned navigation rows', () => {
        const source = [[{text: 'Go to Inbox', keyForList: 'inbox', matchTerms: ['Inbox']}]];

        expect(buildNavigationSuggestions('inbox', source, localeCompare).at(0)).not.toHaveProperty('matchTerms');
    });

    it('matches short queries only when they exactly match a localized destination', () => {
        const source = [
            [
                {text: '前往支出', keyForList: 'spend', matchTerms: ['支出']},
                {text: '前往账户', keyForList: 'account', matchTerms: ['账户']},
            ],
        ];

        expect(buildNavigationSuggestions('支出', source, localeCompare).map((item) => item.keyForList)).toEqual(['spend']);
        expect(buildNavigationSuggestions('go to 账户', source, localeCompare).map((item) => item.keyForList)).toEqual(['account']);
        expect(buildNavigationSuggestions('支', source, localeCompare)).toEqual([]);
        expect(buildNavigationSuggestions('go 支', source, localeCompare)).toEqual([]);
    });

    it.each(['inbox', 'go inbox', 'go        inbox', 'go to inbox', 'go       to      inbox', 'Go To Inbox'])('matches the Inbox destination for "%s"', (query) => {
        const source = [
            [
                {text: 'Go to Home', keyForList: 'home', matchTerms: ['Home']},
                {text: 'Go to Inbox', keyForList: 'inbox', matchTerms: ['Inbox']},
            ],
        ];

        expect(buildNavigationSuggestions(query, source, localeCompare).map((item) => item.keyForList)).toEqual(['inbox']);
    });

    it('shows navigation rows for bare go intents and caps the result', () => {
        const source = [Array.from({length: 12}, (_, index) => ({text: `Go to Item ${index}`, keyForList: `item-${index}`}))];

        expect(buildNavigationSuggestions('go', source, localeCompare)).toHaveLength(MAX_NAVIGATION_SUGGESTIONS);
        expect(buildNavigationSuggestions('go to', source, localeCompare)).toHaveLength(MAX_NAVIGATION_SUGGESTIONS);
    });

    it('sorts items alphabetically without mutating the source', () => {
        const source = [
            {text: 'Go to Inbox', keyForList: 'inbox'},
            {text: 'Go to Home', keyForList: 'home'},
        ];

        expect(sortNavigationSuggestionItems(source, localeCompare).map((item) => item.keyForList)).toEqual(['home', 'inbox']);
        expect(source.map((item) => item.keyForList)).toEqual(['inbox', 'home']);
    });
});

describe('top-level Search Router navigation source', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('builds only the five original top-level destinations with Go to labels', () => {
        const items = buildTopLevelNavigationItems({
            labels: {
                home: 'Home',
                inbox: 'Inbox',
                spend: 'Spend',
                workspaces: 'Workspaces',
                account: 'Account',
            },
            icons: {
                Home: mockIcon,
                Inbox: mockIcon,
                ReceiptMultiple: mockIcon,
                Building: mockIcon,
                Gear: mockIcon,
            },
            getSpendRoute: () => ROUTES.SEARCH_ROOT.getRoute({query: 'type:expense'}),
            getDestinationText: (destination) => `Go to ${destination}`,
        });

        expect(items.map((item) => item.text)).toEqual(['Go to Home', 'Go to Inbox', 'Go to Spend', 'Go to Workspaces', 'Go to Account']);
        expect(items.map((item) => item.keyForList)).toEqual(['topLevelHome', 'topLevelInbox', 'topLevelSpend', 'topLevelWorkspaces', 'topLevelAccount']);
    });

    it('navigates each top-level row to its intended route', () => {
        const spendRoute = ROUTES.SEARCH_ROOT.getRoute({query: 'type:expense'});
        const getSpendRoute = jest.fn(() => spendRoute);
        const items = buildTopLevelNavigationItems({
            labels: {
                home: 'Home',
                inbox: 'Inbox',
                spend: 'Spend',
                workspaces: 'Workspaces',
                account: 'Account',
            },
            icons: {
                Home: mockIcon,
                Inbox: mockIcon,
                ReceiptMultiple: mockIcon,
                Building: mockIcon,
                Gear: mockIcon,
            },
            getSpendRoute,
            getDestinationText: (destination) => `Go to ${destination}`,
        });

        for (const item of items) {
            item.action?.();
        }

        expect(Navigation.navigate).toHaveBeenNthCalledWith(1, ROUTES.HOME);
        expect(Navigation.navigate).toHaveBeenNthCalledWith(2, ROUTES.INBOX);
        expect(Navigation.navigate).toHaveBeenNthCalledWith(3, spendRoute);
        expect(getSpendRoute).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenNthCalledWith(4, ROUTES.WORKSPACES_LIST.route);
        expect(Navigation.navigate).toHaveBeenNthCalledWith(5, ROUTES.SETTINGS);
    });
});

describe('Spend Search Router navigation source', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('reuses Spend menu labels, icons, queries, and excludes saved searches', () => {
        const reportsQuery = 'type:expense-report';
        const expensesQuery = 'type:expense';
        const sections: SearchTypeMenuSection[] = [
            {
                translationPath: 'search.tabs.expenseReports',
                menuItems: [
                    createSpendMenuItem(CONST.SEARCH.SEARCH_KEYS.REPORTS, 'search.tabs.reports', 'Document', reportsQuery),
                    createSpendMenuItem(CONST.SEARCH.SEARCH_KEYS.EXPENSES, 'search.tabs.expenses', 'Receipt', expensesQuery),
                ],
            },
            {
                translationPath: 'search.savedSearchesMenuItemTitle',
                menuItems: [createSpendMenuItem(`${CONST.SEARCH.SAVED_SEARCH_PREFIX}1`, 'search.tabs.expenses', 'Receipt', 'saved-search-query')],
            },
        ];
        const rightElement = 'Spend';
        const onSelect = jest.fn();
        const labels = new Map<SearchTypeMenuItem['translationPath'], string>([
            ['search.tabs.reports', 'Reports'],
            ['search.tabs.expenses', 'Expenses'],
        ]);

        const items = buildSpendNavigationItems({
            sections,
            icons: spendIcons,
            rightElement,
            getItemText: (item) => labels.get(item.translationPath) ?? item.translationPath,
            getDestinationText: (destination) => `Go to ${destination}`,
            onSelect,
        });

        expect(items.map((item) => item.text)).toEqual(['Go to Reports', 'Go to Expenses']);
        expect(items.map((item) => item.keyForList)).toEqual(['spend_reports', 'spend_expenses']);
        expect(items.map((item) => item.singleIcon)).toEqual([mockIcon, mockIcon]);
        expect(items.map((item) => item.rightElement)).toEqual([rightElement, rightElement]);
        expect(items.map((item) => item.matchTerms)).toEqual([['Reports'], ['Expenses']]);

        items.at(0)?.action?.();
        expect(onSelect).toHaveBeenCalledWith(reportsQuery);
    });

    it('does not use the right-side Spend context as a matching term', () => {
        const items = buildSpendNavigationItems({
            sections: [
                {
                    translationPath: 'search.tabs.expenseReports',
                    menuItems: [createSpendMenuItem(CONST.SEARCH.SEARCH_KEYS.REPORTS, 'search.tabs.reports', 'Document', 'type:expense-report')],
                },
            ],
            icons: spendIcons,
            rightElement: 'Spend',
            getItemText: () => 'Reports',
            getDestinationText: (destination) => `Go to ${destination}`,
            onSelect: jest.fn(),
        });

        expect(buildNavigationSuggestions('spend', [items], localeCompare)).toEqual([]);
        expect(buildNavigationSuggestions('reports', [items], localeCompare).map((item) => item.keyForList)).toEqual(['spend_reports']);
    });

    it('keeps top-level priority and alphabetizes Spend results', () => {
        const topLevelItems = [{text: 'Go to Spend', keyForList: 'topLevelSpend', matchTerms: ['Spend']}];
        const spendItems = [
            {text: 'Go to Reports', keyForList: 'spend_reports', matchTerms: ['Reports']},
            {text: 'Go to Expenses', keyForList: 'spend_expenses', matchTerms: ['Expenses']},
        ];

        expect(buildNavigationSuggestions('go', [topLevelItems, spendItems], localeCompare).map((item) => item.keyForList)).toEqual(['topLevelSpend', 'spend_expenses', 'spend_reports']);
    });

    it('clears selected transactions and stale search context before opening a canned Spend search', () => {
        const clearSelectedTransactions = jest.fn();
        const searchQuery = 'type:expense sortBy:date sortOrder:desc';

        navigateToCannedSpendSearch(searchQuery, clearSelectedTransactions);

        expect(clearSelectedTransactions).toHaveBeenCalledTimes(1);
        expect(setSearchContext).toHaveBeenCalledWith(false);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: searchQuery}));
        expect(clearSelectedTransactions.mock.invocationCallOrder.at(0)).toBeLessThan(jest.mocked(setSearchContext).mock.invocationCallOrder.at(0) ?? 0);
        expect(jest.mocked(setSearchContext).mock.invocationCallOrder.at(0)).toBeLessThan(jest.mocked(Navigation.navigate).mock.invocationCallOrder.at(0) ?? 0);
    });

    it('composes Spend suggestions from the menu hook with icons, context, exclusions, and approval gating', () => {
        const reportsIcon: IconAsset = () => null;
        const spendContextIcon: IconAsset = () => null;
        mockUseMemoizedLazyExpensifyIcons.mockReturnValue({
            ...spendIcons,
            Home: mockIcon,
            Inbox: mockIcon,
            ReceiptMultiple: spendContextIcon,
            Building: mockIcon,
            Gear: mockIcon,
            Document: reportsIcon,
        });
        mockUseSearchTypeMenuSections.mockReturnValue({
            typeMenuSections: [
                {
                    translationPath: 'search.tabs.expenseReports',
                    menuItems: [createSpendMenuItem(CONST.SEARCH.SEARCH_KEYS.REPORTS, 'search.tabs.reports', 'Document', 'type:expense-report')],
                },
                {
                    translationPath: 'search.savedSearchesMenuItemTitle',
                    menuItems: [createSpendMenuItem(`${CONST.SEARCH.SAVED_SEARCH_PREFIX}1`, 'search.tabs.reports', 'Receipt', 'saved-search-query')],
                },
            ],
            activeItemIndex: -1,
            activeKey: undefined,
        });

        const {result, rerender} = renderHook(({shouldWatchForApprovals}) => useNavigationSuggestions('reports', shouldWatchForApprovals), {
            initialProps: {shouldWatchForApprovals: false},
        });

        expect(mockUseSearchTypeMenuSections).toHaveBeenLastCalledWith(undefined, false);
        expect(result.current).toHaveLength(1);
        expect(result.current.at(0)).toMatchObject({
            text: 'Go to Reports',
            keyForList: 'spend_reports',
            singleIcon: reportsIcon,
        });
        expect(result.current.some((item) => item.keyForList === `spend_${CONST.SEARCH.SAVED_SEARCH_PREFIX}1`)).toBe(false);

        const rightElement = result.current.at(0)?.rightElement;
        expect(isValidElement<{label: string; icon: IconAsset}>(rightElement)).toBe(true);
        if (!isValidElement<{label: string; icon: IconAsset}>(rightElement)) {
            throw new Error('Expected Spend navigation context to be a React element');
        }
        expect(rightElement.props).toMatchObject({text: 'Spend', icon: spendContextIcon, showTooltip: false});

        rerender({shouldWatchForApprovals: true});
        expect(mockUseSearchTypeMenuSections).toHaveBeenLastCalledWith(undefined, true);
    });
});
