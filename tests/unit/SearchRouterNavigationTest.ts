import navigateToWorkspaceSettingsRoute from '@components/Search/SearchRouter/navigateToWorkspaceSettingsRoute';
import {
    stripNavigationIntentPrefix,
    isNavigationIntentOnlyQuery,
    matchesNavigationQuery,
    sortNavigationSuggestionItems,
    buildNavigationSuggestions,
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
        expect(result[0].text).toBe('Go to HR');
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
        expect(result[0].keyForList).toBe('inbox');
    });

    it('filters items matching plain query', () => {
        const sources = [[item('Go to Inbox', 'inbox'), item('Go to Home', 'home')]];
        const result = buildNavigationSuggestions('inbox', sources, localeCompare);
        expect(result).toHaveLength(1);
        expect(result[0].keyForList).toBe('inbox');
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
