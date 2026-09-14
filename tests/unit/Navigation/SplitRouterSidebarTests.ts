import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import SplitRouter from '@libs/Navigation/AppNavigator/createSplitNavigator/SplitRouter';
import type SplitNavigatorRouterOptions from '@libs/Navigation/AppNavigator/createSplitNavigator/types';
import navigationRef from '@libs/Navigation/navigationRef';

import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationState, ParamListBase, RouteProp, RouterConfigOptions, StackNavigationState} from '@react-navigation/native';

import {StackActions} from '@react-navigation/native';

jest.mock('@libs/getIsNarrowLayout', () => jest.fn());
jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        isReady: jest.fn(() => true),
        getRootState: jest.fn(),
    },
}));

const mockedGetIsNarrowLayout = jest.mocked(getIsNarrowLayout);
const mockedNavigationRef = jest.mocked(navigationRef);

const POLICY_ID = 'policy-a';
const SIDEBAR_SCREEN = SCREENS.WORKSPACE.INITIAL;
const CENTRAL_SCREEN = SCREENS.WORKSPACE.PROFILE;
const ROUTE_NAMES = [SIDEBAR_SCREEN, CENTRAL_SCREEN, SCREENS.WORKSPACE.MEMBERS];

const routerOptions: SplitNavigatorRouterOptions = {
    sidebarScreen: SIDEBAR_SCREEN,
    defaultCentralScreen: CENTRAL_SCREEN,
    parentRoute: {key: 'split-route', name: NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR} as RouteProp<ParamListBase>,
};

const configOptions: RouterConfigOptions = {
    routeNames: ROUTE_NAMES,
    routeParamList: {},
    routeGetIdList: {},
};

// The sidebar carries params of its own (`backTo`), which is why the original route object has to survive.
const sidebarRoute = {key: 'sidebar-key', name: SIDEBAR_SCREEN, params: {policyID: POLICY_ID, backTo: ROUTES.WORKSPACES_LIST.route}};

function buildSidebarOnlyState(): StackNavigationState<ParamListBase> {
    return {
        key: 'split-state',
        index: 0,
        preloadedRoutes: [],
        routeNames: ROUTE_NAMES,
        routes: [sidebarRoute],
        stale: false,
        type: 'stack',
    };
}

function setRootRouteCount(count: number) {
    mockedNavigationRef.getRootState.mockReturnValue({routes: new Array(count).fill({name: NAVIGATORS.TAB_NAVIGATOR})} as NavigationState);
}

describe('SplitRouter sidebar invariant', () => {
    const router = SplitRouter(routerOptions);

    beforeEach(() => {
        jest.clearAllMocks();
        mockedNavigationRef.isReady.mockReturnValue(true);
        setRootRouteCount(2);
    });

    describe('on the wide layout', () => {
        beforeEach(() => {
            mockedGetIsNarrowLayout.mockReturnValue(false);
        });

        it('keeps the original sidebar route when a REPLACE would drop it', () => {
            const state = buildSidebarOnlyState();

            const result = router.getStateForAction(state, StackActions.replace(CENTRAL_SCREEN, {policyID: POLICY_ID}), configOptions);

            expect(result?.routes).toHaveLength(2);
            expect(result?.index).toBe(1);
            // The same object, so the sidebar keeps its key and its own params rather than being synthesized again.
            expect(result?.routes.at(0)).toEqual(sidebarRoute);
            expect(result?.routes.at(1)).toMatchObject({name: CENTRAL_SCREEN, params: {policyID: POLICY_ID}});
        });

        it('keeps the original sidebar route when a POP_TO misses and rebuilds the stack', () => {
            const state = buildSidebarOnlyState();

            const result = router.getStateForAction(state, StackActions.popTo(SCREENS.WORKSPACE.MEMBERS, {policyID: POLICY_ID}), configOptions);

            expect(result?.routes).toHaveLength(2);
            expect(result?.index).toBe(1);
            expect(result?.routes.at(0)).toEqual(sidebarRoute);
            expect(result?.routes.at(1)).toMatchObject({name: SCREENS.WORKSPACE.MEMBERS, params: {policyID: POLICY_ID}});
        });

        it('leaves a state that still has its sidebar alone', () => {
            const state = buildSidebarOnlyState();

            const result = router.getStateForAction(state, StackActions.push(CENTRAL_SCREEN, {policyID: POLICY_ID}), configOptions);

            expect(result?.routes.map((route) => route.name)).toEqual([SIDEBAR_SCREEN, CENTRAL_SCREEN]);
            expect(mockedNavigationRef.getRootState).not.toHaveBeenCalled();
        });

        it('passes a null result through so that popping the whole split reaches the parent', () => {
            const state = buildSidebarOnlyState();

            expect(router.getStateForAction(state, StackActions.pop(), configOptions)).toBeNull();
        });
    });

    describe('on the narrow layout', () => {
        beforeEach(() => {
            mockedGetIsNarrowLayout.mockReturnValue(true);
        });

        it('lets the sidebar go when the split is not the only root route', () => {
            const state = buildSidebarOnlyState();

            const result = router.getStateForAction(state, StackActions.replace(CENTRAL_SCREEN, {policyID: POLICY_ID}), configOptions);

            expect(result?.routes.map((route) => route.name)).toEqual([CENTRAL_SCREEN]);
        });

        it('keeps the sidebar while the split is the only root route, so there is something to swipe back to', () => {
            setRootRouteCount(1);
            const state = buildSidebarOnlyState();

            const result = router.getStateForAction(state, StackActions.replace(CENTRAL_SCREEN, {policyID: POLICY_ID}), configOptions);

            expect(result?.routes.at(0)).toEqual(sidebarRoute);
            expect(result?.routes.map((route) => route.name)).toEqual([SIDEBAR_SCREEN, CENTRAL_SCREEN]);
        });
    });
});
