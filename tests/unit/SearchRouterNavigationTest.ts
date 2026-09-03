import {renderHook} from '@testing-library/react-native';

import {
    buildNavigationSuggestions,
    isNavigationIntentOnlyQuery,
    matchesNavigationQuery,
    MAX_NAVIGATION_SUGGESTIONS,
    sortNavigationSuggestionItems,
    stripNavigationIntentPrefix,
} from '@components/Search/SearchRouter/SearchRouterHelpers';
import type {NavigationSuggestionSourceItem} from '@components/Search/SearchRouter/SearchRouterHelpers';
import * as CreateNavigationSuggestions from '@components/Search/SearchRouter/useCreateNavigationSuggestions';
import useNavigationSuggestions, {
    buildAccountNavigationItems,
    buildDomainNavigationItems,
    buildSpendNavigationItems,
    buildTopLevelNavigationItems,
    buildWorkspaceNavigationItems,
} from '@components/Search/SearchRouter/useNavigationSuggestions';

import {setSearchContext} from '@libs/actions/Search';
import navigateToWorkspaceSettingsRoute from '@libs/Navigation/helpers/navigateToWorkspaceSettingsRoute';
import Navigation from '@libs/Navigation/Navigation';
import navigateToCannedSpendSearch from '@libs/SearchNavigationUtils';
import type {SearchTypeMenuItem, SearchTypeMenuSection} from '@libs/SearchUIUtils';

import type {MenuData, MenuSection} from '@pages/settings/useSettingsNavigationMenuData';
import getWorkspaceMenuItems from '@pages/workspace/getWorkspaceMenuItems';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Domain, Policy} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';

import {isValidElement} from 'react';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';

type MockSearchTypeMenuSectionsResult = {
    typeMenuSections: SearchTypeMenuSection[];
    activeItemIndex: number;
    activeKey: string | undefined;
};

type GetWorkspaceMenuItems = typeof getWorkspaceMenuItems;

const mockUseSearchTypeMenuSections = jest.fn<MockSearchTypeMenuSectionsResult, [queryParams: unknown, isScreenFocused: boolean]>();
const mockUseMemoizedLazyExpensifyIcons = jest.fn<Record<string, IconAsset>, []>();
const mockUseCreateNavigationSuggestions = jest.fn<NavigationSuggestionSourceItem[], []>(() => []);
const mockUseSettingsNavigationMenuData = jest.fn<{accountMenuItemsData: MenuSection; generalMenuItemsData: MenuSection}, []>();
const mockClearSelectedTransactions = jest.fn();
const mockUseOnyx = jest.fn<[unknown], [key: string]>(() => [undefined]);
const mockUseNetwork = jest.fn<{isOffline: boolean}, []>(() => ({isOffline: false}));
const mockIsBetaEnabled = jest.fn<boolean, [beta: string]>(() => false);
const currentUserAccountID = 1;

jest.mock('@components/Search/SearchContext', () => ({
    useSearchSelectionActions: () => ({clearSelectedTransactions: mockClearSelectedTransactions}),
}));

jest.mock('@components/Search/SearchRouter/useCreateNavigationSuggestions', () => ({
    __esModule: true,
    ...jest.requireActual<typeof CreateNavigationSuggestions>('@components/Search/SearchRouter/useCreateNavigationSuggestions'),
    default: () => mockUseCreateNavigationSuggestions(),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => mockUseMemoizedLazyExpensifyIcons(),
}));

jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({convertToDisplayString: jest.fn(() => '$0.00')}),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: 1}),
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
                ['common.domains', 'Domains'],
                ['initialSettingsPage.account', 'Account'],
                ['domain.domainMembers', 'Domain members'],
                ['domain.domainAdmins', 'Domain admins'],
                ['domain.groups.title', 'Groups'],
                ['domain.saml', 'SAML'],
                ['common.profile', 'Profile'],
                ['initialSettingsPage.security', 'Security'],
                ['initialSettingsPage.help', 'Help'],
                ['search.tabs.reports', 'Reports'],
                ['search.tabs.expenses', 'Expenses'],
                ['workspace.common.profile', 'Overview'],
            ]);
            return translations.get(key) ?? key;
        },
    }),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string) => mockUseOnyx(key),
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => mockUseNetwork(),
}));

jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: (beta: string) => mockIsBetaEnabled(beta)}),
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({shouldUseNarrowLayout: false}),
}));

jest.mock('@hooks/useSearchTypeMenuSections', () => ({
    __esModule: true,
    default: (queryParams: unknown, isScreenFocused: boolean) => mockUseSearchTypeMenuSections(queryParams, isScreenFocused),
}));

