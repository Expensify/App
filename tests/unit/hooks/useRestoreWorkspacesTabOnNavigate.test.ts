import {renderHook} from '@testing-library/react-native';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import createRandomPolicy from '../../utils/collections/policies';

jest.mock('@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState', () => ({
    getPreservedNavigatorState: jest.fn(() => undefined),
}));

jest.mock('@libs/Navigation/helpers/lastVisitedTabPathUtils', () => ({
    getWorkspacesTabStateFromSessionStorage: jest.fn(() => undefined),
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
        pop: jest.fn((count: number) => ({type: 'POP', payload: {count}})),
    },
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
}));

jest.mock('@libs/Navigation/helpers/getPathFromState', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@libs/PolicyUtils', () => ({
    shouldShowPolicy: jest.fn(() => true),
    isPendingDeletePolicy: jest.fn(() => false),
}));

const fakePolicyID = 'ABCD1234';
const mockPolicy = {...createRandomPolicy(0), id: fakePolicyID};
const fakeDomainAccountID = 4242;
const mockDomain = {accountID: fakeDomainAccountID, validated: true, email: 'admin@example.com'};
const mockedGetPathFromState = getPathFromState as jest.MockedFunction<typeof getPathFromState>;
/* eslint-disable @typescript-eslint/unbound-method -- jest.fn() mocks don't rely on `this` binding */
const mockedGetRootState = navigationRef.getRootState as unknown as jest.Mock<{routes: unknown[]} | undefined>;
const mockedDispatch = jest.mocked(navigationRef.dispatch);
/* eslint-enable @typescript-eslint/unbound-method */

const useRestoreWorkspacesTabOnNavigate = (require('@hooks/useRestoreWorkspacesTabOnNavigate') as {default: () => () => void}).default;

const PolicyUtils = require('@libs/PolicyUtils') as {shouldShowPolicy: jest.Mock; isPendingDeletePolicy: jest.Mock};

const lastVisitedTabPathUtils = require('@libs/Navigation/helpers/lastVisitedTabPathUtils') as {getWorkspacesTabStateFromSessionStorage: jest.Mock};

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
        lastVisitedTabPathUtils.getWorkspacesTabStateFromSessionStorage.mockReturnValue(undefined);
        PolicyUtils.shouldShowPolicy.mockReturnValue(true);
        PolicyUtils.isPendingDeletePolicy.mockReturnValue(false);
        mockedGetPathFromState.mockReset();
        mockedGetRootState.mockReturnValue({routes: []});
    });

    it('restores to the last visited workspace when re-entering the Workspaces tab', () => {
        setupOnyxForPolicy();
        const restoredPath = `/workspaces/${fakePolicyID}` as const;
        mockedGetPathFromState.mockReturnValue(restoredPath);
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

        expect(Navigation.navigate).toHaveBeenCalledWith(restoredPath);
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

    // Regression: clicking the Workspaces tab from any other tab should land the user on the *exact* sub-page
    // they had open inside the workspace (e.g. Workflows), not the workspace's initial page.
    it('preserves the focused workspace sub-page (Workflows) when restoring on a wide layout', () => {
        setupOnyxForPolicy();
        const restoredPath = `/workspaces/${fakePolicyID}/workflows` as const;
        mockedGetPathFromState.mockReturnValue(restoredPath);
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

        expect(Navigation.navigate).toHaveBeenCalledWith(restoredPath);
    });

    // Regression for the original bug (#89106): when an RHP-driven navigation pushes a fresh TabNavigator above
    // the modal, the new TabNavigator's WORKSPACE_NAVIGATOR is empty. The hook must reach into the *older*
    // TabNavigator instance still alive in the root stack to recover the user's last workspace sub-page.
    it('reads workspace state from an older TabNavigator instance when the topmost one is empty', () => {
        setupOnyxForPolicy();
        mockedGetRootState.mockReturnValue({
            routes: [
                // Older TabNavigator: still holds the workspace state with WORKFLOWS focused.
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
                // Newer TabNavigator pushed above the modal: WORKSPACE_NAVIGATOR is empty.
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        index: 0,
                        routes: [{name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}, {name: NAVIGATORS.WORKSPACE_NAVIGATOR}],
                    },
                },
            ],
        });

        const {result} = renderHook(() => useRestoreWorkspacesTabOnNavigate());
        result.current();

        // The older TabNavigator is reached via StackActions.pop (popping the newer empty one off the root stack),
        // not via a fresh Navigation.navigate. Verify dispatch was called with a POP action.
        expect(mockedDispatch).toHaveBeenCalledWith(expect.objectContaining({type: 'POP'}));
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    // On narrow layouts (mobile), the URL-based restore is skipped: we always land on the workspace's
    // initial page so the user can navigate inward via the side-list — matches mobile UX and the docs.
    it('falls back to the workspace initial page on narrow layouts even when a sub-page is focused', () => {
        mockResponsiveLayout.mockReturnValue({shouldUseNarrowLayout: true});
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

        expect(mockedGetPathFromState).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_INITIAL.getRoute(fakePolicyID));
    });

    // Cold-start path: when no workspace route exists anywhere in the live nav tree, fall back to the
    // sessionStorage-persisted state so a fresh page-load still restores the user's last workspace sub-page.
    it('hydrates from sessionStorage when the live navigation tree has no workspace route', () => {
        setupOnyxForPolicy();
        const restoredPath = `/workspaces/${fakePolicyID}/workflows` as const;
        mockedGetPathFromState.mockReturnValue(restoredPath);
        mockedGetRootState.mockReturnValue({
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {index: 0, routes: [{name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}]},
                },
            ],
        });
        lastVisitedTabPathUtils.getWorkspacesTabStateFromSessionStorage.mockReturnValue({
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        routes: [
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
            ],
        });

        const {result} = renderHook(() => useRestoreWorkspacesTabOnNavigate());
        result.current();

        expect(Navigation.navigate).toHaveBeenCalledWith(restoredPath);
    });

    // Domain restore: when the last workspace-tab route is a DOMAIN_SPLIT_NAVIGATOR with a domainAccountID,
    // resolve the matching Domain via useOnyx(ONYXKEYS.COLLECTION.DOMAIN) and navigate to the domain page.
    it('restores to the last visited domain when re-entering the Workspaces tab', () => {
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

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.DOMAIN_INITIAL.getRoute(fakeDomainAccountID));
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
