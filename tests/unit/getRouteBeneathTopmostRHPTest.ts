import getRouteBeneathTopmostRHP from '@libs/Navigation/helpers/getRouteBeneathTopmostRHP';
import navigationRef from '@libs/Navigation/navigationRef';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

jest.mock('@libs/Navigation/navigationRef', () => ({getRootState: jest.fn()}));

// eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock doesn't rely on `this` binding
const mockGetRootState = jest.mocked(navigationRef.getRootState);

type RootState = ReturnType<typeof navigationRef.getRootState>;
type RootRoutes = RootState['routes'];

// Wrap a routes array into a full navigation state (the fields getRootState is typed to return).
const asRoot = (routes: RootRoutes): RootState => ({stale: false, type: 'stack', key: 'root', index: Math.max(0, routes.length - 1), routeNames: routes.map((route) => route.name), routes});

// The RIGHT_MODAL_NAVIGATOR route with the given inner stack (bottom → top).
const rhpNavigator = (innerRouteNames: string[]): RootRoutes[number] => ({
    key: 'rhp-0',
    name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
    state: {
        stale: false,
        type: 'stack',
        key: 'rhp-state',
        index: Math.max(0, innerRouteNames.length - 1),
        routeNames: innerRouteNames,
        routes: innerRouteNames.map((name, index) => ({key: `k${index}`, name})),
    },
});

const tabNavigator: RootRoutes[number] = {key: 'tab-0', name: NAVIGATORS.TAB_NAVIGATOR};

beforeEach(() => mockGetRootState.mockReset());

describe('getRouteBeneathTopmostRHP', () => {
    it('returns undefined when there is no root state', () => {
        // beforeEach reset leaves getRootState returning undefined.
        expect(getRouteBeneathTopmostRHP()).toBeUndefined();
    });

    it('returns undefined when the root has no RHP navigator', () => {
        mockGetRootState.mockReturnValue(asRoot([tabNavigator]));
        expect(getRouteBeneathTopmostRHP()).toBeUndefined();
    });

    it('returns undefined when the RHP stack has a single route (opened directly)', () => {
        mockGetRootState.mockReturnValue(asRoot([tabNavigator, rhpNavigator([SCREENS.RIGHT_MODAL.SEARCH_REPORT])]));
        expect(getRouteBeneathTopmostRHP()).toBeUndefined();
    });

    it('returns the route directly beneath the top of the RHP stack (the drill-down parent)', () => {
        mockGetRootState.mockReturnValue(asRoot([tabNavigator, rhpNavigator([SCREENS.RIGHT_MODAL.EXPENSE_REPORT, SCREENS.RIGHT_MODAL.SEARCH_REPORT])]));
        expect(getRouteBeneathTopmostRHP()?.name).toBe(SCREENS.RIGHT_MODAL.EXPENSE_REPORT);
    });
});
