import navigateToWorkspaceSettingsRoute from '@components/Search/SearchRouter/navigateToWorkspaceSettingsRoute';

import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import createMock from '../utils/createMock';

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

function mockWorkspaceNavigationState(policyID: string) {
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
                        index: 0,
                        routeNames: [SCREENS.WORKSPACE.INITIAL],
                        type: 'stack',
                        stale: false,
                        routes: [
                            {
                                name: SCREENS.WORKSPACE.INITIAL,
                                key: 'workspace-sidebar',
                                params: {policyID},
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

        navigateToWorkspaceSettingsRoute(targetRoute, 'workspace-b', true);

        expect(Navigation.navigate).toHaveBeenCalledWith(targetRoute);
        expect(Navigation.setParams).not.toHaveBeenCalled();
    });

    it('navigates directly when the current page is not a Workspace setting', () => {
        const targetRoute = ROUTES.WORKSPACE_MEMBERS.getRoute('workspace-b');
        jest.mocked(Navigation.getActiveRouteWithoutParams).mockReturnValue(ROUTES.HOME);

        navigateToWorkspaceSettingsRoute(targetRoute, 'workspace-b', false);

        expect(Navigation.navigate).toHaveBeenCalledWith(targetRoute);
        expect(Navigation.setParams).not.toHaveBeenCalled();
    });

    it('navigates directly when the target page is not a Workspace setting', () => {
        const targetRoute = ROUTES.HOME;
        jest.mocked(Navigation.getActiveRouteWithoutParams).mockReturnValue(ROUTES.WORKSPACE_MEMBERS.getRoute('workspace-a'));
        mockWorkspaceNavigationState('workspace-a');

        navigateToWorkspaceSettingsRoute(targetRoute, 'workspace-b', false);

        expect(Navigation.navigate).toHaveBeenCalledWith(targetRoute);
        expect(Navigation.setParams).not.toHaveBeenCalled();
    });

    it('updates the sidebar policy before replacing a different Workspace page', () => {
        const targetRoute = ROUTES.WORKSPACE_MEMBERS.getRoute('workspace-b');
        jest.mocked(Navigation.getActiveRouteWithoutParams).mockReturnValue(ROUTES.WORKSPACE_WORKFLOWS.getRoute('workspace-a'));
        mockWorkspaceNavigationState('workspace-a');

        navigateToWorkspaceSettingsRoute(targetRoute, 'workspace-b', false);

        expect(Navigation.setParams).toHaveBeenCalledWith({policyID: 'workspace-b'}, 'workspace-sidebar', 'split-state');
        expect(Navigation.navigate).toHaveBeenCalledWith(targetRoute, {forceReplace: true});
        expect(jest.mocked(Navigation.setParams).mock.invocationCallOrder.at(0)).toBeLessThan(jest.mocked(Navigation.navigate).mock.invocationCallOrder.at(0) ?? 0);
    });

    it('updates the sidebar when switching to the same page in another Workspace', () => {
        const targetRoute = ROUTES.WORKSPACE_MEMBERS.getRoute('workspace-b');
        jest.mocked(Navigation.getActiveRouteWithoutParams).mockReturnValue(ROUTES.WORKSPACE_MEMBERS.getRoute('workspace-a'));
        mockWorkspaceNavigationState('workspace-a');

        navigateToWorkspaceSettingsRoute(targetRoute, 'workspace-b', false);

        expect(Navigation.setParams).toHaveBeenCalledWith({policyID: 'workspace-b'}, 'workspace-sidebar', 'split-state');
        expect(Navigation.navigate).toHaveBeenCalledWith(targetRoute, {forceReplace: true});
    });

    it('keeps the existing sidebar policy when changing pages in the same Workspace', () => {
        const targetRoute = ROUTES.WORKSPACE_MEMBERS.getRoute('workspace-a');
        jest.mocked(Navigation.getActiveRouteWithoutParams).mockReturnValue(ROUTES.WORKSPACE_WORKFLOWS.getRoute('workspace-a'));
        mockWorkspaceNavigationState('workspace-a');

        navigateToWorkspaceSettingsRoute(targetRoute, 'workspace-a', false);

        expect(Navigation.setParams).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith(targetRoute, {forceReplace: true});
    });
});
