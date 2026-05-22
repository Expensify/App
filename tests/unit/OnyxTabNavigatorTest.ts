import {getInitialTabName, getSelectedTabFromRoute} from '@libs/Navigation/OnyxTabNavigator';
import CONST from '@src/CONST';

jest.mock('react-native-tab-view', () => ({
    TabView: 'TabView',
    SceneMap: jest.fn(),
    TabBar: 'TabBar',
}));

describe('OnyxTabNavigator', () => {
    const requestTabs = [CONST.TAB_REQUEST.MANUAL, CONST.TAB_REQUEST.SCAN, CONST.TAB_REQUEST.DISTANCE];

    it('uses the route-selected tab before a stale Onyx selected tab', () => {
        const routeSelectedTab = getSelectedTabFromRoute(
            {
                state: {
                    index: 0,
                    routes: [{name: CONST.TAB_REQUEST.SCAN}],
                },
            },
            requestTabs,
        );

        expect(routeSelectedTab).toBe(CONST.TAB_REQUEST.SCAN);
        expect(getInitialTabName(requestTabs, CONST.TAB_REQUEST.MANUAL, CONST.TAB_REQUEST.MANUAL, routeSelectedTab)).toBe(CONST.TAB_REQUEST.SCAN);
    });

    it('uses route params when nested state is not available yet', () => {
        const routeSelectedTab = getSelectedTabFromRoute(
            {
                params: {
                    screen: CONST.TAB_REQUEST.DISTANCE,
                },
            },
            requestTabs,
        );

        expect(routeSelectedTab).toBe(CONST.TAB_REQUEST.DISTANCE);
        expect(getInitialTabName(requestTabs, CONST.TAB_REQUEST.SCAN, CONST.TAB_REQUEST.MANUAL, routeSelectedTab)).toBe(CONST.TAB_REQUEST.DISTANCE);
    });

    it('supports distance child routes including odometer', () => {
        const distanceTabs = [CONST.TAB_REQUEST.DISTANCE_MAP, CONST.TAB_REQUEST.DISTANCE_MANUAL, CONST.TAB_REQUEST.DISTANCE_GPS, CONST.TAB_REQUEST.DISTANCE_ODOMETER];
        const routeSelectedTab = getSelectedTabFromRoute(
            {
                state: {
                    index: 0,
                    routes: [{name: CONST.TAB_REQUEST.DISTANCE_ODOMETER}],
                },
            },
            distanceTabs,
        );

        expect(routeSelectedTab).toBe(CONST.TAB_REQUEST.DISTANCE_ODOMETER);
        expect(getInitialTabName(distanceTabs, CONST.TAB_REQUEST.DISTANCE_MAP, CONST.TAB_REQUEST.DISTANCE_MAP, routeSelectedTab)).toBe(CONST.TAB_REQUEST.DISTANCE_ODOMETER);
    });

    it('ignores route-selected tabs that are not rendered', () => {
        const routeSelectedTab = getSelectedTabFromRoute(
            {
                state: {
                    index: 0,
                    routes: [{name: CONST.TAB_REQUEST.TIME}],
                },
            },
            requestTabs,
        );

        expect(routeSelectedTab).toBeUndefined();
        expect(getInitialTabName(requestTabs, CONST.TAB_REQUEST.MANUAL, CONST.TAB_REQUEST.SCAN, routeSelectedTab)).toBe(CONST.TAB_REQUEST.MANUAL);
    });
});
