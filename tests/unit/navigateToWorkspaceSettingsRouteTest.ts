import navigateToWorkspaceSettingsRoute from '@libs/Navigation/helpers/navigateToWorkspaceSettingsRoute';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import createMock from '../utils/createMock';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
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

function mockWorkspaceNavigationState(policyID: string, activeScreenName: keyof WorkspaceSplitNavigatorParamList = SCREENS.WORKSPACE.WORKFLOWS) {
    jest.mocked(navigationRef).isReady.mockReturnValue(true);
    jest.mocked(navigationRef).getRootState.mockReturnValue(
        createMock<ReturnType<typeof navigationRef.getRootState>>({
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
                        index: 1,
                        routeNames: [SCREENS.WORKSPACE.INITIAL, activeScreenName],
                        type: 'stack',
                        stale: false,
                        routes: [
                            {
                                name: SCREENS.WORKSPACE.INITIAL,
                                key: 'workspace-sidebar',
                                params: {policyID},
                            },
                            {
                                name: activeScreenName,
                                key: 'workspace-central',
                                params: {policyID},
                            },
                        ],
                    },
                },
            ],
        }),
    );
}

function mockTabWorkspaceNavigationState(policyID: string, activeScreenName: keyof WorkspaceSplitNavigatorParamList = SCREENS.WORKSPACE.WORKFLOWS) {
    jest.mocked(navigationRef).isReady.mockReturnValue(true);
    jest.mocked(navigationRef).getRootState.mockReturnValue(
        createMock<ReturnType<typeof navigationRef.getRootState>>({
            key: 'root-state',
            index: 0,
            routeNames: [NAVIGATORS.TAB_NAVIGATOR],
            type: 'stack',
            stale: false,
            routes: [
                {
                    key: 'tab-navigator',
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        key: 'tab-state',
                        index: 0,
                        routeNames: [NAVIGATORS.WORKSPACE_NAVIGATOR],
                        type: 'tab',
                        stale: false,
                        routes: [
                            {
                                key: 'workspace-navigator',
                                name: NAVIGATORS.WORKSPACE_NAVIGATOR,
                                state: {
                                    key: 'workspace-state',
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
                                                index: 1,
                                                routeNames: [SCREENS.WORKSPACE.INITIAL, activeScreenName],
                                                type: 'stack',
                                                stale: false,
                                                routes: [
                                                    {
                                                        name: SCREENS.WORKSPACE.INITIAL,
                                                        key: 'workspace-sidebar',
                                                        params: {policyID},
                                                    },
                                                    {
                                                        name: activeScreenName,
                                                        key: 'workspace-central',
                                                        params: {policyID},
                                                    },
                                                ],
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            ],
        }),
    );
}

describe('navigateToWorkspaceSettingsRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('navigates directly on narrow layouts', () => {
        const targetRoute = ROUTES.WORKSPACE_MEMBERS.getRoute('workspace-b');

        navigateToWorkspaceSettingsRoute(targetRoute, 'workspace-b', true, SCREENS.WORKSPACE.MEMBERS);

        expect(Navigation.navigate).toHaveBeenCalledWith(targetRoute);
        expect(Navigation.setParams).not.toHaveBeenCalled();
    });

    it('navigates directly when the current page is not a Workspace setting', () => {
        const targetRoute = ROUTES.WORKSPACE_MEMBERS.getRoute('workspace-b');
        navigateToWorkspaceSettingsRoute(targetRoute, 'workspace-b', false, SCREENS.WORKSPACE.MEMBERS);

        expect(Navigation.navigate).toHaveBeenCalledWith(targetRoute);
        expect(Navigation.setParams).not.toHaveBeenCalled();
    });

    it('navigates directly when the target page is not a Workspace setting', () => {
        const targetRoute = ROUTES.HOME;
        mockWorkspaceNavigationState('workspace-a');

        navigateToWorkspaceSettingsRoute(targetRoute, 'workspace-b', false, SCREENS.HOME);

        expect(Navigation.navigate).toHaveBeenCalledWith(targetRoute);
        expect(Navigation.setParams).not.toHaveBeenCalled();
    });

    it('compares Workspace targets without query parameters while preserving them for navigation', () => {
        const targetRoute = ROUTES.WORKSPACE_WORKFLOWS.getRoute('workspace-a', CONST.TAB.WORKFLOWS.APPROVALS);
        mockWorkspaceNavigationState('workspace-a');

        navigateToWorkspaceSettingsRoute(targetRoute, 'workspace-a', false, SCREENS.WORKSPACE.WORKFLOWS);

        expect(Navigation.navigate).toHaveBeenCalledWith(targetRoute);
        expect(Navigation.setParams).not.toHaveBeenCalled();
    });

    it('updates the sidebar policy before navigating to a different Workspace page', () => {
        const targetRoute = ROUTES.WORKSPACE_MEMBERS.getRoute('workspace-b');
        mockWorkspaceNavigationState('workspace-a');

        navigateToWorkspaceSettingsRoute(targetRoute, 'workspace-b', false, SCREENS.WORKSPACE.MEMBERS);

        expect(Navigation.setParams).toHaveBeenCalledWith({policyID: 'workspace-b'}, 'workspace-sidebar', 'split-state');
        expect(Navigation.navigate).toHaveBeenCalledWith(targetRoute);
        expect(jest.mocked(Navigation.setParams).mock.invocationCallOrder.at(0)).toBeLessThan(jest.mocked(Navigation.navigate).mock.invocationCallOrder.at(0) ?? 0);
    });

    it('updates the sidebar policy inside the Workspaces tab navigator', () => {
        const targetRoute = ROUTES.WORKSPACE_MEMBERS.getRoute('workspace-b');
        mockTabWorkspaceNavigationState('workspace-a');

        navigateToWorkspaceSettingsRoute(targetRoute, 'workspace-b', false, SCREENS.WORKSPACE.MEMBERS);

        expect(Navigation.setParams).toHaveBeenCalledWith({policyID: 'workspace-b'}, 'workspace-sidebar', 'split-state');
        expect(Navigation.navigate).toHaveBeenCalledWith(targetRoute);
    });

    it('updates the sidebar when switching to the same page in another Workspace', () => {
        const targetRoute = ROUTES.WORKSPACE_MEMBERS.getRoute('workspace-b');
        mockWorkspaceNavigationState('workspace-a', SCREENS.WORKSPACE.MEMBERS);

        navigateToWorkspaceSettingsRoute(targetRoute, 'workspace-b', false, SCREENS.WORKSPACE.MEMBERS);

        expect(Navigation.setParams).toHaveBeenCalledWith({policyID: 'workspace-b'}, 'workspace-sidebar', 'split-state');
        expect(Navigation.navigate).toHaveBeenCalledWith(targetRoute);
    });

    it('keeps the existing sidebar policy when changing pages in the same Workspace', () => {
        const targetRoute = ROUTES.WORKSPACE_MEMBERS.getRoute('workspace-a');
        mockWorkspaceNavigationState('workspace-a');

        navigateToWorkspaceSettingsRoute(targetRoute, 'workspace-a', false, SCREENS.WORKSPACE.MEMBERS);

        expect(Navigation.setParams).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith(targetRoute);
    });
});
