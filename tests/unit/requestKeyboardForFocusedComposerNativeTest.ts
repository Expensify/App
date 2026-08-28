/**
 * `requestKeyboardForFocusedComposer` defers `KeyboardController.setFocusTo('current')` to `requestIdleCallback`.
 * The `isFocused()` guard in `focusComposerWithDelay` runs when the callback is *scheduled*, not when it *runs*, so
 * a screen that dismisses in between (e.g. swiping back off the description step and quickly tapping another field)
 * leaves the input detached and the deferred native call crashes on iOS (`reloadInputViews` against a stale
 * responder). These tests pin the re-check added inside the idle callback: the native call fires only when the
 * input is still focused at idle time, and no-ops on the stale/detached path.
 */

const mockSetFocusTo = jest.fn();
jest.mock('react-native-keyboard-controller', () => ({
    KeyboardController: {
        setFocusTo: (...args: unknown[]) => {
            mockSetFocusTo(...args);
        },
    },
}));

const mockSetTextInputSelection = jest.fn();
jest.mock('@libs/focusComposerWithDelay/setTextInputSelection', () => ({
    __esModule: true,
    default: (...args: unknown[]) => {
        mockSetTextInputSelection(...args);
    },
}));

// Capture the idle callback instead of running it, so each test can drive the timing (still-focused vs. detached).
let capturedIdleCallback: (() => void) | null = null;
const originalRequestIdleCallback = global.requestIdleCallback;

const requestKeyboardForFocusedComposer = require<{default: (textInput: unknown, forcedSelectionRange?: {start: number; end: number}) => void}>(
    '../../src/libs/focusComposerWithDelay/requestKeyboardForFocusedComposer/index.native',
).default;

beforeEach(() => {
    capturedIdleCallback = null;
    mockSetFocusTo.mockClear();
    mockSetTextInputSelection.mockClear();
    global.requestIdleCallback = jest.fn<number, [IdleRequestCallback, IdleRequestOptions?]>((callback) => {
        capturedIdleCallback = () => callback({didTimeout: false, timeRemaining: () => 50});
        return 1;
    });
});

afterEach(() => {
    global.requestIdleCallback = originalRequestIdleCallback;
});

describe('requestKeyboardForFocusedComposer (native)', () => {
    it('defers the native focus to idle and does not call setFocusTo synchronously', () => {
        const textInput = {isFocused: () => true};
        requestKeyboardForFocusedComposer(textInput);
        expect(global.requestIdleCallback).toHaveBeenCalledTimes(1);
        expect(mockSetFocusTo).not.toHaveBeenCalled();
    });

    it('re-requests the keyboard when the input is still focused once the thread idles', () => {
        const textInput = {isFocused: () => true};
        requestKeyboardForFocusedComposer(textInput);
        capturedIdleCallback?.();
        expect(mockSetFocusTo).toHaveBeenCalledWith('current');
    });

    it('does NOT touch the native keyboard when the input lost focus before the thread idled (the iOS crash path)', () => {
        let focused = true;
        const textInput = {isFocused: () => focused};
        requestKeyboardForFocusedComposer(textInput);
        // The screen dismissed / input detached after scheduling but before idle: focus is lost.
        focused = false;
        capturedIdleCallback?.();
        expect(mockSetFocusTo).not.toHaveBeenCalled();
    });

    it('does NOT touch the native keyboard when the input has no isFocused method', () => {
        const textInput = {};
        requestKeyboardForFocusedComposer(textInput);
        capturedIdleCallback?.();
        expect(mockSetFocusTo).not.toHaveBeenCalled();
    });

    it('applies the forced selection range only after the focus re-check passes', () => {
        const textInput = {isFocused: () => true};
        requestKeyboardForFocusedComposer(textInput, {start: 2, end: 5});
        capturedIdleCallback?.();
        expect(mockSetFocusTo).toHaveBeenCalledWith('current');
        expect(mockSetTextInputSelection).toHaveBeenCalledWith(textInput, {start: 2, end: 5});
    });
});
