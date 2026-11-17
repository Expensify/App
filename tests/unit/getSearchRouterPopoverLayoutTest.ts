import getSearchRouterPopoverLayout from '@components/Search/SearchRouter/getSearchRouterPopoverLayout';

// The expected numbers below are derived from the design constants in `@styles/variables`:
// searchRouterPopoverTopOffset (100), searchRouterPopoverMinTopOffset (16) and searchRouterPopoverMaxHeight (520).
// They are spelled out rather than computed so a change to any of those constants surfaces here as a deliberate decision.
describe('getSearchRouterPopoverLayout', () => {
    it.each([
        [1000, 100, 520],
        [700, 90, 520],
        [500, 16, 468],
    ])('places the popover at %ipx viewport height with topOffset %ipx and maxHeight %ipx', (windowHeight, topOffset, maxHeight) => {
        expect(getSearchRouterPopoverLayout(windowHeight)).toEqual({topOffset, maxHeight});
    });

    // The two viewport heights where the formula switches branch, where off-by-one regressions land.
    it.each([
        [720, 100, 520],
        [552, 16, 520],
    ])('holds the popover at the %ipx breakpoint with topOffset %ipx and maxHeight %ipx', (windowHeight, topOffset, maxHeight) => {
        expect(getSearchRouterPopoverLayout(windowHeight)).toEqual({topOffset, maxHeight});
    });

    // Once the popover can no longer keep its full top offset it centres itself instead,
    // so the gap under the card matches the gap above it.
    it.each([300, 500, 552, 700, 720])('leaves an equal gap above and below at %ipx', (windowHeight) => {
        const {topOffset, maxHeight} = getSearchRouterPopoverLayout(windowHeight);

        expect(windowHeight - topOffset - maxHeight).toBe(topOffset);
    });
});
