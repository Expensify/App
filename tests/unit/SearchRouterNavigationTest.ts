import navigateToWorkspaceSettingsRoute from '@components/Search/SearchRouter/navigateToWorkspaceSettingsRoute';
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
