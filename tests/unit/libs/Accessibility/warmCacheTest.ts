type AppStateChangeListener = (status: string) => void;
type AccessibilityModule = {
    default: {
        isScreenReaderEnabledSync: () => boolean;
        isScreenReaderKnownOff: () => boolean;
    };
};

const appStateListeners: AppStateChangeListener[] = [];

let mockScreenReaderValue = false;
let mockReduceMotionValue = false;
let mockReduceMotionFetchCount = 0;

jest.mock('@libs/Log');
jest.mock('@libs/Accessibility/isScreenReaderEnabled', () => ({
    __esModule: true,
    default: () => Promise.resolve(mockScreenReaderValue),
}));

jest.mock('react-native', () => ({
    __esModule: true,
    AccessibilityInfo: {
        addEventListener: jest.fn(() => ({remove: jest.fn()})),
        isReduceMotionEnabled: jest.fn(() => {
            mockReduceMotionFetchCount += 1;
            return Promise.resolve(mockReduceMotionValue);
        }),
    },
    AppState: {
        addEventListener: jest.fn((event: string, listener: AppStateChangeListener) => {
            if (event === 'change') {
                appStateListeners.push(listener);
            }
            return {remove: jest.fn()};
        }),
        currentState: 'active',
    },
}));

beforeEach(() => {
    jest.resetModules();
    appStateListeners.length = 0;
    mockScreenReaderValue = false;
    mockReduceMotionValue = false;
    mockReduceMotionFetchCount = 0;
});

function loadModule(): AccessibilityModule {
    return require<AccessibilityModule>('@libs/Accessibility');
}

function emitAppState(status: string): void {
    for (const cb of appStateListeners) {
        cb(status);
    }
}

async function flushPromises(): Promise<void> {
    await new Promise<void>((resolve) => {
        setImmediate(resolve);
    });
}

describe('Accessibility warm cache — AppState refresh', () => {
    it('re-fetches the screen-reader value on background→active transition', async () => {
        mockScreenReaderValue = false;
        const Accessibility = loadModule();
        await flushPromises();
        expect(Accessibility.default.isScreenReaderEnabledSync()).toBe(false);

        // OS toggle happens while the app is backgrounded — no `screenReaderChanged` event reaches us.
        mockScreenReaderValue = true;
        emitAppState('background');
        emitAppState('active');
        await flushPromises();

        expect(Accessibility.default.isScreenReaderEnabledSync()).toBe(true);
    });

    it('does NOT re-fetch on inactive→active without a background hop', async () => {
        mockScreenReaderValue = false;
        const Accessibility = loadModule();
        await flushPromises();
        const initialReduceMotionFetches = mockReduceMotionFetchCount;

        // A foreground touch or control-center pull-down fires inactive→active without a background.
        mockScreenReaderValue = true;
        emitAppState('active');
        await flushPromises();

        expect(Accessibility.default.isScreenReaderEnabledSync()).toBe(false);
        expect(mockReduceMotionFetchCount).toBe(initialReduceMotionFetches);
    });

    it('isScreenReaderKnownOff returns false before warm resolves and true only after a false-resolution', async () => {
        mockScreenReaderValue = false;
        const Accessibility = loadModule();
        // Synchronously after module load the warm promise has not resolved — unknown state must not report known-off.
        expect(Accessibility.default.isScreenReaderKnownOff()).toBe(false);
        await flushPromises();
        // Warm resolved with false — now known-off.
        expect(Accessibility.default.isScreenReaderKnownOff()).toBe(true);
    });

    it('isScreenReaderKnownOff returns false after warm resolves with SR enabled', async () => {
        mockScreenReaderValue = true;
        const Accessibility = loadModule();
        await flushPromises();
        expect(Accessibility.default.isScreenReaderKnownOff()).toBe(false);
    });

    it('isScreenReaderKnownOff returns false during a resume refresh (warmed flag invalidates until the new value resolves)', async () => {
        mockScreenReaderValue = false;
        const Accessibility = loadModule();
        await flushPromises();
        expect(Accessibility.default.isScreenReaderKnownOff()).toBe(true);

        // Background → active begins the async refresh; user enabled SR while backgrounded but the bridge hasn't replied yet.
        mockScreenReaderValue = true;
        emitAppState('background');
        emitAppState('active');
        // Synchronously after the AppState callback fires, warmed must already be invalidated.
        expect(Accessibility.default.isScreenReaderKnownOff()).toBe(false);

        await flushPromises();
        // Refresh resolved with true — still not known-off.
        expect(Accessibility.default.isScreenReaderKnownOff()).toBe(false);
    });

    it('re-fetches the reduce-motion value on background→active transition', async () => {
        mockReduceMotionValue = false;
        loadModule();
        await flushPromises();
        const initialFetches = mockReduceMotionFetchCount;

        mockReduceMotionValue = true;
        emitAppState('background');
        emitAppState('active');
        await flushPromises();

        expect(mockReduceMotionFetchCount).toBeGreaterThan(initialFetches);
    });
});