jest.mock('@pages/settings/useSettingsNavigationMenuData', () => ({
    __esModule: true,
    default: () => mockUseSettingsNavigationMenuData(),
}));

jest.mock('@pages/workspace/getWorkspaceMenuItems', () => {
    const actual = jest.requireActual<{default: GetWorkspaceMenuItems}>('@pages/workspace/getWorkspaceMenuItems');
    return {__esModule: true, ...actual, default: jest.fn(actual.default)};
});

jest.mock('@libs/actions/Search', () => ({
    setSearchContext: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        dismissModal: jest.fn(),
        isTopmostRouteModalScreen: jest.fn(() => false),
        navigate: jest.fn(),
    },
}));

jest.mock('@libs/Navigation/helpers/navigateToWorkspaceSettingsRoute', () => jest.fn());

const localeCompare = (firstValue: string, secondValue: string) => firstValue.localeCompare(secondValue);
const mockIcon: IconAsset = () => null;
const workspaceCurrentUserLogin = 'member@example.com';
const domainIcons = {
    Globe: mockIcon,
    UserLock: mockIcon,
    UserShield: mockIcon,
    User: mockIcon,
    Users: mockIcon,
};
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
    UserEye: mockIcon,
};
const workspaceIcons = {
    Building: mockIcon,
    Users: mockIcon,
    Hashtag: mockIcon,
    Document: mockIcon,
    Sync: mockIcon,
    Receipt: mockIcon,
    Briefcase: mockIcon,
    Folder: mockIcon,
    Tag: mockIcon,
    Coins: mockIcon,
    Workflows: mockIcon,
    Feed: mockIcon,
    Car: mockIcon,
    LuggageWithLines: mockIcon,
    ExpensifyCard: mockIcon,
    CreditCard: mockIcon,
    CalendarSolid: mockIcon,
    Clock: mockIcon,
    InvoiceGeneric: mockIcon,
    Gear: mockIcon,
    Bolt: mockIcon,
};

function createWorkspacePolicy(id: string, name: string, overrides: Partial<Policy> = {}): Policy {
    return createMock<Policy>({
        ...createRandomPolicy(Number(id), CONST.POLICY.TYPE.CORPORATE, name),
        id,
        name,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: workspaceCurrentUserLogin,
        employeeList: {[workspaceCurrentUserLogin]: {role: CONST.POLICY.ROLE.ADMIN}},
        pendingAction: undefined,
        errorFields: {},
        ...overrides,
    });
}

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

function createSettingsMenuItem(translationKey: MenuData['translationKey'], screenName?: MenuData['screenName'], action = jest.fn()): MenuData {
    return {
        translationKey,
        icon: mockIcon,
        screenName,
        sentryLabel: translationKey,
        action,
    };
}

beforeEach(() => {
    mockUseOnyx.mockImplementation(() => [undefined]);
    mockUseNetwork.mockReturnValue({isOffline: false});
    mockIsBetaEnabled.mockReturnValue(false);
    mockUseSettingsNavigationMenuData.mockReturnValue({
        accountMenuItemsData: {sectionTranslationKey: 'initialSettingsPage.account', items: []},
        generalMenuItemsData: {sectionTranslationKey: 'initialSettingsPage.general', items: []},
    });
});

