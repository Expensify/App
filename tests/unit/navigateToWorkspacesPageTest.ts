import type {NavigationState, PartialState} from '@react-navigation/native';
import {StackActions, TabActions} from '@react-navigation/native';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import navigateToWorkspacesPage from '@libs/Navigation/helpers/navigateToWorkspacesPage';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
// eslint-disable-next-line no-restricted-imports -- TransitionTracker is mocked here to assert the tab-jump sequencing after popToTop in navigateToWorkspacesPage.
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import * as PolicyUtils from '@libs/PolicyUtils';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Domain} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';

jest.mock('@libs/Navigation/navigationRef');
jest.mock('@libs/Navigation/Navigation');
jest.mock('@libs/Navigation/TransitionTracker', () => ({
    __esModule: true,
    default: {
        runAfterTransitions: jest.fn(({callback}: {callback: () => void}) => {
            callback();
            return {cancel: () => {}};
        }),
        startTransition: jest.fn(),
        endTransition: jest.fn(),
    },
}));
jest.mock('@libs/PolicyUtils');
jest.mock('@libs/interceptAnonymousUser');

// eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mocks don't rely on `this` binding
const mockedDispatch = jest.mocked(navigationRef.dispatch);

const fakePolicyID = '344559B2CCF2B6C1';
const mockPolicy = {...createRandomPolicy(0), id: fakePolicyID};
const baseParams = {currentUserLogin: 'test@example.com', shouldUseNarrowLayout: false, policy: mockPolicy};

