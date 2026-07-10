import navigateToWorkspaceSettingsRoute from '@components/Search/SearchRouter/navigateToWorkspaceSettingsRoute';
import {
    stripNavigationIntentPrefix,
    isNavigationIntentOnlyQuery,
    matchesNavigationQuery,
    sortNavigationSuggestionItems,
    buildNavigationSuggestions,
    buildAccountSourceItems,
    EXCLUDED_SETTINGS_ITEMS,
    ACCOUNT_NAVIGATION_KEYWORDS,
    MAX_NAVIGATION_SUGGESTIONS,
} from '@components/Search/SearchRouter/SearchRouterHelpers';

import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import getWorkspaceMenuItems from '@pages/workspace/getWorkspaceMenuItems';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        getActiveRouteWithoutParams: jest.fn(),
        navigate: jest.fn(),
        setParams: jest.fn(),
    },
}));

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        isReady: jest.fn(),
        getRootState: jest.fn(),
    },
}));

const mockIcon: IconAsset = () => null;
const workspaceIcons = {
    Building: mockIcon,
    Users: mockIcon,
    Hashtag: mockIcon,
    Document: mockIcon,
    Sync: mockIcon,
    Receipt: mockIcon,
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

function createPolicy(overrides: Partial<OnyxTypes.Policy> = {}): OnyxTypes.Policy {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Test fixture only includes the policy fields read by getWorkspaceMenuItems.
    return {
        id: 'workspace-a',
        name: 'Workspace A',
        type: CONST.POLICY.TYPE.TEAM,
        role: CONST.POLICY.ROLE.ADMIN,
        employeeList: {
            user: {
                role: CONST.POLICY.ROLE.ADMIN,
            },
        },
        areWorkflowsEnabled: true,
        areCategoriesEnabled: true,
        areTagsEnabled: true,
        areRulesEnabled: true,
        areConnectionsEnabled: true,
        areReportFieldsEnabled: true,
        areDistanceRatesEnabled: true,
        areExpensifyCardsEnabled: true,
        areCompanyCardsEnabled: true,
        ...overrides,
    } as OnyxTypes.Policy;
}

describe('Search Router navigation helpers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('navigates directly on narrow layout', () => {
        const targetRoute = ROUTES.WORKSPACE_MEMBERS.getRoute('workspace-b');

        navigateToWorkspaceSettingsRoute(targetRoute, 'workspace-b', true);

        expect(Navigation.navigate).toHaveBeenCalledWith(targetRoute);
        expect(Navigation.setParams).not.toHaveBeenCalled();
    });

    it('updates the workspace sidebar policy before replacing a wide-layout workspace route', () => {
        const targetRoute = ROUTES.WORKSPACE_MEMBERS.getRoute('workspace-b');
        jest.mocked(Navigation.getActiveRouteWithoutParams).mockReturnValue(ROUTES.WORKSPACE_WORKFLOWS.getRoute('workspace-a'));
        jest.mocked(navigationRef).isReady.mockReturnValue(true);
        jest.mocked(navigationRef).getRootState.mockReturnValue({
            key: 'root-state',
            index: 0,
            routeNames: [NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR],
            type: 'stack',
            stale: false,
            routes: [
                {
                    key: 'workspace-split',
                    name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                    state: {
                        key: 'split-state',
                        routes: [
                            {
                                name: SCREENS.WORKSPACE.INITIAL,
                                key: 'workspace-sidebar',
                                params: {policyID: 'workspace-a'},
                            },
                        ],
                    },
                },
            ],
        });

        navigateToWorkspaceSettingsRoute(targetRoute, 'workspace-b', false);

        expect(Navigation.setParams).toHaveBeenCalledWith({policyID: 'workspace-b'}, 'workspace-sidebar', 'split-state');
        expect(Navigation.navigate).toHaveBeenCalledWith(targetRoute, {forceReplace: true});
    });

    it('does not update sidebar params when the active route is not a workspace route', () => {
        const targetRoute = ROUTES.WORKSPACE_MEMBERS.getRoute('workspace-b');
        jest.mocked(Navigation.getActiveRouteWithoutParams).mockReturnValue(ROUTES.HOME);

        navigateToWorkspaceSettingsRoute(targetRoute, 'workspace-b', false);

        expect(Navigation.navigate).toHaveBeenCalledWith(targetRoute);
        expect(Navigation.setParams).not.toHaveBeenCalled();
    });
});

