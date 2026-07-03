import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {StackActions, TabActions} from '@react-navigation/native';
import {renderHook} from '@testing-library/react-native';

import createRandomPolicy from '../../utils/collections/policies';

jest.mock('@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState', () => ({
    getPreservedNavigatorState: jest.fn(() => undefined),
}));

const mockResponsiveLayout = jest.fn(() => ({shouldUseNarrowLayout: false}));
jest.mock('@hooks/useResponsiveLayout', () => () => mockResponsiveLayout());

jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({login: 'test@example.com'}));

const mockUseOnyx = jest.fn().mockReturnValue([undefined]);
jest.mock('@hooks/useOnyx', () => (key: unknown, opts?: unknown) => mockUseOnyx(key, opts) as unknown[]);

jest.mock('@libs/interceptAnonymousUser', () => (cb: () => void) => cb());

jest.mock('@libs/Navigation/navigationRef', () => ({
    getRootState: jest.fn(() => ({routes: []})),
    isReady: jest.fn(() => true),
    dispatch: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
    findFocusedRoute: jest.fn(() => ({name: 'some-screen'})),
    StackActions: {
        popToTop: jest.fn(() => ({type: 'POP_TO_TOP'})),
    },
    TabActions: {
        jumpTo: jest.fn((name: string) => ({type: 'JUMP_TO', payload: {name}})),
    },
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
}));

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

jest.mock('@libs/PolicyUtils', () => ({
    shouldShowPolicy: jest.fn(() => true),
    isPendingDeletePolicy: jest.fn(() => false),
}));

const fakePolicyID = 'ABCD1234';
const mockPolicy = {...createRandomPolicy(0), id: fakePolicyID};
const fakeDomainAccountID = 4242;
const mockDomain = {accountID: fakeDomainAccountID, validated: true, email: 'admin@example.com'};
const TAB_NAV_STATE_KEY = 'tab-nav-1';
/* eslint-disable @typescript-eslint/unbound-method -- jest.fn() mocks don't rely on `this` binding */
const mockedGetRootState = navigationRef.getRootState as unknown as jest.Mock<{routes: unknown[]} | undefined>;
const mockedDispatch = jest.mocked(navigationRef.dispatch);
/* eslint-enable @typescript-eslint/unbound-method */

const useRestoreWorkspacesTabOnNavigate = (require('@hooks/useRestoreWorkspacesTabOnNavigate') as {default: () => () => void}).default;

const PolicyUtils = require('@libs/PolicyUtils') as {shouldShowPolicy: jest.Mock; isPendingDeletePolicy: jest.Mock};

function setupOnyxForPolicy() {
    mockUseOnyx.mockImplementation((key: unknown) => {
        if (key === ONYXKEYS.COLLECTION.POLICY) {
            return [{[`${ONYXKEYS.COLLECTION.POLICY}${fakePolicyID}`]: mockPolicy}];
        }
        return [undefined];
    });
}

function setupOnyxForDomain() {
    mockUseOnyx.mockImplementation((key: unknown) => {
        if (key === ONYXKEYS.COLLECTION.DOMAIN) {
            return [{[`${ONYXKEYS.COLLECTION.DOMAIN}${fakeDomainAccountID}`]: mockDomain}];
        }
        return [undefined];
    });
}

