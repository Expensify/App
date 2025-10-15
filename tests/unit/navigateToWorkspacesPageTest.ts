import interceptAnonymousUser from '@libs/interceptAnonymousUser';
// eslint-disable-next-line no-restricted-syntax
import * as lastVisitedTabPathUtils from '@libs/Navigation/helpers/lastVisitedTabPathUtils';
import navigateToWorkspacesPage from '@libs/Navigation/helpers/navigateToWorkspacesPage';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
// eslint-disable-next-line no-restricted-syntax
import * as PolicyUtils from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import createRandomPolicy from '../utils/collections/policies';

jest.mock('@libs/Navigation/navigationRef');
jest.mock('@libs/Navigation/Navigation');
jest.mock('@libs/Navigation/helpers/lastVisitedTabPathUtils');
jest.mock('@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState');
jest.mock('@libs/PolicyUtils');
jest.mock('@libs/interceptAnonymousUser');

const fakePolicyID = '344559B2CCF2B6C1';
const mockPolicy = {...createRandomPolicy(0), id: fakePolicyID};
const mockParams = {currentUserLogin: 'test@example.com', shouldUseNarrowLayout: false, policy: mockPolicy};

describe('navigateToWorkspacesPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (navigationRef.isReady as jest.Mock).mockReturnValue(true);
    });

    function mockIntercept() {
        (interceptAnonymousUser as jest.Mock).mockImplementation((callback: () => void) => {
            callback();
        });
    }
    it('does nothing if no full screen route', () => {
        (navigationRef.getRootState as jest.Mock).mockReturnValue({routes: []});
        navigateToWorkspacesPage(mockParams);
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });

    it('calls goBack if top route is WORKSPACE_SPLIT_NAVIGATOR', () => {
        (navigationRef.getRootState as jest.Mock).mockReturnValue({
            routes: [{name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR}],
        });
        navigateToWorkspacesPage(mockParams);
        expect(Navigation.goBack).toHaveBeenCalledWith(ROUTES.WORKSPACES_LIST.route);
    });

    it('navigates to WORKSPACES_LIST if no valid workspace route exists', () => {
        (navigationRef.getRootState as jest.Mock).mockReturnValue({
            routes: [{name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}],
        });

        (lastVisitedTabPathUtils.getWorkspacesTabStateFromSessionStorage as jest.Mock).mockReturnValue({
            routes: [{name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}],
        });

        mockIntercept();
        navigateToWorkspacesPage(mockParams);

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACES_LIST.route);
    });

    it('dispatches OPEN_WORKSPACE_SPLIT if valid policy and screen exist', () => {
        (navigationRef.getRootState as jest.Mock).mockReturnValue({
            routes: [{name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}],
        });

        (lastVisitedTabPathUtils.getWorkspacesTabStateFromSessionStorage as jest.Mock).mockReturnValue({
            routes: [
                {
                    name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                    state: {
                        routes: [
                            {
                                name: SCREENS.WORKSPACE.INITIAL,
                                params: {policyID: fakePolicyID},
                            },
                        ],
                    },
                    key: 'someKey',
                },
            ],
        });

        (PolicyUtils.shouldShowPolicy as jest.Mock).mockReturnValue(true);
        (PolicyUtils.isPendingDeletePolicy as jest.Mock).mockReturnValue(false);
        (lastVisitedTabPathUtils.getLastVisitedWorkspaceTabScreen as jest.Mock).mockReturnValue('Workspace_Overview');

        mockIntercept();
        navigateToWorkspacesPage(mockParams);

        const dispatch = jest.spyOn(navigationRef, 'dispatch');
        expect(dispatch).toHaveBeenCalledWith({
            type: CONST.NAVIGATION.ACTION_TYPE.OPEN_WORKSPACE_SPLIT,
            payload: {policyID: fakePolicyID, screenName: 'Workspace_Overview'},
        });
    });

    it('navigates to WORKSPACES_LIST if policy is pending delete', () => {
        (navigationRef.getRootState as jest.Mock).mockReturnValue({
            routes: [{name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}],
        });

        (lastVisitedTabPathUtils.getWorkspacesTabStateFromSessionStorage as jest.Mock).mockReturnValue({
            routes: [
                {
                    name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                    state: {
                        routes: [
                            {
                                name: SCREENS.WORKSPACE.INITIAL,
                                params: {policyID: fakePolicyID},
                            },
                        ],
                    },
                },
            ],
        });

        (PolicyUtils.shouldShowPolicy as jest.Mock).mockReturnValue(true);
        (PolicyUtils.isPendingDeletePolicy as jest.Mock).mockReturnValue(true);

        mockIntercept();
        navigateToWorkspacesPage(mockParams);

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACES_LIST.route);
    });

    it('navigates to WORKSPACES_LIST if shouldShowPolicy is false for the user', () => {
        (navigationRef.getRootState as jest.Mock).mockReturnValue({
            routes: [{name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}],
        });

        (lastVisitedTabPathUtils.getWorkspacesTabStateFromSessionStorage as jest.Mock).mockReturnValue({
            routes: [
                {
                    name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                    state: {
                        routes: [
                            {
                                name: SCREENS.WORKSPACE.INITIAL,
                                params: {policyID: fakePolicyID},
                            },
                        ],
                    },
                },
            ],
        });

        (PolicyUtils.shouldShowPolicy as jest.Mock).mockReturnValue(false);
        (PolicyUtils.isPendingDeletePolicy as jest.Mock).mockReturnValue(false);

        mockIntercept();
        navigateToWorkspacesPage(mockParams);

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACES_LIST.route);
    });

    it('navigates to WORKSPACES_LIST if policyID is missing', () => {
        (navigationRef.getRootState as jest.Mock).mockReturnValue({
            routes: [{name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}],
        });

        (lastVisitedTabPathUtils.getWorkspacesTabStateFromSessionStorage as jest.Mock).mockReturnValue({
            routes: [
                {
                    name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                    state: {
                        routes: [
                            {
                                name: SCREENS.WORKSPACE.INITIAL,
                                params: {},
                            },
                        ],
                    },
                },
            ],
        });

        mockIntercept();
        navigateToWorkspacesPage(mockParams);

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACES_LIST.route);
    });
});
