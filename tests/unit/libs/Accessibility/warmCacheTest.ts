type AppStateChangeListener = (status: string) => void;
type ScreenReaderState = 'enabled' | 'disabled' | 'unknown';
type AccessibilityModule = {
    default: {
        isScreenReaderEnabledSync: () => boolean;
        getScreenReaderState: () => ScreenReaderState;
    };
};

const appStateListeners: AppStateChangeListener[] = [];

let mockScreenReaderValue = false;
let mockReduceMotionValue = false;
let mockReduceMotionFetchCount = 0;
let mockScreenReaderDeferred = false;
let mockInitialAppState: 'active' | 'background' | 'inactive' = 'active';
const mockScreenReaderResolvers: Array<(value: boolean) => void> = [];

jest.mock('@libs/Log');
jest.mock('@libs/Accessibility/isScreenReaderEnabled', () => ({
    __esModule: true,
    default: () => {
        if (mockScreenReaderDeferred) {
            return new Promise<boolean>((resolve) => {
                mockScreenReaderResolvers.push(resolve);
            });
        }
        return Promise.resolve(mockScreenReaderValue);
    },
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
        get currentState() {
            return mockInitialAppState;
        },
    },
}));

beforeEach(() => {
    jest.resetModules();
    appStateListeners.length = 0;
    mockScreenReaderValue = false;
    mockReduceMotionValue = false;
    mockReduceMotionFetchCount = 0;
    mockScreenReaderDeferred = false;
    mockInitialAppState = 'active';
    mockScreenReaderResolvers.length = 0;
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

        mockScreenReaderValue = true;
        emitAppState('background');
        emitAppState('active');
        await flushPromises();

        expect(Accessibility.default.isScreenReaderEnabledSync()).toBe(true);
    });

    it('cold-start with AppState.currentState=background still refreshes on first active event', async () => {
        mockInitialAppState = 'background';
        mockScreenReaderValue = false;
        const Accessibility = loadModule();
        await flushPromises();

        mockScreenReaderValue = true;
        emitAppState('active');
        await flushPromises();

        expect(Accessibility.default.isScreenReaderEnabledSync()).toBe(true);
    });

    it('re-fetches on iOS-style background→inactive→active resume sequence', async () => {
        mockScreenReaderValue = false;
        const Accessibility = loadModule();
        await flushPromises();
        expect(Accessibility.default.isScreenReaderEnabledSync()).toBe(false);

        mockScreenReaderValue = true;
        emitAppState('background');
        emitAppState('inactive');
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

    it("getScreenReaderState returns 'unknown' before warm resolves and 'disabled' only after a false-resolution", async () => {
        mockScreenReaderValue = false;
        const Accessibility = loadModule();
        expect(Accessibility.default.getScreenReaderState()).toBe('unknown');
        await flushPromises();
        expect(Accessibility.default.getScreenReaderState()).toBe('disabled');
    });

    it("getScreenReaderState returns 'enabled' after warm resolves with SR enabled", async () => {
        mockScreenReaderValue = true;
        const Accessibility = loadModule();
        await flushPromises();
        expect(Accessibility.default.getScreenReaderState()).toBe('enabled');
    });

    it('discards a superseded in-flight warm fetch on out-of-order resolution (newer value wins)', async () => {
        mockScreenReaderDeferred = true;
        const Accessibility = loadModule();
        expect(mockScreenReaderResolvers).toHaveLength(1);

        emitAppState('background');
        emitAppState('active');
        expect(mockScreenReaderResolvers).toHaveLength(2);

        // Refresh (#2) resolves first with SR enabled.
        mockScreenReaderResolvers[1](true);
        await flushPromises();
        expect(Accessibility.default.isScreenReaderEnabledSync()).toBe(true);
        expect(Accessibility.default.getScreenReaderState()).toBe('enabled');

        // The superseded initial fetch (#1) resolves later with the obsolete value — must NOT overwrite the refresh result.
        mockScreenReaderResolvers[0](false);
        await flushPromises();
        expect(Accessibility.default.isScreenReaderEnabledSync()).toBe(true);
        expect(Accessibility.default.getScreenReaderState()).toBe('enabled');
    });

    it("getScreenReaderState returns 'unknown' during a resume refresh (warmed flag invalidates until the new value resolves)", async () => {
        mockScreenReaderValue = false;
        const Accessibility = loadModule();
        await flushPromises();
        expect(Accessibility.default.getScreenReaderState()).toBe('disabled');

        mockScreenReaderValue = true;
        emitAppState('background');
        emitAppState('active');
        expect(Accessibility.default.getScreenReaderState()).toBe('unknown');

        await flushPromises();
        expect(Accessibility.default.getScreenReaderState()).toBe('enabled');
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
