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

/** `seen` defaults to every registered key, seen in the harness's own RHP. */
function seenIn(keys: string[], rhpRouteKey = 'rhp-1') {
    return new Map(keys.map((key) => [key, rhpRouteKey]));
}

/** What the frame must still be wide enough for. */
function visibleKeys(state: NavigationState | undefined, wide: string[], superWide: string[], seen: string[] = [...wide, ...superWide]) {
    const {widthWideRHPRouteKeys, widthSuperWideRHPRouteKeys} = getVisibleRHPKeys(state, wide, superWide, seenIn(seen));
    return {visibleWideRHPRouteKeys: widthWideRHPRouteKeys, visibleSuperWideRHPRouteKeys: widthSuperWideRHPRouteKeys};
}

/** What the navigation state still holds, for below-ness and Escape. */
function displayedKeys(state: NavigationState | undefined, wide: string[], superWide: string[], seen: string[] = [...wide, ...superWide]) {
    const {displayedWideRHPRouteKeys, displayedSuperWideRHPRouteKeys} = getVisibleRHPKeys(state, wide, superWide, seenIn(seen));
    return {visibleWideRHPRouteKeys: displayedWideRHPRouteKeys, visibleSuperWideRHPRouteKeys: displayedSuperWideRHPRouteKeys};
}

