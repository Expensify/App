import {getAvailableHeight} from '@components/Search/SearchRouter/SearchRouterPage/index.native';

describe('SearchRouterPage', () => {
    it('does not constrain the height when the keyboard is not overlapping', () => {
        expect(
            getAvailableHeight({
                isKeyboardOverlapping: false,
                keyboardHeight: 300,
                keyboardActiveHeight: 300,
                bottomInset: 0,
                windowHeight: 800,
                paddingTop: 20,
            }),
        ).toBeUndefined();
    });

    it('uses the settled keyboard height', () => {
        expect(
            getAvailableHeight({
                isKeyboardOverlapping: true,
                keyboardHeight: 300,
                keyboardActiveHeight: 350,
                bottomInset: 0,
                windowHeight: 800,
                paddingTop: 20,
            }),
        ).toBe(480);
    });

    it('falls back to the active keyboard height during animation', () => {
        expect(
            getAvailableHeight({
                isKeyboardOverlapping: true,
                keyboardHeight: 0,
                keyboardActiveHeight: 300,
                bottomInset: 0,
                windowHeight: 800,
                paddingTop: 20,
            }),
        ).toBe(480);
    });

    it('clamps transient negative heights to zero', () => {
        expect(
            getAvailableHeight({
                isKeyboardOverlapping: true,
                keyboardHeight: 500,
                keyboardActiveHeight: 500,
                bottomInset: 0,
                windowHeight: 400,
                paddingTop: 20,
            }),
        ).toBe(0);
    });
});
