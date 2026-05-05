import {renderHook} from '@testing-library/react-native';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import Navigation from '@libs/Navigation/Navigation';
import NAVIGATORS from '@src/NAVIGATORS';
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

const mockRootState = jest.fn((): unknown => undefined);
jest.mock('@hooks/useRootNavigationState', () => (selector: (state: unknown) => unknown) => selector(mockRootState()));

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
const mockedGetPathFromState = getPathFromState as jest.MockedFunction<typeof getPathFromState>;

const useRestoreWorkspacesTabOnNavigate = (require('@hooks/useRestoreWorkspacesTabOnNavigate') as {default: () => () => void}).default;

const PolicyUtils = require('@libs/PolicyUtils') as {shouldShowPolicy: jest.Mock; isPendingDeletePolicy: jest.Mock};

const lastVisitedTabPathUtils = require('@libs/Navigation/helpers/lastVisitedTabPathUtils') as {getWorkspacesTabStateFromSessionStorage: jest.Mock};

function setupOnyxForPolicy() {
    mockUseOnyx.mockImplementation((_key: unknown, opts?: {selector?: (data: unknown) => unknown}) => {
        if (opts?.selector) {
            return [opts.selector({[`policy_${fakePolicyID}`]: mockPolicy})];
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
    });

    it('restores to the last visited workspace when re-entering the Workspaces tab', () => {
        setupOnyxForPolicy();
        const restoredPath = `/workspaces/${fakePolicyID}` as const;
        mockedGetPathFromState.mockReturnValue(restoredPath);
        mockRootState.mockReturnValue(
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
        mockRootState.mockReturnValue({
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
        mockRootState.mockReturnValue(
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
        mockRootState.mockReturnValue(
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
        const restoredPath = `/workspaces/${fakePolicyID}/workflows` as const;
        mockedGetPathFromState.mockReturnValue(restoredPath);
        mockRootState.mockReturnValue({
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

        expect(Navigation.navigate).toHaveBeenCalledWith(restoredPath);
    });

    // On narrow layouts (mobile), the URL-based restore is skipped: we always land on the workspace's
    // initial page so the user can navigate inward via the side-list — matches mobile UX and the docs.
    it('falls back to the workspace initial page on narrow layouts even when a sub-page is focused', () => {
        mockResponsiveLayout.mockReturnValue({shouldUseNarrowLayout: true});
        setupOnyxForPolicy();
        mockRootState.mockReturnValue(
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
        mockRootState.mockReturnValue({
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
        });

        const {result} = renderHook(() => useRestoreWorkspacesTabOnNavigate());
        result.current();

        expect(Navigation.navigate).toHaveBeenCalledWith(restoredPath);
    });
});
