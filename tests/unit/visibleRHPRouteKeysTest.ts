import getVisibleRHPKeys from '@components/WideRHPContextProvider/getVisibleRHPRouteKeys';

import NAVIGATORS from '@src/NAVIGATORS';

import type {NavigationState} from '@react-navigation/native';

type TestRoute = NavigationState['routes'][number];

function buildRootState(routes: TestRoute[]): NavigationState {
    return {
        key: 'root',
        index: routes.length - 1,
        routeNames: routes.map((route) => route.name),
        routes,
        type: 'stack',
        stale: false,
    };
}

const reportsSplit: TestRoute = {key: 'split-1', name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR};
const searchFullscreen: TestRoute = {key: 'search-1', name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR};
const rhpWithChildren = (childKeys: string[]): TestRoute => ({
    key: 'rhp-1',
    name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
    state: {routes: childKeys.map((key) => ({key, name: 'Screen'}))},
});

describe('getVisibleRHPKeys', () => {
    it('returns nothing once a fullscreen navigator covers the RHP, which is what makes clearing the keys by hand unnecessary', () => {
        const state = buildRootState([reportsSplit, rhpWithChildren(['wideKey']), searchFullscreen]);

        expect(getVisibleRHPKeys(state, ['wideKey'], [])).toEqual({visibleWideRHPRouteKeys: [], visibleSuperWideRHPRouteKeys: []});
    });

    it('returns nothing when no RHP is open, and when navigation has not initialized', () => {
        expect(getVisibleRHPKeys(buildRootState([reportsSplit]), [], [])).toEqual({visibleWideRHPRouteKeys: [], visibleSuperWideRHPRouteKeys: []});
        expect(getVisibleRHPKeys(undefined, ['wideKey'], [])).toEqual({visibleWideRHPRouteKeys: [], visibleSuperWideRHPRouteKeys: []});
    });

    it('holds a dismissing RHP at its width, since the route leaves the state while the card is still animating out', () => {
        // The screens are still mounted, so their registrations survive and hold the width.
        expect(getVisibleRHPKeys(buildRootState([reportsSplit]), ['wideKey'], ['superWideKey'])).toEqual({
            visibleWideRHPRouteKeys: ['wideKey'],
            visibleSuperWideRHPRouteKeys: ['superWideKey'],
        });
    });

    it('holds a single dismissing screen at its width while the RHP below it stays open', () => {
        // Popping one screen off the RHP takes it out of the stack a frame before it unmounts, same as dismissing the whole RHP.
        const state = buildRootState([reportsSplit, rhpWithChildren(['remaining'])]);

        expect(getVisibleRHPKeys(state, ['dismissingWideKey'], [])).toEqual({visibleWideRHPRouteKeys: ['dismissingWideKey'], visibleSuperWideRHPRouteKeys: []});
    });

    it('does not hold a registered screen the RHP is simply not displaying', () => {
        // 'wideKey' is still in the stack under the super-wide screen, so it is on screen or not on its own merits, never held.
        const state = buildRootState([reportsSplit, rhpWithChildren(['wideKey', 'superWideKey'])]);

        expect(getVisibleRHPKeys(state, ['wideKey'], ['superWideKey'])).toEqual({visibleWideRHPRouteKeys: [], visibleSuperWideRHPRouteKeys: ['superWideKey']});
    });

    it('displays a registered screen while the RHP is on top', () => {
        const state = buildRootState([reportsSplit, rhpWithChildren(['a', 'wideKey', 'c'])]);

        expect(getVisibleRHPKeys(state, ['wideKey'], [])).toEqual({visibleWideRHPRouteKeys: ['wideKey'], visibleSuperWideRHPRouteKeys: []});
    });

    it('stops displaying a width once a screen stacked above it registers a wider one', () => {
        // The super-wide screen sits above the wide one, so only it is displayed.
        const state = buildRootState([reportsSplit, rhpWithChildren(['wideKey', 'superWideKey'])]);

        expect(getVisibleRHPKeys(state, ['wideKey'], ['superWideKey'])).toEqual({visibleWideRHPRouteKeys: [], visibleSuperWideRHPRouteKeys: ['superWideKey']});
    });

    it('keeps both displayed when the super-wide screen is stacked below the wide one, since the slice starts at the super-wide screen', () => {
        const state = buildRootState([reportsSplit, rhpWithChildren(['superWideKey', 'wideKey'])]);

        expect(getVisibleRHPKeys(state, ['wideKey'], ['superWideKey'])).toEqual({visibleWideRHPRouteKeys: ['wideKey'], visibleSuperWideRHPRouteKeys: ['superWideKey']});
    });

    it('returns the keys in registration order rather than stack order', () => {
        const state = buildRootState([reportsSplit, rhpWithChildren(['superWideKey', 'firstWide', 'secondWide'])]);

        expect(getVisibleRHPKeys(state, ['secondWide', 'firstWide'], ['superWideKey']).visibleWideRHPRouteKeys).toEqual(['secondWide', 'firstWide']);
    });

    it('holds a dismissing RHP at its width even while an older RHP sits covered below a fullscreen navigator', () => {
        // The top RHP has left the state but is still animating out, while the covered one below is still in the state.
        const state = buildRootState([reportsSplit, rhpWithChildren(['coveredKey']), searchFullscreen]);

        expect(getVisibleRHPKeys(state, ['dismissingKey'], [])).toEqual({visibleWideRHPRouteKeys: ['dismissingKey'], visibleSuperWideRHPRouteKeys: []});
        expect(getVisibleRHPKeys(state, ['coveredKey'], [])).toEqual({visibleWideRHPRouteKeys: [], visibleSuperWideRHPRouteKeys: []});
    });
});
