import getIsRHPDisplayedBelow from '@components/WideRHPContextProvider/getIsRHPDisplayedBelow';

describe('getIsRHPDisplayedBelow', () => {
    it('reports a width as below when it is displayed but not by the focused route', () => {
        expect(getIsRHPDisplayedBelow('focused', ['superWide'], ['wide'])).toEqual({isWideRHPBelow: true, isSuperWideRHPBelow: true});
    });

    it('does not report a width as below when the focused route is the one displaying it', () => {
        expect(getIsRHPDisplayedBelow('wide', [], ['wide'])).toEqual({isWideRHPBelow: false, isSuperWideRHPBelow: false});
    });

    it('reports nothing below when no route is focused or nothing is displayed', () => {
        expect(getIsRHPDisplayedBelow(undefined, ['superWide'], ['wide'])).toEqual({isWideRHPBelow: false, isSuperWideRHPBelow: false});
        expect(getIsRHPDisplayedBelow('focused', [], [])).toEqual({isWideRHPBelow: false, isSuperWideRHPBelow: false});
    });
});
