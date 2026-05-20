import type {NavigationRoute, ParamListBase} from '@react-navigation/native';
import ensureTabNavigatorRoutes from '@libs/Navigation/AppNavigator/createRootStackNavigator/useCustomRootStackNavigatorState/ensureTabNavigatorRoutes';
import NAVIGATORS from '@src/NAVIGATORS';

type Route = NavigationRoute<ParamListBase, string>;

function makeRoute(name: string, key: string): Route {
    return {name, key} as Route;
}

describe('ensureTabNavigatorRoutes', () => {
    it('returns slicedRoutes unchanged when indexToSlice is 0', () => {
        const routeA = makeRoute(NAVIGATORS.TAB_NAVIGATOR, 'tab-1');
        const routeB = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-1');
        const slicedRoutes = [routeA, routeB];
        expect(ensureTabNavigatorRoutes(slicedRoutes, 0, [routeA, routeB])).toBe(slicedRoutes);
    });

    it('returns slicedRoutes unchanged when no TAB_NAVIGATOR routes exist', () => {
        const routeA = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-1');
        const routeB = makeRoute(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, 'settings-1');
        const allRoutes = [routeA, routeB];
        const slicedRoutes = [routeB];
        const result = ensureTabNavigatorRoutes(slicedRoutes, 1, allRoutes);
        expect(result).toEqual([routeB]);
    });

    it('prepends last TAB_NAVIGATOR route when it was sliced away', () => {
        const tab1 = makeRoute(NAVIGATORS.TAB_NAVIGATOR, 'tab-1');
        const rhp1 = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-1');
        const rhp2 = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-2');
        const allRoutes = [tab1, rhp1, rhp2];
        const slicedRoutes = [rhp2];
        const result = ensureTabNavigatorRoutes(slicedRoutes, 2, allRoutes);
        expect(result).toEqual([tab1, rhp2]);
    });

    it('keeps last 2 TAB_NAVIGATOR routes and removes older ones from slicedRoutes', () => {
        const tab1 = makeRoute(NAVIGATORS.TAB_NAVIGATOR, 'tab-1');
        const tab2 = makeRoute(NAVIGATORS.TAB_NAVIGATOR, 'tab-2');
        const tab3 = makeRoute(NAVIGATORS.TAB_NAVIGATOR, 'tab-3');
        const rhp = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-1');
        const allRoutes = [tab1, tab2, tab3, rhp];
        // slicedRoutes still contains all 3 TABs — the function must filter out tab1 (not in last 2)
        const slicedRoutes = [tab1, tab2, tab3, rhp];
        const result = ensureTabNavigatorRoutes(slicedRoutes, 1, allRoutes);
        expect(result).toEqual([tab2, tab3, rhp]);
    });

    it('prepends both missing TAB_NAVIGATOR routes when both sliced off', () => {
        const tab1 = makeRoute(NAVIGATORS.TAB_NAVIGATOR, 'tab-1');
        const tab2 = makeRoute(NAVIGATORS.TAB_NAVIGATOR, 'tab-2');
        const rhp1 = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-1');
        const rhp2 = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-2');
        const allRoutes = [tab1, tab2, rhp1, rhp2];
        const slicedRoutes = [rhp2];
        const result = ensureTabNavigatorRoutes(slicedRoutes, 3, allRoutes);
        expect(result).toEqual([tab1, tab2, rhp2]);
    });

    it('preserves ordering: prepended routes come before existing routes', () => {
        const tab1 = makeRoute(NAVIGATORS.TAB_NAVIGATOR, 'tab-1');
        const rhp1 = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-1');
        const tab2 = makeRoute(NAVIGATORS.TAB_NAVIGATOR, 'tab-2');
        const rhp2 = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-2');
        const rhp3 = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-3');
        const allRoutes = [tab1, rhp1, tab2, rhp2, rhp3];
        const slicedRoutes = [rhp3];
        const result = ensureTabNavigatorRoutes(slicedRoutes, 4, allRoutes);
        expect(result).toEqual([tab1, tab2, rhp3]);
    });

    it('handles single TAB_NAVIGATOR among many non-TAB routes', () => {
        const tab1 = makeRoute(NAVIGATORS.TAB_NAVIGATOR, 'tab-1');
        const rhp1 = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-1');
        const rhp2 = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-2');
        const rhp3 = makeRoute(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, 'rhp-3');
        const allRoutes = [tab1, rhp1, rhp2, rhp3];
        const slicedRoutes = [rhp2, rhp3];
        const result = ensureTabNavigatorRoutes(slicedRoutes, 2, allRoutes);
        // tab1 is the only TAB and it was sliced off, so it should be prepended
        expect(result).toEqual([tab1, rhp2, rhp3]);
    });
});
