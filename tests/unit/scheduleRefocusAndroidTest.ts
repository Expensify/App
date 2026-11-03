const mockFireFocusEvent = jest.fn();
jest.mock('@libs/Accessibility/fireFocusEvent', () => ({
    __esModule: true,
    default: (view: unknown): void => {
        mockFireFocusEvent(view);
    },
}));

const FAKE_IDLE_ID = 4242;
let capturedIdleCallback: (() => void) | null = null;
let capturedIdleOptions: {timeout?: number} | undefined;
const mockCancelIdleCallback = jest.fn<void, [number]>();

const originalRequestIdleCallback = global.requestIdleCallback;
const originalCancelIdleCallback = global.cancelIdleCallback;

const scheduleRefocus = require<{default: (ref: {current: unknown}) => {cancel: () => void}}>('../../src/libs/Accessibility/scheduleRefocus/index.android').default;

beforeEach(() => {
    capturedIdleCallback = null;
    capturedIdleOptions = undefined;
    mockFireFocusEvent.mockClear();
    mockCancelIdleCallback.mockClear();
    // Capture the idle callback instead of running it, so each test drives the re-fire deterministically.
    global.requestIdleCallback = jest.fn<number, [IdleRequestCallback, IdleRequestOptions?]>((callback, options) => {
        capturedIdleCallback = () => callback({didTimeout: false, timeRemaining: () => 50});
        capturedIdleOptions = options;
        return FAKE_IDLE_ID;
    });
    global.cancelIdleCallback = mockCancelIdleCallback;
});

afterEach(() => {
    global.requestIdleCallback = originalRequestIdleCallback;
    global.cancelIdleCallback = originalCancelIdleCallback;
});

describe('scheduleRefocus (android)', () => {
    it('schedules the re-fire on idle with the 300ms timeout cap and does not fire synchronously', () => {
        scheduleRefocus({current: {label: 'row'}});
        expect(global.requestIdleCallback).toHaveBeenCalledTimes(1);
        expect(capturedIdleOptions).toEqual({timeout: 300});
        expect(mockFireFocusEvent).not.toHaveBeenCalled();
    });

    it('re-fires focus on the still-mounted view when the thread idles (wins the TYPE_WINDOW_STATE_CHANGED race)', () => {
        const view = {label: 'row'};
        scheduleRefocus({current: view});
        capturedIdleCallback?.();
        expect(mockFireFocusEvent).toHaveBeenCalledTimes(1);
        expect(mockFireFocusEvent).toHaveBeenCalledWith(view);
    });

    it('does NOT re-fire when the view unmounted (ref nulled) before the thread idled', () => {
        const ref: {current: unknown} = {current: {label: 'row'}};
        scheduleRefocus(ref);
        ref.current = null;
        capturedIdleCallback?.();
        expect(mockFireFocusEvent).not.toHaveBeenCalled();
    });

    it('cancel() cancels the scheduled idle callback so a superseded restore does not re-fire', () => {
        const {cancel} = scheduleRefocus({current: {label: 'row'}});
        cancel();
        expect(mockCancelIdleCallback).toHaveBeenCalledTimes(1);
        expect(mockCancelIdleCallback).toHaveBeenCalledWith(FAKE_IDLE_ID);
    });
});
