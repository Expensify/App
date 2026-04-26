import {renderHook} from '@testing-library/react-native';
import Navigation from '@libs/Navigation/Navigation';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import createRandomPolicy from '../../utils/collections/policies';

jest.mock('@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState', () => ({
    getPreservedNavigatorState: jest.fn(() => undefined),
}));

jest.mock('@libs/Navigation/helpers/lastVisitedTabPathUtils', () => ({
    getWorkspacesTabStateFromSessionStorage: jest.fn(() => undefined),
}));

jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: false}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({login: 'test@example.com'}));

const mockRootState = jest.fn((): unknown => undefined);
jest.mock('@hooks/useRootNavigationState', () => (selector: (state: unknown) => unknown) => selector(mockRootState()));

const mockUseOnyx = jest.fn().mockReturnValue([undefined]);
jest.mock('@hooks/useOnyx', () => (key: unknown, opts?: unknown) => mockUseOnyx(key, opts) as unknown[]);

jest.mock('@libs/interceptAnonymousUser', () => (cb: () => void) => cb());

jest.mock('@libs/Navigation/navigationRef', () => ({getRootState: jest.fn(() => ({routes: []})), isReady: jest.fn(() => true)}));

jest.mock('@react-navigation/native', () => ({
    findFocusedRoute: jest.fn(() => ({name: 'some-screen'})),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
}));

// eslint-disable-next-line no-restricted-syntax
jest.mock('@libs/PolicyUtils', () => ({
    shouldShowPolicy: jest.fn(() => true),
    isPendingDeletePolicy: jest.fn(() => false),
}));

const fakePolicyID = 'ABCD1234';
const mockPolicy = {...createRandomPolicy(0), id: fakePolicyID};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const useRestoreWorkspacesTabOnNavigate = (require('@hooks/useRestoreWorkspacesTabOnNavigate') as {default: () => () => void}).default;

// eslint-disable-next-line @typescript-eslint/no-require-imports, no-restricted-syntax
const PolicyUtils = require('@libs/PolicyUtils') as {shouldShowPolicy: jest.Mock; isPendingDeletePolicy: jest.Mock};

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
        PolicyUtils.shouldShowPolicy.mockReturnValue(true);
        PolicyUtils.isPendingDeletePolicy.mockReturnValue(false);
    });

    it('restores to the last visited workspace when re-entering the Workspaces tab', () => {
        setupOnyxForPolicy();
        mockRootState.mockReturnValue(buildStateWithUserOnDifferentTab([{name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, state: {routes: [{params: {policyID: fakePolicyID}}]}}]));

        const {result} = renderHook(() => useRestoreWorkspacesTabOnNavigate());
        result.current();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_INITIAL.getRoute(fakePolicyID));
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
        mockRootState.mockReturnValue(buildStateWithUserOnDifferentTab([{name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, state: {routes: [{params: {policyID: fakePolicyID}}]}}]));

        const {result} = renderHook(() => useRestoreWorkspacesTabOnNavigate());
        result.current();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACES_LIST.route);
    });
});
