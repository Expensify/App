// Jest unit test for getWorkspaceTabNavigationAction
import type {NavigationState, PartialState} from '@react-navigation/native';
import getWorkspaceTabNavigationAction from '@libs/Navigation/helpers/getWorkspaceTabNavigationAction';
import * as lastVisitedTabPathUtils from '@libs/Navigation/helpers/lastVisitedTabPathUtils';
import navigationRef from '@libs/Navigation/navigationRef';
import * as PolicyUtils from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import createRandomPolicy from '../utils/collections/policies';

jest.mock('@libs/Navigation/navigationRef', () => ({
    getRootState: jest.fn(),
}));
jest.mock('@libs/Navigation/helpers/lastVisitedTabPathUtils');
jest.mock('@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState', () => ({
    getPreservedNavigatorState: jest.fn(),
}));
jest.mock('@libs/PolicyUtils');

const fakePolicyID = '344559B2CCF2B6C1';
const mockPolicy = createRandomPolicy(0);
const mockParams = {currentUserLogin: 'test@example.com', shouldUseNarrowLayout: false};

const mockedNavigationRef = navigationRef as jest.Mocked<typeof navigationRef>;
const mockedUtils = lastVisitedTabPathUtils as jest.Mocked<typeof lastVisitedTabPathUtils>;
const mockedPolicyUtils = PolicyUtils as jest.Mocked<typeof PolicyUtils>;

// Helper to return valid mock navigation state
function createMockNavState(routeName: string, key = `${routeName}_key`): NavigationState {
    return {
        key: 'root',
        index: 0,
        routeNames: [routeName],
        routes: [{name: routeName, key}],
        type: 'stack',
        stale: false,
    };
}

describe('getWorkspaceTabNavigationAction', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns {type: "return"} when there is no topmost full screen route', () => {
        mockedNavigationRef.getRootState.mockReturnValue({
            key: 'root',
            index: 0,
            routeNames: [],
            routes: [],
            type: 'stack',
            stale: false,
        });
        const result = getWorkspaceTabNavigationAction(mockParams);
        expect(result).toEqual({type: 'return'});
    });

    it('returns {type: "goBack"} when topmost route is WORKSPACE_SPLIT_NAVIGATOR', () => {
        mockedNavigationRef.getRootState.mockReturnValue(createMockNavState('WorkspaceSplitNavigator'));
        const result = getWorkspaceTabNavigationAction(mockParams);
        expect(result).toEqual({type: 'goBack', route: ROUTES.WORKSPACES_LIST.route});
    });

    it('navigates to WORKSPACES_LIST when last route is not workspace-related', () => {
        mockedNavigationRef.getRootState.mockReturnValue(createMockNavState('ReportsSplitNavigator'));

        mockedUtils.getWorkspacesTabStateFromSessionStorage.mockReturnValue({
            routes: [{name: 'ReportsSplitNavigator'}],
        } as PartialState<NavigationState>);

        const result = getWorkspaceTabNavigationAction(mockParams);
        expect(result).toEqual({type: 'navigate', route: ROUTES.WORKSPACES_LIST.route});
    });

    it('dispatches OPEN_WORKSPACE_SPLIT when valid workspace is found and allowed', () => {
        mockedNavigationRef.getRootState.mockReturnValue(createMockNavState(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR));

        mockedUtils.getWorkspacesTabStateFromSessionStorage.mockReturnValue({
            routes: [
                {
                    name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                    state: {
                        routes: [
                            {
                                name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                                params: {
                                    policyID: fakePolicyID,
                                },
                            },
                        ],
                    },
                },
            ],
        } as PartialState<NavigationState>);

        mockedPolicyUtils.getPolicy.mockReturnValue(mockPolicy);
        mockedPolicyUtils.shouldShowPolicy.mockReturnValue(true);
        mockedPolicyUtils.isPendingDeletePolicy.mockReturnValue(false);
        mockedUtils.getLastVisitedWorkspaceTabScreen.mockReturnValue('Workspace_Overview');

        const result = getWorkspaceTabNavigationAction(mockParams);

        expect(result).toEqual({
            type: 'dispatch',
            dispatchType: CONST.NAVIGATION.ACTION_TYPE.OPEN_WORKSPACE_SPLIT,
            payload: {
                policyID: fakePolicyID,
                screenName: 'Workspace_Overview',
            },
        });
    });

    it('navigates to WORKSPACES_LIST if policy is pending delete', () => {
        mockedNavigationRef.getRootState.mockReturnValue(createMockNavState(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR));

        mockedUtils.getWorkspacesTabStateFromSessionStorage.mockReturnValue({
            routes: [
                {
                    name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                    state: {
                        routes: [
                            {
                                name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                                params: {
                                    policyID: fakePolicyID,
                                },
                            },
                        ],
                    },
                },
            ],
        } as PartialState<NavigationState>);

        mockedPolicyUtils.getPolicy.mockReturnValue(mockPolicy);
        mockedPolicyUtils.shouldShowPolicy.mockReturnValue(true);
        mockedPolicyUtils.isPendingDeletePolicy.mockReturnValue(true);

        const result = getWorkspaceTabNavigationAction(mockParams);
        expect(result).toEqual({type: 'navigate', route: ROUTES.WORKSPACES_LIST.route});
    });

    it('returns {type: "return"} if no policyID exists in params', () => {
        mockedNavigationRef.getRootState.mockReturnValue(createMockNavState('SomeRoute'));

        mockedUtils.getWorkspacesTabStateFromSessionStorage.mockReturnValue({
            routes: [
                {
                    name: 'WorkspaceSplitNavigator',
                    state: {
                        routes: [
                            {
                                name: 'Workspace_Initial',
                                params: {},
                            },
                        ],
                    },
                },
            ],
        } as PartialState<NavigationState>);

        const result = getWorkspaceTabNavigationAction(mockParams);
        expect(result).toEqual({type: 'return'});
    });
});
