import type * as KeyboardModule from '@src/utils/keyboard/index.web';

const mockDismissKeyboard = jest.fn();

jest.mock('react-native', () => ({
    Keyboard: {dismiss: mockDismissKeyboard},
    PixelRatio: {getFontScale: () => 1},
}));

jest.mock('@libs/Navigation/TransitionTracker', () => ({
    startTransition: jest.fn(),
    endTransition: jest.fn(),
    runAfterTransitions: jest.fn(),
}));

jest.mock('@libs/Browser', () => ({
    isMobile: () => true,
    isMobileSafari: () => true,
}));

const SCREEN = {width: 390, height: 844};
const PORTRAIT_HEIGHT = 660;
const PORTRAIT_KEYBOARD_HEIGHT = 340;
const LANDSCAPE_HEIGHT = 340;
const LANDSCAPE_KEYBOARD_HEIGHT = 200;

const resizeListeners = new Set<() => void>();
const visualViewport = {
    height: PORTRAIT_HEIGHT,
    addEventListener: (event: string, listener: () => void) => resizeListeners.add(listener),
    removeEventListener: (event: string, listener: () => void) => resizeListeners.delete(listener),
};

function resizeViewport(width: number, height: number) {
    window.innerWidth = width;
    visualViewport.height = height;
    for (const listener of [...resizeListeners]) {
        listener();
    }
}

describe('Keyboard utils: web', () => {
    let utils: typeof KeyboardModule.default;
    let visibilityChanges: boolean[];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        resizeListeners.clear();
        Object.defineProperty(window, 'visualViewport', {value: visualViewport, configurable: true});
        Object.defineProperty(window, 'screen', {value: SCREEN, configurable: true});
        window.innerWidth = SCREEN.width;
        visualViewport.height = PORTRAIT_HEIGHT;

        utils = jest.requireActual<typeof KeyboardModule>('@src/utils/keyboard/index.web').default;
        visibilityChanges = [];
        utils.subscribeKeyboardVisibilityChange((isVisible) => visibilityChanges.push(isVisible));
    });

    it('reports the keyboard when it opens and closes in the loaded orientation', () => {
        // Given the app loaded in portrait without the keyboard
        // When the keyboard opens and then closes
        resizeViewport(SCREEN.width, PORTRAIT_HEIGHT - PORTRAIT_KEYBOARD_HEIGHT);
        resizeViewport(SCREEN.width, PORTRAIT_HEIGHT);

        // Then both changes are reported against the height the app loaded with
        expect(visibilityChanges).toEqual([true, false]);
    });

    it('keeps the keyboard visible when rotating with it open into an orientation not seen yet', () => {
        // Given the keyboard is open in portrait
        resizeViewport(SCREEN.width, PORTRAIT_HEIGHT - PORTRAIT_KEYBOARD_HEIGHT);

        // When the device rotates to landscape, which fires more than one resize while the keyboard is still open
        resizeViewport(SCREEN.height, LANDSCAPE_HEIGHT - LANDSCAPE_KEYBOARD_HEIGHT);
        resizeViewport(SCREEN.height, LANDSCAPE_HEIGHT - LANDSCAPE_KEYBOARD_HEIGHT);

        // Then the keyboard-reduced landscape height isn't taken as the height without the keyboard
        expect(visibilityChanges).toEqual([true, true, true]);
    });

    it('dismisses the keyboard after rotating with it open into an orientation not seen yet', async () => {
        // Given the keyboard was open in portrait and the device rotated to landscape
        resizeViewport(SCREEN.width, PORTRAIT_HEIGHT - PORTRAIT_KEYBOARD_HEIGHT);
        resizeViewport(SCREEN.height, LANDSCAPE_HEIGHT - LANDSCAPE_KEYBOARD_HEIGHT);

        // When the keyboard is dismissed and the viewport grows by the landscape keyboard height
        const dismissPromise = utils.dismiss();
        resizeViewport(SCREEN.height, LANDSCAPE_HEIGHT);

        // Then the keyboard is actually dismissed and the closed keyboard is reported
        await expect(dismissPromise).resolves.toBeUndefined();
        expect(mockDismissKeyboard).toHaveBeenCalledTimes(1);
        expect(visibilityChanges).toEqual([true, true, false]);
    });

    it('detects the keyboard after rotating with it open when it was closed during the rotation', () => {
        // Given the keyboard was open in portrait but closed while rotating, so the first landscape height has no keyboard
        resizeViewport(SCREEN.width, PORTRAIT_HEIGHT - PORTRAIT_KEYBOARD_HEIGHT);
        resizeViewport(SCREEN.height, LANDSCAPE_HEIGHT);

        // When the keyboard opens and then closes in landscape
        resizeViewport(SCREEN.height, LANDSCAPE_HEIGHT - LANDSCAPE_KEYBOARD_HEIGHT);
        resizeViewport(SCREEN.height, LANDSCAPE_HEIGHT);

        // Then the first landscape height becomes the height without the keyboard once the keyboard opens below it
        expect(visibilityChanges).toEqual([true, true, true, false]);
    });

    it('does not report the keyboard for a viewport change smaller than a smart banner', () => {
        // Given the app loaded in portrait without the keyboard
        // When the viewport shrinks by less than a smart banner
        resizeViewport(SCREEN.width, PORTRAIT_HEIGHT - 100);

        // Then the keyboard isn't reported as visible
        expect(visibilityChanges).toEqual([false]);
    });
});
