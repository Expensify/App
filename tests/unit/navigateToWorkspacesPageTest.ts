import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import navigateToWorkspacesPage from '@libs/Navigation/helpers/navigateToWorkspacesPage';
import Navigation from '@libs/Navigation/Navigation';
// eslint-disable-next-line no-restricted-syntax
import * as PolicyUtils from '@libs/PolicyUtils';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import createRandomPolicy from '../utils/collections/policies';

jest.mock('@libs/Navigation/navigationRef');
jest.mock('@libs/Navigation/Navigation');
jest.mock('@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState');
jest.mock('@libs/PolicyUtils');
jest.mock('@libs/interceptAnonymousUser');

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

    it('navigates to workspace initial screen if valid policy and screen exist', () => {
        (PolicyUtils.shouldShowPolicy as jest.Mock).mockReturnValue(true);
        (PolicyUtils.isPendingDeletePolicy as jest.Mock).mockReturnValue(false);

        mockIntercept();
        navigateToWorkspacesPage({
            ...baseParams,
            topmostFullScreenRoute: {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR},
            lastWorkspacesTabNavigatorRoute: {name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR, key: 'someKey'},
        });

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