describe('getVisibleRHPKeys', () => {
    it('returns nothing once a fullscreen navigator covers the RHP, which is what makes clearing the keys by hand unnecessary', () => {
        // Given a wide RHP covered by a fullscreen navigator opened on top of it
        const state = buildRootState([reportsSplit, rhpWithChildren(['wideKey']), searchFullscreen]);

        // When the frame asks what it has to be wide enough for
        // Then nothing counts while the RHP is covered
        expect(visibleKeys(state, ['wideKey'], [])).toEqual({visibleWideRHPRouteKeys: [], visibleSuperWideRHPRouteKeys: []});
    });

    it('returns nothing when no RHP is open, and when navigation has not initialized', () => {
        // Given either no RHP open, or navigation not initialized yet
        // When the frame asks what it has to be wide enough for
        // Then nothing counts in either case
        expect(visibleKeys(buildRootState([reportsSplit]), [], [])).toEqual({visibleWideRHPRouteKeys: [], visibleSuperWideRHPRouteKeys: []});
        expect(visibleKeys(undefined, ['wideKey'], [])).toEqual({visibleWideRHPRouteKeys: [], visibleSuperWideRHPRouteKeys: []});
    });

    it('holds a dismissing RHP at its width, since the route leaves the state while the card is still animating out', () => {
        // Given the whole RHP gone from the state, its screens still mounted and registered while they animate out
        // When the frame asks what it has to be wide enough for
        // Then it holds both widths until the screens unmount
        expect(visibleKeys(buildRootState([reportsSplit]), ['wideKey'], ['superWideKey'])).toEqual({
            visibleWideRHPRouteKeys: ['wideKey'],
            visibleSuperWideRHPRouteKeys: ['superWideKey'],
        });
    });

    it('holds a single dismissing screen at its width while the RHP below it stays open', () => {
        // Given a wide screen popped off an RHP that stays open, gone from the stack a frame before it unmounts
        const state = buildRootState([reportsSplit, rhpWithChildren(['remaining'])]);

        // When the frame asks what it has to be wide enough for
        // Then its width is held while it animates out, just as when the whole RHP closes
        expect(visibleKeys(state, ['dismissingWideKey'], [])).toEqual({visibleWideRHPRouteKeys: ['dismissingWideKey'], visibleSuperWideRHPRouteKeys: []});
    });

    it('displays a registered screen while the RHP is on top', () => {
        // Given a wide screen in the RHP on top, among screens that registered no width
        const state = buildRootState([reportsSplit, rhpWithChildren(['a', 'wideKey', 'c'])]);

        // When the frame asks what it has to be wide enough for
        // Then the wide screen counts
        expect(visibleKeys(state, ['wideKey'], [])).toEqual({visibleWideRHPRouteKeys: ['wideKey'], visibleSuperWideRHPRouteKeys: []});
    });

    it('stops displaying a width once a screen stacked above it registers a wider one', () => {
        // Given a super-wide screen stacked above a wide one in the RHP on top
        const state = buildRootState([reportsSplit, rhpWithChildren(['wideKey', 'superWideKey'])]);

        // When the frame asks what it has to be wide enough for
        // Then only the super-wide screen counts: it covers the wide one, which is still in the state and so is not held either
        expect(visibleKeys(state, ['wideKey'], ['superWideKey'])).toEqual({visibleWideRHPRouteKeys: [], visibleSuperWideRHPRouteKeys: ['superWideKey']});
    });

    it('keeps both displayed when the super-wide screen is stacked below the wide one, since the slice starts at the super-wide screen', () => {
        // Given a super-wide report with an expense opened on top of it
        const state = buildRootState([reportsSplit, rhpWithChildren(['superWideKey', 'wideKey'])]);

        // When the frame asks what it has to be wide enough for
        // Then both count, since the expense sits over the report rather than replacing it
        expect(visibleKeys(state, ['wideKey'], ['superWideKey'])).toEqual({visibleWideRHPRouteKeys: ['wideKey'], visibleSuperWideRHPRouteKeys: ['superWideKey']});
    });

    it('holds a dismissing RHP at its width even while an older RHP sits covered below a fullscreen navigator', () => {
        // Given the top RHP animating out after leaving the state, with an older RHP covered by a fullscreen navigator
        const state = buildRootState([reportsSplit, rhpWithChildren(['coveredKey']), searchFullscreen]);

        // When the frame asks what it has to be wide enough for
        // Then the leaving RHP's width is held, while the covered one counts for nothing
        expect(visibleKeys(state, ['dismissingKey'], [])).toEqual({visibleWideRHPRouteKeys: ['dismissingKey'], visibleSuperWideRHPRouteKeys: []});
        expect(visibleKeys(state, ['coveredKey'], [])).toEqual({visibleWideRHPRouteKeys: [], visibleSuperWideRHPRouteKeys: []});
    });

    it('does not hold a screen the navigation state has never shown, which is a screen awaiting its stack rather than one dismissing', () => {
        // Given a newly pushed RHP whose screen registered its width before the RHP's stack was populated
        const state = buildRootState([reportsSplit, {key: 'rhp-new', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR}]);

        // When the frame asks what it has to be wide enough for
        // Then that screen is not held, since one never seen in the state is arriving rather than leaving
        expect(visibleKeys(state, ['unseenKey'], [], [])).toEqual({visibleWideRHPRouteKeys: [], visibleSuperWideRHPRouteKeys: []});
    });

    it('stops holding a dismissing screen once a different RHP is the one on screen, so the new one does not open at the old width', () => {
        // Given a screen dismissing from one RHP while another RHP has taken over, its stack not yet populated
        const state = buildRootState([reportsSplit, {key: 'rhp-new', name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR}]);

        // When the frame asks what it has to be wide enough for
        // Then the leaving screen no longer counts: the frame belongs to the RHP that replaced it
        expect(visibleKeys(state, ['dismissingKey'], [], ['dismissingKey'])).toEqual({visibleWideRHPRouteKeys: [], visibleSuperWideRHPRouteKeys: []});
    });

    it('sizes the frame for a dismissing screen without reporting it as displayed, since it is on its way out rather than below anything', () => {
        // Given the whole RHP dismissing, its screens still mounted and animating out
        const state = buildRootState([reportsSplit]);

        // When geometry and below-ness each ask their own question
        // Then the frame still holds the width, while nothing counts the leaving screen as displayed
        expect(visibleKeys(state, ['wideKey'], [])).toEqual({visibleWideRHPRouteKeys: ['wideKey'], visibleSuperWideRHPRouteKeys: []});
        expect(displayedKeys(state, ['wideKey'], [])).toEqual({visibleWideRHPRouteKeys: [], visibleSuperWideRHPRouteKeys: []});
    });

    it('reports a screen the RHP is showing as both sizing the frame and displayed', () => {
        // Given a wide screen shown in the RHP on top
        const state = buildRootState([reportsSplit, rhpWithChildren(['wideKey'])]);

        // When geometry and below-ness each ask their own question
        // Then both count it, since unlike a leaving screen it is still in the state
        expect(visibleKeys(state, ['wideKey'], [])).toEqual({visibleWideRHPRouteKeys: ['wideKey'], visibleSuperWideRHPRouteKeys: []});
        expect(displayedKeys(state, ['wideKey'], [])).toEqual({visibleWideRHPRouteKeys: ['wideKey'], visibleSuperWideRHPRouteKeys: []});
    });

    it('reports the registered keys the state currently holds, which is what the caller records as seen', () => {
        // Given one registered screen in the RHP on top, and another registered screen that has left the state
        const state = buildRootState([reportsSplit, rhpWithChildren(['wideKey'])]);

        // When the caller asks which registered screens to record as seen
        // Then only the one in the state is recorded, paired with its RHP so a later hold ends when that RHP goes
        expect(getVisibleRHPKeys(state, ['wideKey', 'goneKey'], [], new Map()).presentRouteEntries).toEqual([['wideKey', 'rhp-1']]);
    });
});
