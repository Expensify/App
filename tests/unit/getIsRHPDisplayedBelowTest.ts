import getIsRHPDisplayedBelow from '@components/WideRHPContextProvider/getIsRHPDisplayedBelow';

describe('getIsRHPDisplayedBelow', () => {
    it('reports a width as below when it is displayed but not by the focused route', () => {
        // Given a wide and a super-wide screen on display, with focus on a screen stacked above them
        // When the overlays ask what sits below the focused screen
        // Then both widths count as below it
        expect(getIsRHPDisplayedBelow('focused', ['superWide'], ['wide'])).toEqual({isWideRHPBelow: true, isSuperWideRHPBelow: true});
    });

    it('does not report a width as below when the focused route is the one displaying it', () => {
        // Given the wide screen on display is the one with focus
        // When the overlays ask what sits below the focused screen
        // Then nothing is below, since a screen does not sit below itself
        expect(getIsRHPDisplayedBelow('wide', [], ['wide'])).toEqual({isWideRHPBelow: false, isSuperWideRHPBelow: false});
    });

    it('reports nothing below when no route is focused or nothing is displayed', () => {
        // Given either no focused route, or a focused route with no wide screen on display
        // When the overlays ask what sits below the focused screen
        // Then nothing counts as below in either case
        expect(getIsRHPDisplayedBelow(undefined, ['superWide'], ['wide'])).toEqual({isWideRHPBelow: false, isSuperWideRHPBelow: false});
        expect(getIsRHPDisplayedBelow('focused', [], [])).toEqual({isWideRHPBelow: false, isSuperWideRHPBelow: false});
    });
});