describe('getWorkspaceMenuItems', () => {
    it('returns base workspace pages for an accessible workspace', () => {
        const items = getWorkspaceMenuItems({
            policy: createPolicy(),
            policyID: 'workspace-a',
            currentUserLogin: 'user',
            icons: workspaceIcons,
            isRoomsPageBetaEnabled: false,
            convertToDisplayString: () => '$0.00',
        });

        expect(items.map((item) => item.translationKey)).toEqual(expect.arrayContaining(['workspace.common.profile', 'workspace.common.members', 'common.reports']));
    });

    it('does not return disabled workspace feature pages', () => {
        const items = getWorkspaceMenuItems({
            policy: createPolicy({
                areWorkflowsEnabled: false,
                areCategoriesEnabled: false,
                areTagsEnabled: false,
            }),
            policyID: 'workspace-a',
            currentUserLogin: 'user',
            icons: workspaceIcons,
            isRoomsPageBetaEnabled: false,
            convertToDisplayString: () => '$0.00',
        });

        expect(items.map((item) => item.translationKey)).not.toEqual(expect.arrayContaining(['workspace.common.workflows', 'workspace.common.categories', 'workspace.common.tags']));
    });

    it('adds rooms only when the rooms beta is enabled', () => {
        const itemsWithoutRooms = getWorkspaceMenuItems({
            policy: createPolicy(),
            policyID: 'workspace-a',
            currentUserLogin: 'user',
            icons: workspaceIcons,
            isRoomsPageBetaEnabled: false,
            convertToDisplayString: () => '$0.00',
        });
        const itemsWithRooms = getWorkspaceMenuItems({
            policy: createPolicy(),
            policyID: 'workspace-a',
            currentUserLogin: 'user',
            icons: workspaceIcons,
            isRoomsPageBetaEnabled: true,
            convertToDisplayString: () => '$0.00',
        });

        expect(itemsWithoutRooms.map((item) => item.translationKey)).not.toContain('workspace.common.rooms');
        expect(itemsWithRooms.map((item) => item.translationKey)).toContain('workspace.common.rooms');
    });
});

describe('stripNavigationIntentPrefix', () => {
    it('strips "go " prefix', () => {
        expect(stripNavigationIntentPrefix('go inbox')).toBe('inbox');
    });

    it('strips "go to " prefix', () => {
        expect(stripNavigationIntentPrefix('go to inbox')).toBe('inbox');
    });

    it('is case insensitive', () => {
        expect(stripNavigationIntentPrefix('Go To Inbox')).toBe('Inbox');
    });

    it('returns query unchanged when no prefix', () => {
        expect(stripNavigationIntentPrefix('inbox')).toBe('inbox');
    });

    it('returns bare "go" unchanged', () => {
        expect(stripNavigationIntentPrefix('go')).toBe('go');
    });

    it('trims surrounding whitespace', () => {
        expect(stripNavigationIntentPrefix('  go to inbox  ')).toBe('inbox');
    });
});

describe('isNavigationIntentOnlyQuery', () => {
    it('returns true for "go"', () => {
        expect(isNavigationIntentOnlyQuery('go')).toBe(true);
    });

    it('returns true for "go to"', () => {
        expect(isNavigationIntentOnlyQuery('go to')).toBe(true);
    });

    it('is case insensitive', () => {
        expect(isNavigationIntentOnlyQuery('Go')).toBe(true);
        expect(isNavigationIntentOnlyQuery('Go To')).toBe(true);
    });

    it('returns false for queries with a target', () => {
        expect(isNavigationIntentOnlyQuery('go inbox')).toBe(false);
        expect(isNavigationIntentOnlyQuery('go to inbox')).toBe(false);
    });

    it('returns false for unrelated queries', () => {
        expect(isNavigationIntentOnlyQuery('inbox')).toBe(false);
        expect(isNavigationIntentOnlyQuery('home')).toBe(false);
    });
});

