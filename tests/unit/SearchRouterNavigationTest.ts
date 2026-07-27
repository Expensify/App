import {
    buildNavigationSuggestions,
    isNavigationIntentOnlyQuery,
    matchesNavigationQuery,
    MAX_NAVIGATION_SUGGESTIONS,
    sortNavigationSuggestionItems,
    stripNavigationIntentPrefix,
} from '@components/Search/SearchRouter/SearchRouterHelpers';
import {buildCreateNavigationItems, replaceTopmostModalWithAction} from '@components/Search/SearchRouter/useCreateNavigationSuggestions';
import type {CreateNavigationItem} from '@components/Search/SearchRouter/useCreateNavigationSuggestions';
import {buildTopLevelNavigationItems} from '@components/Search/SearchRouter/useNavigationSuggestions';

import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        dismissModal: jest.fn(),
        isTopmostRouteModalScreen: jest.fn(() => false),
        navigate: jest.fn(),
    },
}));

const localeCompare = (firstValue: string, secondValue: string) => firstValue.localeCompare(secondValue);
const mockIcon: IconAsset = () => null;

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

describe('Create Search Router navigation source', () => {
    const createAction = jest.fn();
    const createItems: CreateNavigationItem[] = [
        {visible: true, text: 'Create expense', icon: mockIcon, action: createAction, keyForList: 'create_expense'},
        {visible: true, text: 'Create report', icon: mockIcon, action: createAction, keyForList: 'create_report'},
        {visible: true, text: 'Track distance', icon: mockIcon, action: createAction, keyForList: 'create_trackDistance'},
        {visible: true, text: 'New chat', icon: mockIcon, action: createAction, keyForList: 'create_chat'},
        {visible: false, text: 'Create invoice', icon: mockIcon, action: createAction, keyForList: 'create_invoice'},
        {visible: false, text: 'New workspace', icon: mockIcon, action: createAction, keyForList: 'create_workspace'},
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('builds visible Create rows with direct action labels and excludes unavailable items', () => {
        const items = buildCreateNavigationItems(createItems);

        expect(items.map((item) => item.text)).toEqual(['Create expense', 'Create report', 'Track distance', 'New chat']);
        expect(items.map((item) => item.keyForList)).toEqual(['create_expense', 'create_report', 'create_trackDistance', 'create_chat']);
        expect(items.map((item) => item.singleIcon)).toEqual([mockIcon, mockIcon, mockIcon, mockIcon]);
        expect(items.map((item) => item.matchTerms)).toEqual([['Create expense'], ['Create report'], ['Track distance'], ['New chat']]);
        expect(items.some((item) => item.text?.startsWith('Go to'))).toBe(false);
        expect(items.some((item) => item.keyForList === 'create_invoice' || item.keyForList === 'create_workspace')).toBe(false);
        expect(items.some((item) => item.keyForList === 'create_travel' || item.keyForList === 'create_quickAction')).toBe(false);
    });

    it('matches Create rows through the existing navigation suggestion pipeline', () => {
        const items = buildCreateNavigationItems(createItems);

        expect(buildNavigationSuggestions('expense', [items], localeCompare).map((item) => item.keyForList)).toEqual(['create_expense']);
        expect(buildNavigationSuggestions('go to track distance', [items], localeCompare).map((item) => item.keyForList)).toEqual(['create_trackDistance']);
        expect(buildNavigationSuggestions('go to create     expense', [items], localeCompare).map((item) => item.keyForList)).toEqual(['create_expense']);
    });

    it('runs an action immediately when no RHP is open', () => {
        jest.mocked(Navigation.isTopmostRouteModalScreen).mockReturnValue(false);

        replaceTopmostModalWithAction(createAction);

        expect(createAction).toHaveBeenCalledTimes(1);
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    it('dismisses an existing RHP before running the Create action', () => {
        jest.mocked(Navigation.isTopmostRouteModalScreen).mockReturnValue(true);

        replaceTopmostModalWithAction(createAction);

        expect(createAction).not.toHaveBeenCalled();
        expect(Navigation.dismissModal).toHaveBeenCalledTimes(1);
        const afterTransition = jest.mocked(Navigation.dismissModal).mock.calls.at(0)?.at(0)?.afterTransition;
        afterTransition?.();
        expect(createAction).toHaveBeenCalledTimes(1);
    });
});