const TAB_NAV_STATE_KEY = 'tab-nav-key-123';
const tabNavigatorRoute = {
    name: NAVIGATORS.TAB_NAVIGATOR,
    state: {key: TAB_NAV_STATE_KEY} as PartialState<NavigationState>,
};

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
            lastTabNavigatorRoute: {
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
                } as PartialState<NavigationState>,
            },
            lastWorkspacesTabNavigatorRoute: {name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR},
        });
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACES_LIST.route);
    });

    it('navigates to WORKSPACES_LIST if no valid workspace route exists', () => {
        mockIntercept();
        navigateToWorkspacesPage({
            ...baseParams,
            lastTabNavigatorRoute: {name: NAVIGATORS.TAB_NAVIGATOR},
            lastWorkspacesTabNavigatorRoute: undefined,
        });

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACES_LIST.route);
    });

    it('dispatches jumpTo WORKSPACE_NAVIGATOR when a TAB_NAVIGATOR is already on top (workspace, wide layout)', () => {
        (PolicyUtils.shouldShowPolicy as jest.Mock).mockReturnValue(true);
        (PolicyUtils.isPendingDeletePolicy as jest.Mock).mockReturnValue(false);
        mockIntercept();

        navigateToWorkspacesPage({
            ...baseParams,
            lastTabNavigatorRoute: tabNavigatorRoute,
            lastWorkspacesTabNavigatorRoute: {name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR},
        });

        expect(mockedDispatch).toHaveBeenCalledWith({
            ...TabActions.jumpTo(NAVIGATORS.WORKSPACE_NAVIGATOR),
            target: TAB_NAV_STATE_KEY,
        });
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('pops workspace split to root then jumps to tab on narrow layout when a sub-page is focused (no flicker)', () => {
        (PolicyUtils.shouldShowPolicy as jest.Mock).mockReturnValue(true);
        (PolicyUtils.isPendingDeletePolicy as jest.Mock).mockReturnValue(false);
        mockIntercept();

        const WORKSPACE_SPLIT_STATE_KEY = 'workspace-split-state-key-456';

        navigateToWorkspacesPage({
            ...baseParams,
            shouldUseNarrowLayout: true,
            lastTabNavigatorRoute: tabNavigatorRoute,
            lastWorkspacesTabNavigatorRoute: {
                name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                state: {
                    key: WORKSPACE_SPLIT_STATE_KEY,
                    index: 1,
                    routes: [{name: SCREENS.WORKSPACE.INITIAL}, {name: SCREENS.WORKSPACE.MEMBERS}],
                } as PartialState<NavigationState>,
            },
        });

        expect(mockedDispatch).toHaveBeenNthCalledWith(1, {...StackActions.popToTop(), target: WORKSPACE_SPLIT_STATE_KEY});
        expect(mockedDispatch).toHaveBeenNthCalledWith(2, {...TabActions.jumpTo(NAVIGATORS.WORKSPACE_NAVIGATOR), target: TAB_NAV_STATE_KEY});
        expect(TransitionTracker.runAfterTransitions).toHaveBeenCalledWith(expect.objectContaining({waitForUpcomingTransition: true}));
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('skips popToTop on narrow layout when WorkspaceInitialPage is already focused', () => {
        (PolicyUtils.shouldShowPolicy as jest.Mock).mockReturnValue(true);
        (PolicyUtils.isPendingDeletePolicy as jest.Mock).mockReturnValue(false);
        mockIntercept();

        const WORKSPACE_SPLIT_STATE_KEY = 'workspace-split-state-key-789';

        navigateToWorkspacesPage({
            ...baseParams,
            shouldUseNarrowLayout: true,
            lastTabNavigatorRoute: tabNavigatorRoute,
            lastWorkspacesTabNavigatorRoute: {
                name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                state: {
                    key: WORKSPACE_SPLIT_STATE_KEY,
                    index: 0,
                    routes: [{name: SCREENS.WORKSPACE.INITIAL}],
                } as PartialState<NavigationState>,
            },
        });

        expect(mockedDispatch).toHaveBeenCalledTimes(1);
        expect(mockedDispatch).toHaveBeenCalledWith({...TabActions.jumpTo(NAVIGATORS.WORKSPACE_NAVIGATOR), target: TAB_NAV_STATE_KEY});
        expect(TransitionTracker.runAfterTransitions).not.toHaveBeenCalled();
    });

    it('dispatches jumpTo WORKSPACE_NAVIGATOR when a TAB_NAVIGATOR is already on top (domain)', () => {
        mockIntercept();

        navigateToWorkspacesPage({
            ...baseParams,
            domain: {accountID: 123} as unknown as Domain,
            lastTabNavigatorRoute: tabNavigatorRoute,
            lastWorkspacesTabNavigatorRoute: {name: NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR},
        });

        expect(mockedDispatch).toHaveBeenCalledWith({
            ...TabActions.jumpTo(NAVIGATORS.WORKSPACE_NAVIGATOR),
            target: TAB_NAV_STATE_KEY,
        });
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('navigates to WORKSPACES_LIST for domain when the TAB_NAVIGATOR has no usable state key', () => {
        mockIntercept();

        navigateToWorkspacesPage({
            ...baseParams,
            domain: {accountID: 123} as unknown as Domain,
            // TAB_NAVIGATOR present but with no state (so no existingTabNavStateKey to jump to).
            lastTabNavigatorRoute: {name: NAVIGATORS.TAB_NAVIGATOR},
            lastWorkspacesTabNavigatorRoute: {name: NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR},
        });

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACES_LIST.route);
        expect(mockedDispatch).not.toHaveBeenCalled();
    });

    it('navigates to WORKSPACES_LIST if policy is pending delete', () => {
        (PolicyUtils.shouldShowPolicy as jest.Mock).mockReturnValue(true);
        (PolicyUtils.isPendingDeletePolicy as jest.Mock).mockReturnValue(true);

        mockIntercept();
        navigateToWorkspacesPage({
            ...baseParams,
            lastTabNavigatorRoute: {name: NAVIGATORS.TAB_NAVIGATOR},
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
            lastTabNavigatorRoute: {name: NAVIGATORS.TAB_NAVIGATOR},
            lastWorkspacesTabNavigatorRoute: {name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR},
        });

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACES_LIST.route);
    });

    it('navigates to WORKSPACES_LIST if policyID is missing', () => {
        mockIntercept();
        navigateToWorkspacesPage({
            ...baseParams,
            policy: undefined,
            lastTabNavigatorRoute: {name: NAVIGATORS.TAB_NAVIGATOR},
            lastWorkspacesTabNavigatorRoute: {name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR},
        });

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACES_LIST.route);
    });
});