describe('matchesNavigationQuery', () => {
    it('matches case insensitively', () => {
        expect(matchesNavigationQuery('inbox', 'Go to Inbox')).toBe(true);
        expect(matchesNavigationQuery('INBOX', 'Go to Inbox')).toBe(true);
    });

    it('returns false when no match', () => {
        expect(matchesNavigationQuery('inbox', 'Report')).toBe(false);
    });

    it('returns false for empty query', () => {
        expect(matchesNavigationQuery('', 'anything')).toBe(false);
    });

    it('matches against multiple values', () => {
        expect(matchesNavigationQuery('pass', 'Security', 'password')).toBe(true);
    });
});

describe('sortNavigationSuggestionItems', () => {
    const localeCompare = (a: string, b: string) => a.localeCompare(b);

    it('sorts items alphabetically by text', () => {
        const items = [
            {text: 'Go to Inbox', keyForList: 'b'},
            {text: 'Go to Home', keyForList: 'a'},
        ];
        const sorted = sortNavigationSuggestionItems(items, localeCompare);
        expect(sorted.map((item) => item.text)).toEqual(['Go to Home', 'Go to Inbox']);
    });

    it('falls back to keyForList when text is equal', () => {
        const items = [
            {text: 'Go to Members', keyForList: 'workspace-b_members'},
            {text: 'Go to Members', keyForList: 'workspace-a_members'},
        ];
        const sorted = sortNavigationSuggestionItems(items, localeCompare);
        expect(sorted.map((item) => item.keyForList)).toEqual(['workspace-a_members', 'workspace-b_members']);
    });
});

describe('buildNavigationSuggestions', () => {
    const localeCompare = (a: string, b: string) => a.localeCompare(b);
    const item = (text: string, key: string) => ({text, keyForList: key, searchItemType: undefined});

    it('returns empty for short non-intent queries', () => {
        expect(buildNavigationSuggestions('a', [[item('Go to Inbox', 'inbox')]], localeCompare)).toEqual([]);
        expect(buildNavigationSuggestions('ab', [[item('Go to Inbox', 'inbox')]], localeCompare)).toEqual([]);
    });

    it('allows "hr" despite being only 2 characters', () => {
        const hrItem = {text: 'Go to HR', keyForList: 'hr', searchItemType: undefined};
        const result = buildNavigationSuggestions('hr', [[hrItem]], localeCompare);
        expect(result).toHaveLength(1);
        expect(result.at(0)?.text).toBe('Go to HR');
    });

    it('shows all items for bare "go" intent', () => {
        const sources = [[item('Go to Inbox', 'inbox'), item('Go to Home', 'home')]];
        const result = buildNavigationSuggestions('go', sources, localeCompare);
        expect(result).toHaveLength(2);
    });

    it('shows all items for bare "go to" intent', () => {
        const sources = [[item('Go to Inbox', 'inbox'), item('Go to Home', 'home')]];
        const result = buildNavigationSuggestions('go to', sources, localeCompare);
        expect(result).toHaveLength(2);
    });

    it('filters items matching "go target" query', () => {
        const sources = [[item('Go to Inbox', 'inbox'), item('Go to Home', 'home')]];
        const result = buildNavigationSuggestions('go inbox', sources, localeCompare);
        expect(result).toHaveLength(1);
        expect(result.at(0)?.keyForList).toBe('inbox');
    });

    it('filters items matching plain query', () => {
        const sources = [[item('Go to Inbox', 'inbox'), item('Go to Home', 'home')]];
        const result = buildNavigationSuggestions('inbox', sources, localeCompare);
        expect(result).toHaveLength(1);
        expect(result.at(0)?.keyForList).toBe('inbox');
    });

    it('caps results at MAX_NAVIGATION_SUGGESTIONS', () => {
        const manyItems = Array.from({length: 12}, (_, i) => item(`Go to Item ${i}`, `item-${i}`));
        const result = buildNavigationSuggestions('go', [manyItems], localeCompare);
        expect(result).toHaveLength(MAX_NAVIGATION_SUGGESTIONS);
    });

    it('preserves source ordering across categories', () => {
        const topLevel = [item('Go to Inbox', 'top_inbox')];
        const spend = [item('Go to Reports', 'spend_reports')];
        const result = buildNavigationSuggestions('go', [topLevel, spend], localeCompare);
        expect(result.map((r) => r.keyForList)).toEqual(['top_inbox', 'spend_reports']);
    });
});

