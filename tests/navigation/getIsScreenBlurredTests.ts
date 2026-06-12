import type {NavigationState} from '@react-navigation/native';
import getIsScreenBlurred from '@libs/Navigation/AppNavigator/FreezeWrapper/getIsScreenBlurred';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

function makeState(routes: Array<{name: string; key: string}>): NavigationState {
    return {
        routes: routes.map((r) => ({...r, params: undefined})),
        index: routes.length - 1,
        key: 'root',
        routeNames: routes.map((r) => r.name),
        stale: false,
        type: 'stack',
    } as unknown as NavigationState;
}

// jest-expo resolves to the native implementation of getIsScreenBlurred,
// which checks whether the screen is among the last 2 full-screen routes.
describe('getIsScreenBlurred (native)', () => {
    it('returns false when screen is the last full-screen route', () => {
        const state = makeState([
            {name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR, key: 'k-rhp'},
            {name: NAVIGATORS.TAB_NAVIGATOR, key: 'k-tab'},
        ]);
        expect(getIsScreenBlurred(state, 'k-tab')).toBe(false);
    });

    it('returns false when screen is the second-to-last full-screen route', () => {
        const state = makeState([
            {name: SCREENS.HOME, key: 'k-home'},
            {name: NAVIGATORS.TAB_NAVIGATOR, key: 'k-tab'},
        ]);
        // Both HOME and TAB_NAVIGATOR are full-screen, last 2 = [HOME, TAB_NAVIGATOR]
        expect(getIsScreenBlurred(state, 'k-home')).toBe(false);
    });

    it('returns true when screen is NOT among last 2 full-screen routes', () => {
        const state = makeState([
            {name: NAVIGATORS.TAB_NAVIGATOR, key: 'k-tab-1'},
            {name: SCREENS.HOME, key: 'k-home'},
            {name: NAVIGATORS.TAB_NAVIGATOR, key: 'k-tab-2'},
        ]);
        // Full-screen routes: [k-tab-1, k-home, k-tab-2], last 2 = [k-home, k-tab-2]
        expect(getIsScreenBlurred(state, 'k-tab-1')).toBe(true);
    });

    it('returns true when no full-screen route exists and screen is non-full-screen', () => {
        const state = makeState([{name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR, key: 'k-rhp'}]);
        // No full-screen routes => lastTwoFullScreenRoutes is empty
        expect(getIsScreenBlurred(state, 'k-rhp')).toBe(true);
    });

    it('returns true for non-full-screen route even when full-screen routes exist', () => {
        const state = makeState([
            {name: NAVIGATORS.TAB_NAVIGATOR, key: 'k-tab'},
            {name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR, key: 'k-rhp'},
        ]);
        // Full-screen routes: [TAB_NAVIGATOR], last 2 = [TAB_NAVIGATOR]
        // RHP is not in that set
        expect(getIsScreenBlurred(state, 'k-rhp')).toBe(true);
    });

    it('handles multiple full-screen routes keeping only last 2', () => {
        const state = makeState([
            {name: SCREENS.HOME, key: 'k-home'},
            {name: NAVIGATORS.TAB_NAVIGATOR, key: 'k-tab-1'},
            {name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, key: 'k-search'},
            {name: NAVIGATORS.TAB_NAVIGATOR, key: 'k-tab-2'},
        ]);
        // Full-screen routes: [HOME, TAB-1, SEARCH, TAB-2], last 2 = [SEARCH, TAB-2]
        expect(getIsScreenBlurred(state, 'k-home')).toBe(true);
        expect(getIsScreenBlurred(state, 'k-tab-1')).toBe(true);
        expect(getIsScreenBlurred(state, 'k-search')).toBe(false);
        expect(getIsScreenBlurred(state, 'k-tab-2')).toBe(false);
    });
});