function buildStateWithUserOnDifferentTab(workspaceRoutes: unknown[]) {
    return {
        routes: [
            {
                name: NAVIGATORS.TAB_NAVIGATOR,
                state: {
                    key: TAB_NAV_STATE_KEY,
                    index: 0,
                    routes: [
                        {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
                        {
                            name: NAVIGATORS.WORKSPACE_NAVIGATOR,
                            state: {routes: workspaceRoutes},
                        },
                    ],
                },
            },
        ],
    };
}

describe('useRestoreWorkspacesTabOnNavigate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseOnyx.mockReturnValue([undefined]);
        mockResponsiveLayout.mockReturnValue({shouldUseNarrowLayout: false});
        PolicyUtils.shouldShowPolicy.mockReturnValue(true);
        PolicyUtils.isPendingDeletePolicy.mockReturnValue(false);
        mockedGetRootState.mockReturnValue({routes: []});
    });

    it('restores to the last visited workspace when re-entering the Workspaces tab', () => {
        setupOnyxForPolicy();
        mockedGetRootState.mockReturnValue(
            buildStateWithUserOnDifferentTab([
                {
                    name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                    state: {routes: [{name: SCREENS.WORKSPACE.INITIAL, params: {policyID: fakePolicyID}}]},
                },
            ]),
        );

        const {result} = renderHook(() => useRestoreWorkspacesTabOnNavigate());
        result.current();

        expect(mockedDispatch).toHaveBeenCalledWith({
            ...TabActions.jumpTo(NAVIGATORS.WORKSPACE_NAVIGATOR),
            target: TAB_NAV_STATE_KEY,
        });
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('falls back to the workspaces list when no workspace was previously visited', () => {
        mockedGetRootState.mockReturnValue({
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {index: 0, routes: [{name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}]},
                },
            ],
        });

        const {result} = renderHook(() => useRestoreWorkspacesTabOnNavigate());
        result.current();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACES_LIST.route);
    });

    it('falls back to the workspaces list when the last visited policy was deleted', () => {
        PolicyUtils.isPendingDeletePolicy.mockReturnValue(true);

        setupOnyxForPolicy();
        mockedGetRootState.mockReturnValue(
            buildStateWithUserOnDifferentTab([
                {
                    name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                    state: {routes: [{name: SCREENS.WORKSPACE.INITIAL, params: {policyID: fakePolicyID}}]},
                },
            ]),
        );

        const {result} = renderHook(() => useRestoreWorkspacesTabOnNavigate());
        result.current();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACES_LIST.route);
    });

    // Regression: clicking the Workspaces tab from any other tab should restore the user's last
    // workspace sub-page via an in-place TabActions.jumpTo against the topmost TAB_NAVIGATOR,
    // not by pushing a fresh TAB_NAVIGATOR through Navigation.navigate.
    it('jumps to the existing WORKSPACE_NAVIGATOR tab when restoring on a wide layout', () => {
        setupOnyxForPolicy();
        mockedGetRootState.mockReturnValue(
            buildStateWithUserOnDifferentTab([
                {
                    name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                    state: {
                        index: 1,
                        routes: [
                            {name: SCREENS.WORKSPACE.INITIAL, params: {policyID: fakePolicyID}},
                            {name: SCREENS.WORKSPACE.WORKFLOWS, params: {policyID: fakePolicyID}},
                        ],
                    },
                },
            ]),
        );

        const {result} = renderHook(() => useRestoreWorkspacesTabOnNavigate());
        result.current();

        expect(mockedDispatch).toHaveBeenCalledWith({
            ...TabActions.jumpTo(NAVIGATORS.WORKSPACE_NAVIGATOR),
            target: TAB_NAV_STATE_KEY,
        });
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    // Inverted contract for the topmost-only behavior: the consumer restores via TabActions.jumpTo
    // against the topmost TAB_NAVIGATOR's state key, so workspace state held by older TAB_NAVIGATOR
    // instances kept alive by ensureTabNavigatorRoutes is intentionally ignored — guards against a
    // regression to flat-walking all tabs. With an empty topmost workspace slot the hook still jumps
    // to the topmost tab (rather than pushing a new TAB_NAVIGATOR via Navigation.navigate); cold-start
    // hydration is then handled by WorkspaceRouter.getInitialState from sessionStorage.
    it('jumps to the topmost TabNavigator even when its workspace slot is empty', () => {
        setupOnyxForPolicy();
        mockedGetRootState.mockReturnValue({
            routes: [
                // Older TabNavigator with workspace state. Should be ignored.
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 1,
                        routes: [
                            {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
                            {
                                name: NAVIGATORS.WORKSPACE_NAVIGATOR,
                                state: {
                                    routes: [
                                        {
                                            name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                                            state: {
                                                index: 1,
                                                routes: [
                                                    {name: SCREENS.WORKSPACE.INITIAL, params: {policyID: fakePolicyID}},
                                                    {name: SCREENS.WORKSPACE.WORKFLOWS, params: {policyID: fakePolicyID}},
                                                ],
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
                // Topmost TabNavigator with empty WORKSPACE_NAVIGATOR.
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        key: TAB_NAV_STATE_KEY,
                        index: 0,
                        routes: [{name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}, {name: NAVIGATORS.WORKSPACE_NAVIGATOR}],
                    },
                },
            ],
        });

        const {result} = renderHook(() => useRestoreWorkspacesTabOnNavigate());
        result.current();

        expect(mockedDispatch).toHaveBeenCalledWith({
            ...TabActions.jumpTo(NAVIGATORS.WORKSPACE_NAVIGATOR),
            target: TAB_NAV_STATE_KEY,
        });
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    // On narrow layouts (mobile), the consumer pops the workspace split to its initial page
    // *before* jumping to the tab to prevent a sub-page from flashing in. We assert both dispatches
    // fire in order. TransitionTracker is mocked to invoke its callback synchronously.
    it('pops the workspace split to its initial page, then jumps to the tab, on narrow layouts', () => {
        mockResponsiveLayout.mockReturnValue({shouldUseNarrowLayout: true});
        setupOnyxForPolicy();
        const WORKSPACE_SPLIT_STATE_KEY = 'workspace-split-1';
        mockedGetRootState.mockReturnValue(
            buildStateWithUserOnDifferentTab([
                {
                    name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                    state: {
                        key: WORKSPACE_SPLIT_STATE_KEY,
                        index: 1,
                        routes: [
                            {name: SCREENS.WORKSPACE.INITIAL, params: {policyID: fakePolicyID}},
                            {name: SCREENS.WORKSPACE.WORKFLOWS, params: {policyID: fakePolicyID}},
                        ],
                    },
                },
            ]),
        );

        const {result} = renderHook(() => useRestoreWorkspacesTabOnNavigate());
        result.current();

        expect(mockedDispatch).toHaveBeenNthCalledWith(1, {...StackActions.popToTop(), target: WORKSPACE_SPLIT_STATE_KEY});
        expect(mockedDispatch).toHaveBeenNthCalledWith(2, {...TabActions.jumpTo(NAVIGATORS.WORKSPACE_NAVIGATOR), target: TAB_NAV_STATE_KEY});
        expect(TransitionTracker.runAfterTransitions).toHaveBeenCalledWith(expect.objectContaining({waitForUpcomingTransition: true}));
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    // Domain restore: when the last workspace-tab route is a DOMAIN_SPLIT_NAVIGATOR with an
    // accessible accountID, jump to the existing WORKSPACE_NAVIGATOR tab so the preserved
    // DOMAIN_SPLIT_NAVIGATOR state is shown without pushing a new TAB_NAVIGATOR.
    it('jumps to the existing WORKSPACE_NAVIGATOR tab when restoring a domain', () => {
        setupOnyxForDomain();
        mockedGetRootState.mockReturnValue(
            buildStateWithUserOnDifferentTab([
                {
                    name: NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR,
                    state: {routes: [{name: SCREENS.DOMAIN.INITIAL, params: {domainAccountID: fakeDomainAccountID}}]},
                },
            ]),
        );

        const {result} = renderHook(() => useRestoreWorkspacesTabOnNavigate());
        result.current();

        expect(mockedDispatch).toHaveBeenCalledWith({
            ...TabActions.jumpTo(NAVIGATORS.WORKSPACE_NAVIGATOR),
            target: TAB_NAV_STATE_KEY,
        });
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    // If the last route was a domain but it's no longer present in the Onyx domain collection
    // (e.g. user lost access), the lookup yields undefined and we fall back to the workspaces list.
    it('falls back to the workspaces list when the last visited domain is missing from Onyx', () => {
        // Onyx returns no matching domain for the params.domainAccountID
        mockUseOnyx.mockImplementation((key: unknown) => {
            if (key === ONYXKEYS.COLLECTION.DOMAIN) {
                return [{}];
            }
            return [undefined];
        });
        mockedGetRootState.mockReturnValue(
            buildStateWithUserOnDifferentTab([
                {
                    name: NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR,
                    state: {routes: [{name: SCREENS.DOMAIN.INITIAL, params: {domainAccountID: fakeDomainAccountID}}]},
                },
            ]),
        );

        const {result} = renderHook(() => useRestoreWorkspacesTabOnNavigate());
        result.current();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACES_LIST.route);
    });
});