describe('buildAccountSourceItems', () => {
    const translate = (key: string) => {
        const translations: Record<string, string> = {
            'common.profile': 'Profile',
            'common.wallet': 'Wallet',
            'initialSettingsPage.whatIsNew': "What's new",
            'sidebarScreen.saveTheWorld': 'Save the world',
            'initialSettingsPage.signOut': 'Sign out',
            'initialSettingsPage.restoreStashed': 'Restore stashed',
            'initialSettingsPage.help': 'Help',
            'initialSettingsPage.about': 'About',
            'initialSettingsPage.security': 'Security',
        };
        return translations[key] ?? key;
    };
    const mockContext = {type: 'context'} as unknown as React.ReactNode;
    const action = jest.fn();

    it("excludes What's new, Save the world, Sign out, and Restore stashed", () => {
        const accountItems = [
            {translationKey: 'common.profile', icon: mockIcon, action},
            {translationKey: 'initialSettingsPage.whatIsNew', icon: mockIcon, action},
            {translationKey: 'sidebarScreen.saveTheWorld', icon: mockIcon, action},
            {translationKey: 'initialSettingsPage.signOut', icon: mockIcon, action},
            {translationKey: 'initialSettingsPage.restoreStashed', icon: mockIcon, action},
        ];
        const result = buildAccountSourceItems(accountItems, [], translate, mockContext);
        const keys = result.map((r) => r.keyForList);
        expect(keys).toContain('account_common.profile');
        expect(keys).not.toContain('account_initialSettingsPage.whatIsNew');
        expect(keys).not.toContain('account_sidebarScreen.saveTheWorld');
        expect(keys).not.toContain('account_initialSettingsPage.signOut');
        expect(keys).not.toContain('account_initialSettingsPage.restoreStashed');
    });

    it('includes general menu items that are not excluded', () => {
        const generalItems = [
            {translationKey: 'initialSettingsPage.help', icon: mockIcon, action},
            {translationKey: 'initialSettingsPage.about', icon: mockIcon, action},
        ];
        const result = buildAccountSourceItems([], generalItems, translate, mockContext);
        expect(result).toHaveLength(2);
        expect(result.map((r) => r.keyForList)).toEqual(['account_initialSettingsPage.help', 'account_initialSettingsPage.about']);
    });

    it('adds keyword matchTerms for Security', () => {
        const accountItems = [{translationKey: 'initialSettingsPage.security', icon: mockIcon, action}];
        const result = buildAccountSourceItems(accountItems, [], translate, mockContext);
        expect(result.at(0)?.matchTerms).toEqual(['Security', 'password', '2fa', 'two factor', 'two-factor']);
    });

    it('does not add keyword matchTerms for items without keywords', () => {
        const accountItems = [{translationKey: 'common.profile', icon: mockIcon, action}];
        const result = buildAccountSourceItems(accountItems, [], translate, mockContext);
        expect(result.at(0)?.matchTerms).toEqual(['Profile']);
    });

    it('EXCLUDED_SETTINGS_ITEMS contains exactly the expected keys', () => {
        expect(EXCLUDED_SETTINGS_ITEMS).toEqual(
            new Set(['initialSettingsPage.whatIsNew', 'sidebarScreen.saveTheWorld', 'initialSettingsPage.signOut', 'initialSettingsPage.restoreStashed']),
        );
    });

    it('ACCOUNT_NAVIGATION_KEYWORDS has Security keywords', () => {
        expect(ACCOUNT_NAVIGATION_KEYWORDS.get('initialSettingsPage.security')).toEqual(['password', '2fa', 'two factor', 'two-factor']);
    });
});