describe('Search Router navigation query helpers', () => {
    it.each([
        ['go inbox', 'inbox'],
        ['go        inbox', 'inbox'],
        ['go to inbox', 'inbox'],
        ['go       to      inbox', 'inbox'],
        ['Go To Inbox', 'Inbox'],
        ['  go to inbox  ', 'inbox'],
        ['ready      to       pay', 'ready to pay'],
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

    it('does not include internal matching or sorting metadata in returned navigation rows', () => {
        const source = [[{text: 'Go to Inbox', keyForList: 'inbox', matchTerms: ['Inbox'], sortText: 'Inbox'}]];
        const item = buildNavigationSuggestions('inbox', source, localeCompare).at(0);

        expect(item).not.toHaveProperty('matchTerms');
        expect(item).not.toHaveProperty('sortText');
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

    it.each(['ready to pay', 'ready      to       pay', 'go to ready      to       pay'])('matches a multi-word destination for "%s"', (query) => {
        const source = [[{text: 'Go to Ready to pay', keyForList: 'readyToPay', matchTerms: ['Ready to pay']}]];

        expect(buildNavigationSuggestions(query, source, localeCompare).map((item) => item.keyForList)).toEqual(['readyToPay']);
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

    it('builds the top-level destinations with Go to labels', () => {
        const items = buildTopLevelNavigationItems({
            labels: {
                home: 'Home',
                inbox: 'Inbox',
                spend: 'Spend',
                workspaces: 'Workspaces',
                domains: 'Domains',
                account: 'Account',
            },
            icons: {
                Home: mockIcon,
                Inbox: mockIcon,
                ReceiptMultiple: mockIcon,
                Building: mockIcon,
                Globe: mockIcon,
                Gear: mockIcon,
            },
            getSpendRoute: () => ROUTES.SEARCH_ROOT.getRoute({query: 'type:expense'}),
            getDestinationText: (destination) => `Go to ${destination}`,
        });

        expect(items.map((item) => item.text)).toEqual(['Go to Home', 'Go to Inbox', 'Go to Spend', 'Go to Workspaces', 'Go to Domains', 'Go to Account']);
        expect(items.map((item) => item.keyForList)).toEqual(['topLevelHome', 'topLevelInbox', 'topLevelSpend', 'topLevelWorkspaces', 'topLevelDomains', 'topLevelAccount']);
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
                domains: 'Domains',
                account: 'Account',
            },
            icons: {
                Home: mockIcon,
                Inbox: mockIcon,
                ReceiptMultiple: mockIcon,
                Building: mockIcon,
                Globe: mockIcon,
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
        expect(Navigation.navigate).toHaveBeenNthCalledWith(5, ROUTES.DOMAINS_LIST.route);
        expect(Navigation.navigate).toHaveBeenNthCalledWith(6, ROUTES.SETTINGS);
    });
});

describe('Domain Search Router navigation source', () => {
    const adminAccessKey = `${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}${currentUserAccountID}` as const;
    const defaultSecurityGroupIDKey = 'domain_defaultSecurityGroupID' as const;
    const labels = new Map([
        ['domain.domainMembers', 'Domain members'],
        ['domain.domainAdmins', 'Domain admins'],
        ['domain.groups.title', 'Groups'],
        ['domain.saml', 'SAML'],
    ]);

    function createDomain(accountID: number, email: string, adminAccountID: number, pendingAction?: Domain['pendingAction']): Domain {
        return {
            accountID,
            email,
            validated: true,
            [defaultSecurityGroupIDKey]: '1',
            pendingAction,
            [adminAccessKey]: adminAccountID,
        };
    }

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseOnyx.mockReturnValue([undefined]);
        mockUseCreateNavigationSuggestions.mockReturnValue([]);
    });

    it('reuses the shared Domain menu and includes only domains the current user can administer', () => {
        const accessibleDomain = createDomain(123, 'admin@example.com', currentUserAccountID);
        const inaccessibleDomain = createDomain(456, 'admin@inaccessible.com', 2);
        const deletingDomain = createDomain(789, 'admin@deleting.com', currentUserAccountID, CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        const domainWithoutAccountID = createDomain(0, 'admin@noid.com', currentUserAccountID);
        const onSelect = jest.fn();

        const items = buildDomainNavigationItems({
            domains: [null, undefined, domainWithoutAccountID, accessibleDomain, inaccessibleDomain, deletingDomain],
            currentUserAccountID,
            icons: domainIcons,
            getItemText: (translationKey) => labels.get(translationKey) ?? translationKey,
            getDestinationText: (destination) => `Go to ${destination}`,
            getDomainContext: (domainName) => domainName,
            onSelect,
        });

        expect(items.map((item) => item.text)).toEqual(['Go to Domain members', 'Go to Domain admins', 'Go to Groups', 'Go to SAML']);
        expect(items.map((item) => item.singleIcon)).toEqual([domainIcons.User, domainIcons.UserShield, domainIcons.Users, domainIcons.UserLock]);
        expect(items.map((item) => item.rightElement)).toEqual(['example.com', 'example.com', 'example.com', 'example.com']);
        expect(items.map((item) => item.matchTerms)).toEqual([
            ['Domain members', 'example.com'],
            ['Domain admins', 'example.com'],
            ['Groups', 'example.com'],
            ['SAML', 'example.com'],
        ]);
        expect(items.every((item) => item.keyForList?.startsWith('domain_123_'))).toBe(true);

        for (const item of items) {
            item.action?.();
        }
        expect(onSelect).toHaveBeenNthCalledWith(1, ROUTES.DOMAIN_MEMBERS.getRoute(123));
        expect(onSelect).toHaveBeenNthCalledWith(2, ROUTES.DOMAIN_ADMINS.getRoute(123));
        expect(onSelect).toHaveBeenNthCalledWith(3, ROUTES.DOMAIN_GROUPS.getRoute(123));
        expect(onSelect).toHaveBeenNthCalledWith(4, ROUTES.DOMAIN_SAML.getRoute(123));
    });

    it('matches Domain rows by subpage label or domain name', () => {
        const items = buildDomainNavigationItems({
            domains: [createDomain(123, 'admin@example.com', currentUserAccountID)],
            currentUserAccountID,
            icons: domainIcons,
            getItemText: (translationKey) => labels.get(translationKey) ?? translationKey,
            getDestinationText: (destination) => `Go to ${destination}`,
            getDomainContext: (domainName) => domainName,
            onSelect: jest.fn(),
        });

        expect(buildNavigationSuggestions('members', [items], localeCompare).map((item) => item.text)).toEqual(['Go to Domain members']);
        expect(buildNavigationSuggestions('example', [items], localeCompare)).toHaveLength(4);
    });

    it('builds rows for every administrable Domain with Domain-scoped keys and context', () => {
        const items = buildDomainNavigationItems({
            domains: [createDomain(123, 'admin@example.com', currentUserAccountID), createDomain(456, 'admin@other.com', currentUserAccountID)],
            currentUserAccountID,
            icons: domainIcons,
            getItemText: (translationKey) => labels.get(translationKey) ?? translationKey,
            getDestinationText: (destination) => `Go to ${destination}`,
            getDomainContext: (domainName) => domainName,
            onSelect: jest.fn(),
        });

        expect(items).toHaveLength(8);
        expect(items.filter((item) => item.keyForList?.startsWith('domain_123_'))).toHaveLength(4);
        expect(items.filter((item) => item.keyForList?.startsWith('domain_456_'))).toHaveLength(4);
        expect(items.map((item) => item.rightElement)).toEqual(['example.com', 'example.com', 'example.com', 'example.com', 'other.com', 'other.com', 'other.com', 'other.com']);
    });

    it('composes Domain rows in the Search Router with their localized context', () => {
        const accessibleDomain = createDomain(123, 'admin@example.com', currentUserAccountID);
        const domainCollectionKey = `${ONYXKEYS.COLLECTION.DOMAIN}${accessibleDomain.accountID}`;
        mockUseOnyx.mockImplementation((key) => (key === ONYXKEYS.COLLECTION.DOMAIN ? [{[domainCollectionKey]: accessibleDomain}] : [undefined]));
        mockUseMemoizedLazyExpensifyIcons.mockReturnValue({
            ...spendIcons,
            ...domainIcons,
            Home: mockIcon,
            Inbox: mockIcon,
            ReceiptMultiple: mockIcon,
            Building: mockIcon,
            Gear: mockIcon,
        });
        mockUseSearchTypeMenuSections.mockReturnValue({typeMenuSections: [], activeItemIndex: -1, activeKey: undefined});

        const {result} = renderHook(() => useNavigationSuggestions('members'));

        expect(result.current).toHaveLength(1);
        expect(result.current.at(0)).toMatchObject({text: 'Go to Domain members', singleIcon: domainIcons.User});
        const rightElement = result.current.at(0)?.rightElement;
        expect(isValidElement<{text: string; icon: IconAsset}>(rightElement)).toBe(true);
        if (!isValidElement<{text: string; icon: IconAsset}>(rightElement)) {
            throw new Error('Expected Domain navigation context to be a React element');
        }
        expect(rightElement.props).toMatchObject({text: 'example.com', icon: domainIcons.Globe});
    });
});

describe('Create Search Router navigation source', () => {
    const createAction = jest.fn();
    const createItems: CreateNavigationSuggestions.CreateNavigationItem[] = [
        {visible: true, text: 'Create expense', icon: mockIcon, action: createAction, keyForList: 'create_expense', matchTerms: ['Create expense', 'Add expense']},
        {visible: true, text: 'Create report', icon: mockIcon, action: createAction, keyForList: 'create_report'},
        {visible: true, text: 'Track distance', icon: mockIcon, action: createAction, keyForList: 'create_trackDistance'},
        {visible: true, text: 'Start chat', icon: mockIcon, action: createAction, keyForList: 'create_chat', matchTerms: ['Start chat', 'New chat screen']},
        {visible: false, text: 'Create invoice', icon: mockIcon, action: createAction, keyForList: 'create_invoice'},
        {visible: true, text: 'Book travel', icon: mockIcon, action: createAction, keyForList: 'create_travel'},
        {visible: false, text: 'New workspace', icon: mockIcon, action: createAction, keyForList: 'create_workspace', matchTerms: ['New workspace', 'Create workspace']},
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('builds visible Create rows with direct action labels and excludes unavailable items', () => {
        const items = CreateNavigationSuggestions.buildCreateNavigationItems(createItems);

        expect(items.map((item) => item.text)).toEqual(['Create expense', 'Create report', 'Track distance', 'Start chat', 'Book travel']);
        expect(items.map((item) => item.keyForList)).toEqual(['create_expense', 'create_report', 'create_trackDistance', 'create_chat', 'create_travel']);
        expect(items.map((item) => item.singleIcon)).toEqual([mockIcon, mockIcon, mockIcon, mockIcon, mockIcon]);
        expect(items.map((item) => item.matchTerms)).toEqual([['Create expense', 'Add expense'], ['Create report'], ['Track distance'], ['Start chat', 'New chat screen'], ['Book travel']]);
        expect(items.some((item) => item.text?.startsWith('Go to'))).toBe(false);
        expect(items.some((item) => item.keyForList === 'create_invoice' || item.keyForList === 'create_workspace')).toBe(false);
        expect(items.some((item) => item.keyForList === 'create_quickAction')).toBe(false);
    });

    it('matches Create rows through the existing navigation suggestion pipeline', () => {
        const items = CreateNavigationSuggestions.buildCreateNavigationItems(createItems);

        expect(buildNavigationSuggestions('expense', [items], localeCompare).map((item) => item.keyForList)).toEqual(['create_expense']);
        expect(buildNavigationSuggestions('add expense', [items], localeCompare).map((item) => item.keyForList)).toEqual(['create_expense']);
        expect(buildNavigationSuggestions('new chat', [items], localeCompare).map((item) => item.keyForList)).toEqual(['create_chat']);
        expect(buildNavigationSuggestions('go to track distance', [items], localeCompare).map((item) => item.keyForList)).toEqual(['create_trackDistance']);
        expect(buildNavigationSuggestions('book travel', [items], localeCompare).map((item) => item.keyForList)).toEqual(['create_travel']);
        expect(buildNavigationSuggestions('BOOK TRAVEL', [items], localeCompare).map((item) => item.keyForList)).toEqual(['create_travel']);
        expect(buildNavigationSuggestions('go to book     travel', [items], localeCompare).map((item) => item.keyForList)).toEqual(['create_travel']);
    });

    it('matches hidden Create aliases without changing row text', () => {
        const items = CreateNavigationSuggestions.buildCreateNavigationItems([
            {visible: true, text: 'New workspace', icon: mockIcon, action: createAction, keyForList: 'create_workspace', matchTerms: ['New workspace', 'Create workspace']},
        ]);

        expect(buildNavigationSuggestions('create workspace', [items], localeCompare).at(0)).toMatchObject({
            text: 'New workspace',
            keyForList: 'create_workspace',
        });
    });

    it('runs an action immediately when no RHP is open', () => {
        jest.mocked(Navigation.isTopmostRouteModalScreen).mockReturnValue(false);

        CreateNavigationSuggestions.replaceTopmostModalWithAction(createAction);

        expect(createAction).toHaveBeenCalledTimes(1);
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    it('dismisses an existing RHP before running the Create action', () => {
        jest.mocked(Navigation.isTopmostRouteModalScreen).mockReturnValue(true);

        CreateNavigationSuggestions.replaceTopmostModalWithAction(createAction);

        expect(createAction).not.toHaveBeenCalled();
        expect(Navigation.dismissModal).toHaveBeenCalledTimes(1);
        const afterTransition = jest.mocked(Navigation.dismissModal).mock.calls.at(0)?.at(0)?.afterTransition;
        afterTransition?.();
        expect(createAction).toHaveBeenCalledTimes(1);
    });
});

describe('Workspace Search Router navigation source', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const buildItems = (policies: Policy[], isOffline = false) =>
        buildWorkspaceNavigationItems({
            policies: Object.fromEntries(policies.map((policy) => [`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy])),
            policyCategories: undefined,
            currentUserLogin: workspaceCurrentUserLogin,
            icons: workspaceIcons,
            isOffline,
            isRulesRevampBetaEnabled: false,
            isVendorMatchingBetaEnabled: false,
            shouldUseNarrowLayout: false,
            convertToDisplayString: () => '$0.00',
            getItemText: (item) => {
                const labels = new Map([
                    ['workspace.common.profile', 'Overview'],
                    ['workspace.common.members', 'Members'],
                    ['workspace.common.rooms', 'Rooms'],
                    ['workspace.common.workflows', 'Workflows'],
                    ['workspace.common.hr', 'HR'],
                ]);
                return labels.get(item.translationKey) ?? item.translationKey;
            },
            getDestinationText: (destination) => `Go to ${destination}`,
        });

    it('matches a workspace name to its Overview row only', () => {
        const items = buildItems([createWorkspacePolicy('1', 'Alpha Workspace', {areWorkflowsEnabled: true})]);

        expect(buildNavigationSuggestions('Alpha Workspace', [items], localeCompare).map((item) => item.keyForList)).toEqual([`workspace_1_${SCREENS.WORKSPACE.PROFILE}`]);
        expect(buildNavigationSuggestions('Workflows', [items], localeCompare).map((item) => item.keyForList)).toEqual([`workspace_1_${SCREENS.WORKSPACE.WORKFLOWS}`]);
    });

    it('excludes inaccessible policies, pending join requests, pending deletes, and disabled feature pages', () => {
        const accessiblePolicy = createWorkspacePolicy('1', 'Accessible Workspace', {areWorkflowsEnabled: false});
        const personalPolicy = createWorkspacePolicy('2', 'Personal Workspace', {type: CONST.POLICY.TYPE.PERSONAL, areWorkflowsEnabled: true});
        const pendingJoinPolicy = createWorkspacePolicy('3', 'Pending Workspace', {isJoinRequestPending: true});
        const pendingDeletePolicy = createWorkspacePolicy('4', 'Deleted Workspace', {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE});
        const items = buildItems([accessiblePolicy, personalPolicy, pendingJoinPolicy, pendingDeletePolicy], true);

        expect(items.some((item) => item.keyForList?.startsWith('workspace_2_'))).toBe(false);
        expect(items.some((item) => item.keyForList?.startsWith('workspace_3_'))).toBe(false);
        expect(items.some((item) => item.keyForList?.startsWith('workspace_4_'))).toBe(false);
        expect(items.some((item) => item.keyForList === `workspace_1_${SCREENS.WORKSPACE.WORKFLOWS}`)).toBe(false);
    });

    it('supports the short HR query and alphabetizes equal-priority Workspace rows', () => {
        const items = buildItems([createWorkspacePolicy('1', 'Beta Workspace', {isHREnabled: true}), createWorkspacePolicy('2', 'Alpha Workspace', {isHREnabled: true})]);

        expect(buildNavigationSuggestions('hr', [items], localeCompare).map((item) => item.keyForList)).toEqual([
            `workspace_2_${SCREENS.WORKSPACE.HR}`,
            `workspace_1_${SCREENS.WORKSPACE.HR}`,
        ]);
    });

    it('includes workspace identity and navigates through the Workspace synchronization helper', () => {
        const policy = createWorkspacePolicy('1', 'Alpha Workspace');
        const overviewItem = buildItems([policy]).find((item) => item.keyForList === `workspace_1_${SCREENS.WORKSPACE.PROFILE}`);

        expect(isValidElement<{policy: Policy}>(overviewItem?.rightElement)).toBe(true);
        if (!isValidElement<{policy: Policy}>(overviewItem?.rightElement)) {
            throw new Error('Expected Workspace navigation context to be a React element');
        }
        expect(overviewItem.rightElement.props.policy).toBe(policy);

        overviewItem?.action?.();
        expect(navigateToWorkspaceSettingsRoute).toHaveBeenCalledWith(ROUTES.WORKSPACE_OVERVIEW.getRoute(policy.id), policy.id, false, SCREENS.WORKSPACE.PROFILE);
    });

    it('composes localized Workspace suggestions after Spend with hook-level filtering and beta flags', () => {
        const activePolicy = createWorkspacePolicy('1', 'Active Workspace');
        const deletedPolicy = createWorkspacePolicy('2', 'Deleted Workspace', {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE});
        const policies = {
            [`${ONYXKEYS.COLLECTION.POLICY}${activePolicy.id}`]: activePolicy,
            [`${ONYXKEYS.COLLECTION.POLICY}${deletedPolicy.id}`]: deletedPolicy,
        };
        mockUseOnyx.mockImplementation((key) => {
            if (key === ONYXKEYS.COLLECTION.POLICY) {
                return [policies];
            }
            if (key === ONYXKEYS.SESSION) {
                return [workspaceCurrentUserLogin];
            }
            return [undefined];
        });
        mockUseNetwork.mockReturnValue({isOffline: true});
        mockIsBetaEnabled.mockReturnValue(true);
        mockUseMemoizedLazyExpensifyIcons.mockReturnValue({
            ...spendIcons,
            ...workspaceIcons,
            Home: mockIcon,
            Inbox: mockIcon,
            ReceiptMultiple: mockIcon,
            Gear: mockIcon,
        });
        mockUseSearchTypeMenuSections.mockReturnValue({
            typeMenuSections: [
                {
                    translationPath: 'search.tabs.expenseReports',
                    menuItems: [createSpendMenuItem(CONST.SEARCH.SEARCH_KEYS.REPORTS, 'search.tabs.reports', 'Document', 'type:expense-report')],
                },
            ],
            activeItemIndex: -1,
            activeKey: undefined,
        });
        mockUseSettingsNavigationMenuData.mockReturnValue({
            accountMenuItemsData: {
                sectionTranslationKey: 'initialSettingsPage.account',
                items: [createSettingsMenuItem('initialSettingsPage.security', SCREENS.SETTINGS.SECURITY)],
            },
            generalMenuItemsData: {sectionTranslationKey: 'initialSettingsPage.general', items: []},
        });
        const actualGetWorkspaceMenuItems = jest.requireActual<{default: GetWorkspaceMenuItems}>('@pages/workspace/getWorkspaceMenuItems').default;
        jest.mocked(getWorkspaceMenuItems).mockImplementationOnce((params) => actualGetWorkspaceMenuItems(params).filter((item) => item.screenName === SCREENS.WORKSPACE.PROFILE));

        const {result} = renderHook(() => useNavigationSuggestions('go'));

        expect(result.current.map((item) => item.keyForList)).toEqual([
            'topLevelAccount',
            'topLevelDomains',
            'topLevelHome',
            'topLevelInbox',
            'topLevelSpend',
            'topLevelWorkspaces',
            'spend_reports',
            `workspace_1_${SCREENS.WORKSPACE.PROFILE}`,
        ]);
        expect(result.current.at(7)).toMatchObject({text: 'Go to Overview'});
        expect(result.current.some((item) => item.keyForList?.startsWith('workspace_2_'))).toBe(false);
        expect(getWorkspaceMenuItems).toHaveBeenCalledTimes(1);
        expect(getWorkspaceMenuItems).toHaveBeenCalledWith(
            expect.objectContaining({
                policy: activePolicy,
                isRulesRevampBetaEnabled: true,
                isVendorMatchingBetaEnabled: true,
            }),
        );
        expect(mockIsBetaEnabled).toHaveBeenCalledWith(CONST.BETAS.RULES_REVAMP);
        expect(mockIsBetaEnabled).toHaveBeenCalledWith(CONST.BETAS.VENDOR_MATCHING);
    });
});

describe('Spend Search Router navigation source', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseCreateNavigationSuggestions.mockReturnValue([]);
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
        expect(isValidElement<{text: string; icon: IconAsset; iconSize: number; showTooltip: boolean}>(rightElement)).toBe(true);
        if (!isValidElement<{text: string; icon: IconAsset; iconSize: number; showTooltip: boolean}>(rightElement)) {
            throw new Error('Expected Spend navigation context to be a React element');
        }
        expect(rightElement.props).toMatchObject({text: 'Spend', icon: spendContextIcon, iconSize: variables.fontSizeLabel, showTooltip: false});

        rerender({shouldWatchForApprovals: true});
        expect(mockUseSearchTypeMenuSections).toHaveBeenLastCalledWith(undefined, true);
    });

    it('keeps Create rows reachable when top-level and Spend sources are present', () => {
        mockUseMemoizedLazyExpensifyIcons.mockReturnValue({
            ...spendIcons,
            Home: mockIcon,
            Inbox: mockIcon,
            ReceiptMultiple: mockIcon,
            Building: mockIcon,
            Gear: mockIcon,
        });
        mockUseSearchTypeMenuSections.mockReturnValue({
            typeMenuSections: [
                {
                    translationPath: 'search.tabs.expenseReports',
                    menuItems: [createSpendMenuItem(CONST.SEARCH.SEARCH_KEYS.REPORTS, 'search.tabs.reports', 'Document', 'type:expense-report')],
                },
            ],
            activeItemIndex: -1,
            activeKey: undefined,
        });
        mockUseCreateNavigationSuggestions.mockReturnValue(
            CreateNavigationSuggestions.buildCreateNavigationItems([{visible: true, text: 'Create expense', icon: mockIcon, action: jest.fn(), keyForList: 'create_expense'}]),
        );

        const {result} = renderHook(() => useNavigationSuggestions('create expense'));

        expect(result.current.map((item) => item.keyForList)).toEqual(['create_expense']);
    });
});

describe('Account Search Router navigation source', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('reuses navigable Settings rows and excludes action-only and unsupported rows', () => {
        const profileAction = jest.fn();
        const securityAction = jest.fn();
        const rightElement = 'Account';
        const sections: MenuSection[] = [
            {
                sectionTranslationKey: 'initialSettingsPage.account',
                items: [
                    createSettingsMenuItem('common.profile', SCREENS.SETTINGS.PROFILE.ROOT, profileAction),
                    createSettingsMenuItem('initialSettingsPage.security', SCREENS.SETTINGS.SECURITY, securityAction),
                ],
            },
            {
                sectionTranslationKey: 'initialSettingsPage.general',
                items: [
                    createSettingsMenuItem('initialSettingsPage.help', SCREENS.SETTINGS.HELP),
                    createSettingsMenuItem('initialSettingsPage.whatIsNew'),
                    createSettingsMenuItem('sidebarScreen.saveTheWorld', SCREENS.SETTINGS.SAVE_THE_WORLD),
                    createSettingsMenuItem('initialSettingsPage.signOut'),
                ],
            },
        ];
        const labels = new Map<MenuData['translationKey'], string>([
            ['common.profile', 'Profile'],
            ['initialSettingsPage.security', 'Security'],
            ['initialSettingsPage.help', 'Help'],
        ]);

        const items = buildAccountNavigationItems({
            sections,
            rightElement,
            getItemText: (item) => labels.get(item.translationKey) ?? item.translationKey,
            getDestinationText: (destination) => `Go to ${destination}`,
        });

        expect(items.map((item) => item.text)).toEqual(['Go to Profile', 'Go to Security', 'Go to Help']);
        expect(items.map((item) => item.keyForList)).toEqual([`account_${SCREENS.SETTINGS.PROFILE.ROOT}`, `account_${SCREENS.SETTINGS.SECURITY}`, `account_${SCREENS.SETTINGS.HELP}`]);
        expect(items.map((item) => item.singleIcon)).toEqual([mockIcon, mockIcon, mockIcon]);
        expect(items.map((item) => item.rightElement)).toEqual([rightElement, rightElement, rightElement]);

        items.at(0)?.action?.();
        items.at(1)?.action?.();
        expect(profileAction).toHaveBeenCalledTimes(1);
        expect(securityAction).toHaveBeenCalledTimes(1);
    });

    it.each(['password', '2fa', 'two factor', 'two-factor'])('matches Security with the confirmed "%s" keyword', (query) => {
        const items = buildAccountNavigationItems({
            sections: [
                {
                    sectionTranslationKey: 'initialSettingsPage.account',
                    items: [createSettingsMenuItem('initialSettingsPage.security', SCREENS.SETTINGS.SECURITY)],
                },
            ],
            rightElement: 'Account',
            getItemText: () => 'Security',
            getDestinationText: (destination) => `Go to ${destination}`,
        });

        expect(buildNavigationSuggestions(query, [items], localeCompare).map((item) => item.keyForList)).toEqual([`account_${SCREENS.SETTINGS.SECURITY}`]);
    });

    it('composes Account suggestions from the shared Settings menu with its icon and context', () => {
        const securityIcon: IconAsset = () => null;
        const accountContextIcon: IconAsset = () => null;
        const securityAction = jest.fn();
        mockUseMemoizedLazyExpensifyIcons.mockReturnValue({
            ...spendIcons,
            Home: mockIcon,
            Inbox: mockIcon,
            ReceiptMultiple: mockIcon,
            Building: mockIcon,
            Gear: accountContextIcon,
        });
        mockUseSearchTypeMenuSections.mockReturnValue({typeMenuSections: [], activeItemIndex: -1, activeKey: undefined});
        mockUseSettingsNavigationMenuData.mockReturnValue({
            accountMenuItemsData: {
                sectionTranslationKey: 'initialSettingsPage.account',
                items: [{...createSettingsMenuItem('initialSettingsPage.security', SCREENS.SETTINGS.SECURITY, securityAction), icon: securityIcon}],
            },
            generalMenuItemsData: {sectionTranslationKey: 'initialSettingsPage.general', items: []},
        });

        const {result} = renderHook(() => useNavigationSuggestions('password'));

        expect(mockUseSettingsNavigationMenuData).toHaveBeenCalledTimes(1);
        expect(result.current).toHaveLength(1);
        expect(result.current.at(0)).toMatchObject({
            text: 'Go to Security',
            keyForList: `account_${SCREENS.SETTINGS.SECURITY}`,
            singleIcon: securityIcon,
            action: securityAction,
        });

        const rightElement = result.current.at(0)?.rightElement;
        expect(isValidElement<{text: string; icon: IconAsset; iconSize: number; showTooltip: boolean}>(rightElement)).toBe(true);
        if (!isValidElement<{text: string; icon: IconAsset; iconSize: number; showTooltip: boolean}>(rightElement)) {
            throw new Error('Expected Account navigation context to be a React element');
        }
        expect(rightElement.props).toMatchObject({text: 'Account', icon: accountContextIcon, iconSize: variables.fontSizeLabel, showTooltip: false});
    });
});
