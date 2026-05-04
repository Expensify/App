import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import navigateToWorkspacesPage from '@libs/Navigation/helpers/navigateToWorkspacesPage';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import createRandomPolicy from '../utils/collections/policies';

jest.mock('@libs/Navigation/navigationRef');
jest.mock('@libs/Navigation/Navigation');
jest.mock('@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState');
jest.mock('@libs/PolicyUtils');
jest.mock('@libs/interceptAnonymousUser');
jest.mock('@libs/Navigation/helpers/getPathFromState', () => ({
    __esModule: true,
    default: jest.fn(),
}));

const mockedGetPathFromState = getPathFromState as jest.MockedFunction<typeof getPathFromState>;

const fakePolicyID = '344559B2CCF2B6C1';
const mockPolicy = {...createRandomPolicy(0), id: fakePolicyID};
const baseParams = {currentUserLogin: 'test@example.com', shouldUseNarrowLayout: false, policy: mockPolicy};

describe('navigateToWorkspacesPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    function mockIntercept() {
        (interceptAnonymousUser as jest.Mock).mockImplementation((callback: () => void) => {
            callback();
        });
    }
    it('calls goBack if WORKSPACE_NAVIGATOR is topmost and a split navigator is inside', () => {
        navigateToWorkspacesPage({
            ...baseParams,
            topmostFullScreenRoute: {
                name: NAVIGATORS.TAB_NAVIGATOR,
                state: {
                    index: 4,
                    routes: [
                        {name: 'Home'},
                        {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
                        {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR},
                        {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR},
                        {name: NAVIGATORS.WORKSPACE_NAVIGATOR},
                    ],
                },
            },
            lastWorkspacesTabNavigatorRoute: {name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR},
        });
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACES_LIST.route);
    });

    it('navigates to WORKSPACES_LIST if no valid workspace route exists', () => {
        mockIntercept();
        navigateToWorkspacesPage({
            ...baseParams,
            topmostFullScreenRoute: {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
            lastWorkspacesTabNavigatorRoute: undefined,
        });

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACES_LIST.route);
    });

    it('navigates to the workspace initial URL when no workspacesTabState is provided', () => {
        (PolicyUtils.shouldShowPolicy as jest.Mock).mockReturnValue(true);
        (PolicyUtils.isPendingDeletePolicy as jest.Mock).mockReturnValue(false);

        mockIntercept();
        navigateToWorkspacesPage({
            ...baseParams,
            topmostFullScreenRoute: {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
            lastWorkspacesTabNavigatorRoute: {name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, key: 'someKey'},
        });

        expect(mockedGetPathFromState).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_INITIAL.getRoute(fakePolicyID));
    });

    it('navigates to the URL produced by getPathFromState when workspacesTabState is provided on wide layouts', () => {
        (PolicyUtils.shouldShowPolicy as jest.Mock).mockReturnValue(true);
        (PolicyUtils.isPendingDeletePolicy as jest.Mock).mockReturnValue(false);
        const restoredPath = `/workspaces/${fakePolicyID}/workflows` as const;
        mockedGetPathFromState.mockReturnValue(restoredPath);

        mockIntercept();
        const workspacesTabState = {
            index: 1,
            routes: [
                {name: SCREENS.WORKSPACE.INITIAL, params: {policyID: fakePolicyID}},
                {name: SCREENS.WORKSPACE.WORKFLOWS, params: {policyID: fakePolicyID}},
            ],
        };
        navigateToWorkspacesPage({
            ...baseParams,
            topmostFullScreenRoute: {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
            lastWorkspacesTabNavigatorRoute: {name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, key: 'someKey'},
            workspacesTabState,
        });

        // Wrapped with the full TAB_NAVIGATOR > WORKSPACE_NAVIGATOR > WORKSPACE_SPLIT_NAVIGATOR ancestor chain
        // so getPathFromState can match the linking-config hierarchy.
        expect(mockedGetPathFromState).toHaveBeenCalledWith({
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        routes: [
                            {
                                name: NAVIGATORS.WORKSPACE_NAVIGATOR,
                                state: {
                                    routes: [{name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, state: workspacesTabState}],
                                    index: 0,
                                },
                            },
                        ],
                        index: 0,
                    },
                },
            ],
            index: 0,
        });
        expect(Navigation.navigate).toHaveBeenCalledWith(restoredPath);
    });

    it('falls back to the workspace initial URL on narrow layouts even when workspacesTabState is provided', () => {
        (PolicyUtils.shouldShowPolicy as jest.Mock).mockReturnValue(true);
        (PolicyUtils.isPendingDeletePolicy as jest.Mock).mockReturnValue(false);

        mockIntercept();
        navigateToWorkspacesPage({
            ...baseParams,
            shouldUseNarrowLayout: true,
            topmostFullScreenRoute: {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
            lastWorkspacesTabNavigatorRoute: {name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, key: 'someKey'},
            workspacesTabState: {
                index: 1,
                routes: [
                    {name: SCREENS.WORKSPACE.INITIAL, params: {policyID: fakePolicyID}},
                    {name: SCREENS.WORKSPACE.WORKFLOWS, params: {policyID: fakePolicyID}},
                ],
            },
        });

        expect(mockedGetPathFromState).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_INITIAL.getRoute(fakePolicyID));
    });

    it('navigates to WORKSPACES_LIST if policy is pending delete', () => {
        (PolicyUtils.shouldShowPolicy as jest.Mock).mockReturnValue(true);
        (PolicyUtils.isPendingDeletePolicy as jest.Mock).mockReturnValue(true);

        mockIntercept();
        navigateToWorkspacesPage({
            ...baseParams,
            topmostFullScreenRoute: {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
            lastWorkspacesTabNavigatorRoute: {name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR},
        });

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACES_LIST.route);
    });

    it('navigates to WORKSPACES_LIST if shouldShowPolicy is false for the user', () => {
        (PolicyUtils.shouldShowPolicy as jest.Mock).mockReturnValue(false);
        (PolicyUtils.isPendingDeletePolicy as jest.Mock).mockReturnValue(false);

        mockIntercept();
        navigateToWorkspacesPage({
            ...baseParams,
            topmostFullScreenRoute: {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
            lastWorkspacesTabNavigatorRoute: {name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR},
        });

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACES_LIST.route);
    });

    it('navigates to WORKSPACES_LIST if policyID is missing', () => {
        mockIntercept();
        navigateToWorkspacesPage({
            ...baseParams,
            policy: undefined,
            topmostFullScreenRoute: {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
            lastWorkspacesTabNavigatorRoute: {name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR},
        });

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACES_LIST.route);
    });
});