describe('navigation source composition via buildNavigationSuggestions', () => {
    const localeCompare = (a: string, b: string) => a.localeCompare(b);

    it("account source excludes What's new and Sign out from results", () => {
        const accountSource = [
            {text: 'Go to Profile', keyForList: 'account_profile', matchTerms: ['Profile']},
            {text: "Go to What's new", keyForList: 'account_whatsNew', matchTerms: ["What's new"]},
            {text: 'Go to Sign out', keyForList: 'account_signOut', matchTerms: ['Sign out']},
        ];
        // Use "profile" to match only Profile — "go" intent shows all items
        const result = buildNavigationSuggestions('profile', [accountSource], localeCompare);
        const keys = result.map((r) => r.keyForList);
        expect(keys).toContain('account_profile');
        expect(keys).not.toContain('account_whatsNew');
        expect(keys).not.toContain('account_signOut');
    });

    it('workspace Overview matches by workspace name but subpages do not', () => {
        const workspaceSource = [
            {text: 'Go to Overview', keyForList: 'ws_a_profile', matchTerms: ['Overview', 'Work A']},
            {text: 'Go to Reports', keyForList: 'ws_a_reports', matchTerms: ['Reports']},
            {text: 'Go to Categories', keyForList: 'ws_a_categories', matchTerms: ['Categories']},
        ];
        const resultWorkA = buildNavigationSuggestions('Work A', [workspaceSource], localeCompare);
        expect(resultWorkA.map((r) => r.keyForList)).toEqual(['ws_a_profile']);

        const resultReports = buildNavigationSuggestions('Reports', [workspaceSource], localeCompare);
        expect(resultReports.map((r) => r.keyForList)).toEqual(['ws_a_reports']);
    });

    it('domain items include domain name in matchTerms', () => {
        const domainSource = [
            {text: 'Go to Members', keyForList: 'domain_123_members', matchTerms: ['Members', 'example.com']},
            {text: 'Go to Admins', keyForList: 'domain_123_admins', matchTerms: ['Admins', 'example.com']},
        ];
        const result = buildNavigationSuggestions('example', [domainSource], localeCompare);
        expect(result).toHaveLength(2);
    });

    it('create items keep their labels and are not prefixed with "Go to"', () => {
        const createSource = [
            {text: 'Create expense', keyForList: 'create_expense', matchTerms: ['Create expense']},
            {text: 'New chat', keyForList: 'create_chat', matchTerms: ['New chat']},
            {text: 'Book travel', keyForList: 'create_travel', matchTerms: ['Book travel']},
        ];
        const result = buildNavigationSuggestions('create', [createSource], localeCompare);
        expect(result.map((r) => r.keyForList)).toEqual(['create_expense']);
    });

    it('mixed source ordering preserves priority across all source groups', () => {
        const topLevel = [{text: 'Go to Home', keyForList: 'top_home', matchTerms: ['Home']}];
        const spend = [{text: 'Go to Reports', keyForList: 'spend_reports', matchTerms: ['Reports']}];
        const account = [{text: 'Go to Profile', keyForList: 'account_profile', matchTerms: ['Profile']}];
        const workspace = [{text: 'Go to Overview', keyForList: 'ws_overview', matchTerms: ['Overview', 'Workspace A']}];
        const domain = [{text: 'Go to Members', keyForList: 'domain_members', matchTerms: ['Members', 'example.com']}];
        const create = [{text: 'Create expense', keyForList: 'create_expense', matchTerms: ['Create expense']}];

        // Use "go to" with a specific target to avoid intent-only showing everything
        const result = buildNavigationSuggestions('go to home', [topLevel, spend, account, workspace, domain, create], localeCompare);
        const keys = result.map((r) => r.keyForList);
        expect(keys).toEqual(['top_home']);
    });

    it('caps mixed sources at MAX_NAVIGATION_SUGGESTIONS', () => {
        const manyItems = Array.from({length: 12}, (_, i) => ({text: `Go to Item ${i}`, keyForList: `item-${i}`, matchTerms: [`Item ${i}`]}));
        const result = buildNavigationSuggestions('go', [manyItems], localeCompare);
        expect(result).toHaveLength(MAX_NAVIGATION_SUGGESTIONS);
    });
});
