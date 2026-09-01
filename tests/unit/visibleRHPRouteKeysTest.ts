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

/** Most cases assume a screen the state has already shown, so `seen` defaults to every registered key. */
function visibleKeys(state: NavigationState | undefined, wide: string[], superWide: string[], seen: string[] = [...wide, ...superWide]) {
    const {visibleWideRHPRouteKeys, visibleSuperWideRHPRouteKeys} = getVisibleRHPKeys(state, wide, superWide, new Set(seen));
    return {visibleWideRHPRouteKeys, visibleSuperWideRHPRouteKeys};
}

describe('getVisibleRHPKeys', () => {
    it('returns nothing once a fullscreen navigator covers the RHP, which is what makes clearing the keys by hand unnecessary', () => {
        const state = buildRootState([reportsSplit, rhpWithChildren(['wideKey']), searchFullscreen]);

        expect(visibleKeys(state, ['wideKey'], [])).toEqual({visibleWideRHPRouteKeys: [], visibleSuperWideRHPRouteKeys: []});
    });

    it('returns nothing when no RHP is open, and when navigation has not initialized', () => {
        expect(visibleKeys(buildRootState([reportsSplit]), [], [])).toEqual({visibleWideRHPRouteKeys: [], visibleSuperWideRHPRouteKeys: []});
        expect(visibleKeys(undefined, ['wideKey'], [])).toEqual({visibleWideRHPRouteKeys: [], visibleSuperWideRHPRouteKeys: []});
    });

    it('holds a dismissing RHP at its width, since the route leaves the state while the card is still animating out', () => {
        // The screens are still mounted, so their registrations survive and hold the width.
        expect(visibleKeys(buildRootState([reportsSplit]), ['wideKey'], ['superWideKey'])).toEqual({
            visibleWideRHPRouteKeys: ['wideKey'],
            visibleSuperWideRHPRouteKeys: ['superWideKey'],
        });
    });

    it('holds a single dismissing screen at its width while the RHP below it stays open', () => {
        // Popping one screen off the RHP takes it out of the stack a frame before it unmounts, same as dismissing the whole RHP.
        const state = buildRootState([reportsSplit, rhpWithChildren(['remaining'])]);

        expect(visibleKeys(state, ['dismissingWideKey'], [])).toEqual({visibleWideRHPRouteKeys: ['dismissingWideKey'], visibleSuperWideRHPRouteKeys: []});
    });

    it('does not hold a registered screen the RHP is simply not displaying', () => {
        // 'wideKey' is still in the stack under the super-wide screen, so it is judged on its own and never held.
        const state = buildRootState([reportsSplit, rhpWithChildren(['wideKey', 'superWideKey'])]);

        expect(visibleKeys(state, ['wideKey'], ['superWideKey'])).toEqual({visibleWideRHPRouteKeys: [], visibleSuperWideRHPRouteKeys: ['superWideKey']});
    });

    it('displays a registered screen while the RHP is on top', () => {
        const state = buildRootState([reportsSplit, rhpWithChildren(['a', 'wideKey', 'c'])]);

        expect(visibleKeys(state, ['wideKey'], [])).toEqual({visibleWideRHPRouteKeys: ['wideKey'], visibleSuperWideRHPRouteKeys: []});
    });

    it('stops displaying a width once a screen stacked above it registers a wider one', () => {
        // The super-wide screen sits above the wide one, so only it is displayed.
        const state = buildRootState([reportsSplit, rhpWithChildren(['wideKey', 'superWideKey'])]);

        expect(visibleKeys(state, ['wideKey'], ['superWideKey'])).toEqual({visibleWideRHPRouteKeys: [], visibleSuperWideRHPRouteKeys: ['superWideKey']});
    });

    it('keeps both displayed when the super-wide screen is stacked below the wide one, since the slice starts at the super-wide screen', () => {
        const state = buildRootState([reportsSplit, rhpWithChildren(['superWideKey', 'wideKey'])]);

        expect(visibleKeys(state, ['wideKey'], ['superWideKey'])).toEqual({visibleWideRHPRouteKeys: ['wideKey'], visibleSuperWideRHPRouteKeys: ['superWideKey']});
    });

    it('returns the keys in registration order rather than stack order', () => {
        const state = buildRootState([reportsSplit, rhpWithChildren(['superWideKey', 'firstWide', 'secondWide'])]);

        expect(visibleKeys(state, ['secondWide', 'firstWide'], ['superWideKey']).visibleWideRHPRouteKeys).toEqual(['secondWide', 'firstWide']);
    });

    it('holds a dismissing RHP at its width even while an older RHP sits covered below a fullscreen navigator', () => {
        // The top RHP has left the state but is still animating out, while the covered one below is still in the state.
        const state = buildRootState([reportsSplit, rhpWithChildren(['coveredKey']), searchFullscreen]);

        expect(visibleKeys(state, ['dismissingKey'], [])).toEqual({visibleWideRHPRouteKeys: ['dismissingKey'], visibleSuperWideRHPRouteKeys: []});
        expect(visibleKeys(state, ['coveredKey'], [])).toEqual({visibleWideRHPRouteKeys: [], visibleSuperWideRHPRouteKeys: []});
    });

    it('does not hold a screen the navigation state has never shown, which is a screen awaiting its stack rather than one dismissing', () => {
        // A newly pushed RHP registers its width before its own stack is populated, so its key is absent for a commit.
        const state = buildRootState([reportsSplit, {key: 'rhp-new', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR}]);

        expect(visibleKeys(state, ['unseenKey'], [], [])).toEqual({visibleWideRHPRouteKeys: [], visibleSuperWideRHPRouteKeys: []});
    });

    it('still holds a dismissing screen while another RHP is pushed whose stack has not been populated', () => {
        const state = buildRootState([reportsSplit, {key: 'rhp-new', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR}]);

        expect(visibleKeys(state, ['dismissingKey'], [], ['dismissingKey'])).toEqual({visibleWideRHPRouteKeys: ['dismissingKey'], visibleSuperWideRHPRouteKeys: []});
    });

    it('reports the registered keys the state currently holds, which is what the caller records as seen', () => {
        const state = buildRootState([reportsSplit, rhpWithChildren(['wideKey'])]);

        expect(getVisibleRHPKeys(state, ['wideKey', 'goneKey'], [], new Set()).presentRouteKeys).toEqual(['wideKey']);
    });
});
