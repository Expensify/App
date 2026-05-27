import {AccessibilityInfo} from 'react-native';

/* eslint-disable import/extensions */
type NavState = {
    type: string;
    key: string;
    index: number;
    routeNames: string[];
    routes: Array<{key: string; name: string; state?: unknown}>;
    stale: boolean;
    history: unknown[];
};

const mockFireFocusEvent = jest.fn();
const mockSendAccessibilityEvent = jest.fn();
let mockScreenReaderEnabled = true;

jest.mock('../../src/libs/Accessibility', () => ({
    __esModule: true,
    default: {
        moveAccessibilityFocus: jest.fn(),
        isScreenReaderEnabledSync: () => mockScreenReaderEnabled,
        useScreenReaderStatus: () => mockScreenReaderEnabled,
        useReducedMotion: () => false,
    },
}));

jest.mock('../../src/libs/Accessibility/fireFocusEvent', () => ({
    __esModule: true,
    default: (view: unknown): void => {
        mockFireFocusEvent(view);
    },
}));

AccessibilityInfo.sendAccessibilityEvent = mockSendAccessibilityEvent;

// jsdom resolves the web stub (returns null). Treat fake views as attached unless they carry `detached: true`.
jest.mock('@src/utils/findNodeHandle', () => ({
    __esModule: true,
    default: (view: unknown): number | null => {
        if (view == null) {
            return null;
        }
        if (typeof view === 'object' && (view as {detached?: boolean}).detached) {
            return null;
        }
        return 1;
    },
}));

type TtEntry = {cb: () => void; cancelled: boolean};
let mockTtQueue: TtEntry[] = [];
jest.mock('../../src/libs/Navigation/TransitionTracker', () => ({
    __esModule: true,
    default: {
        startTransition: jest.fn(),
        endTransition: jest.fn(),
        runAfterTransitions: ({callback}: {callback: () => void}) => {
            const entry: TtEntry = {cb: callback, cancelled: false};
            mockTtQueue.push(entry);
            return {
                cancel: () => {
                    entry.cancelled = true;
                },
            };
        },
    },
}));

let mockNavigationRefState: NavState | undefined;
let mockStateListeners: Array<() => void> = [];

jest.mock('../../src/libs/Navigation/navigationRef.ts', () => ({
    __esModule: true,
    default: {
        get current() {
            return mockNavigationRefState ? {} : null;
        },
        isReady: () => mockNavigationRefState !== undefined,
        getRootState: () => mockNavigationRefState,
        addListener: (event: string, cb: () => void) => {
            if (event !== 'state') {
                return () => {};
            }
            mockStateListeners.push(cb);
            return () => {
                mockStateListeners = mockStateListeners.filter((l) => l !== cb);
            };
        },
    },
}));

const {
    setupNavigationFocusReturn,
    teardownNavigationFocusReturn,
    handleStateChange,
    notifyPressedTrigger,
    notifyPushParamsForward,
    notifyPushParamsBackward,
    cancelPendingFocusRestore,
    skipNextFocusRestore,
    isFocusRestoreInProgress,
    shouldSkipAutoFocusDueToExistingFocus,
    resetForTests,
    setLastPressedTriggerForTests,
    getTriggerMapSizeForTests,
} = require<{
    setupNavigationFocusReturn: () => void;
    teardownNavigationFocusReturn: () => void;
    handleStateChange: (state: unknown) => void;
    notifyPressedTrigger: (node: unknown) => void;
    notifyPushParamsForward: (routeKey: string, prevParams: unknown) => void;
    notifyPushParamsBackward: (routeKey: string, targetParams: unknown) => void;
    cancelPendingFocusRestore: () => void;
    skipNextFocusRestore: () => void;
    isFocusRestoreInProgress: () => boolean;
    shouldSkipAutoFocusDueToExistingFocus: () => boolean;
    resetForTests: () => void;
    setLastPressedTriggerForTests: (node: unknown) => void;
    getTriggerMapSizeForTests: () => number;
}>('../../src/libs/NavigationFocusReturn.native.ts');
/* eslint-enable import/extensions */

function stackState(focused: number, routes: Array<{key: string; name: string; state?: unknown}>): NavState {
    return {
        type: 'stack',
        key: `nav-${routes.map((r) => r.key).join('-')}`,
        index: focused,
        routeNames: routes.map((r) => r.name),
        routes,
        stale: false,
        history: [],
    };
}

function flushTransitions(): void {
    const buffered = mockTtQueue;
    mockTtQueue = [];
    for (const entry of buffered) {
        if (!entry.cancelled) {
            entry.cb();
        }
    }
}

function fakeView(label = 'view'): {label: string} {
    return {label};
}

beforeEach(() => {
    jest.useFakeTimers();
    mockSendAccessibilityEvent.mockClear();
    mockFireFocusEvent.mockClear();
    mockScreenReaderEnabled = true;
    mockStateListeners = [];
    mockNavigationRefState = undefined;
    mockTtQueue = [];
    resetForTests();
});

afterEach(() => {
    jest.useRealTimers();
});

describe('notifyPressedTrigger', () => {
    it('is a no-op when the screen reader is off — non-AT users pay zero capture cost', () => {
        mockScreenReaderEnabled = false;
        notifyPressedTrigger(fakeView('button'));
        const prev = stackState(0, [{key: 'a', name: 'A'}]);
        const next = stackState(1, [
            {key: 'a', name: 'A'},
            {key: 'b', name: 'B'},
        ]);
        handleStateChange(prev);
        handleStateChange(next);
        expect(getTriggerMapSizeForTests()).toBe(0);
    });

    it('stores the most recently pressed view when the screen reader is on', () => {
        const view = fakeView('button-1');
        notifyPressedTrigger(view);
        const prev = stackState(0, [{key: 'a', name: 'A'}]);
        const next = stackState(1, [
            {key: 'a', name: 'A'},
            {key: 'b', name: 'B'},
        ]);
        handleStateChange(prev);
        handleStateChange(next);
        expect(getTriggerMapSizeForTests()).toBe(1);
    });

    it('overwrites the staged trigger on each press so the freshest tap wins', () => {
        notifyPressedTrigger(fakeView('button-1'));
        notifyPressedTrigger(fakeView('button-2'));
        const prev = stackState(0, [{key: 'a', name: 'A'}]);
        const next = stackState(1, [
            {key: 'a', name: 'A'},
            {key: 'b', name: 'B'},
        ]);
        handleStateChange(prev);
        handleStateChange(next);
        expect(getTriggerMapSizeForTests()).toBe(1);
    });

    it('drops a stale press so a much-later forward nav (deeplink, timer) does not capture an unrelated trigger', () => {
        const before = Date.now();
        jest.setSystemTime(before);
        notifyPressedTrigger(fakeView('non-nav-toggle'));
        jest.setSystemTime(before + 4_000);
        const prev = stackState(0, [{key: 'a', name: 'A'}]);
        const next = stackState(1, [
            {key: 'a', name: 'A'},
            {key: 'b', name: 'B'},
        ]);
        handleStateChange(prev);
        handleStateChange(next);
        expect(getTriggerMapSizeForTests()).toBe(0);
    });
});

describe('handleStateChange — forward', () => {
    it('captures the staged trigger against the outgoing route key', () => {
        const view = fakeView('display-name');
        setLastPressedTriggerForTests(view);
        const prev = stackState(0, [{key: 'profile', name: 'Profile'}]);
        const next = stackState(1, [
            {key: 'profile', name: 'Profile'},
            {key: 'display-name-page', name: 'DisplayName'},
        ]);
        handleStateChange(prev);
        handleStateChange(next);
        expect(getTriggerMapSizeForTests()).toBe(1);
    });

    it('skips capture entirely when no trigger was staged', () => {
        const prev = stackState(0, [{key: 'profile', name: 'Profile'}]);
        const next = stackState(1, [
            {key: 'profile', name: 'Profile'},
            {key: 'display-name-page', name: 'DisplayName'},
        ]);
        handleStateChange(prev);
        handleStateChange(next);
        expect(getTriggerMapSizeForTests()).toBe(0);
    });
});

describe('handleStateChange — backward', () => {
    it('restores accessibility focus to the captured view after transitions flush', () => {
        const view = fakeView('display-name');
        setLastPressedTriggerForTests(view);
        const prev = stackState(0, [{key: 'profile', name: 'Profile'}]);
        const forward = stackState(1, [
            {key: 'profile', name: 'Profile'},
            {key: 'display-name-page', name: 'DisplayName'},
        ]);
        const back = stackState(0, [{key: 'profile', name: 'Profile'}]);

        handleStateChange(prev);
        handleStateChange(forward);
        handleStateChange(back);
        flushTransitions();

        // Web/iOS scheduleRefocus resolves to a no-op under jsdom, so we expect exactly one fire here.
        // The Android race-mitigation re-fire lives in scheduleRefocus/index.android.ts.
        expect(mockFireFocusEvent).toHaveBeenCalledTimes(1);
        expect(mockFireFocusEvent).toHaveBeenCalledWith(view);
    });

    it('does NOT restore when skipNextFocusRestore was called before goBack (form-submit path)', () => {
        const view = fakeView('display-name');
        setLastPressedTriggerForTests(view);
        const prev = stackState(0, [{key: 'profile', name: 'Profile'}]);
        const forward = stackState(1, [
            {key: 'profile', name: 'Profile'},
            {key: 'display-name-page', name: 'DisplayName'},
        ]);
        const back = stackState(0, [{key: 'profile', name: 'Profile'}]);

        handleStateChange(prev);
        handleStateChange(forward);
        skipNextFocusRestore();
        handleStateChange(back);
        flushTransitions();

        expect(mockFireFocusEvent).not.toHaveBeenCalled();
    });

    it('clears the trigger entry when skipNextFocusRestore suppresses the restore, so a later back to the same route cannot inherit the skipped trigger', () => {
        const skippedTrigger = fakeView('display-name');
        setLastPressedTriggerForTests(skippedTrigger);
        const profile = stackState(0, [{key: 'profile', name: 'Profile'}]);
        const intoDisplayName = stackState(1, [
            {key: 'profile', name: 'Profile'},
            {key: 'display-name-page', name: 'DisplayName'},
        ]);
        const backToProfile = stackState(0, [{key: 'profile', name: 'Profile'}]);

        handleStateChange(profile);
        handleStateChange(intoDisplayName);
        expect(getTriggerMapSizeForTests()).toBe(1);

        // Form-submit goBack: skipNextFocusRestore + backward → entry must be cleared, not left dangling.
        skipNextFocusRestore();
        handleStateChange(backToProfile);
        flushTransitions();
        expect(mockFireFocusEvent).not.toHaveBeenCalled();
        expect(getTriggerMapSizeForTests()).toBe(0);

        // Simulate a later deeplink-style forward (no fresh staged trigger) + back to "profile".
        const intoNewScreen = stackState(1, [
            {key: 'profile', name: 'Profile'},
            {key: 'new-screen', name: 'NewScreen'},
        ]);
        handleStateChange(intoNewScreen);
        handleStateChange(backToProfile);
        flushTransitions();
        expect(mockFireFocusEvent).not.toHaveBeenCalled();
    });

    it('does NOT call sendAccessibilityEvent when no trigger was staged before the forward navigation', () => {
        const prev = stackState(0, [{key: 'profile', name: 'Profile'}]);
        const forward = stackState(1, [
            {key: 'profile', name: 'Profile'},
            {key: 'display-name-page', name: 'DisplayName'},
        ]);
        const back = stackState(0, [{key: 'profile', name: 'Profile'}]);

        handleStateChange(prev);
        handleStateChange(forward);
        handleStateChange(back);
        flushTransitions();

        expect(mockFireFocusEvent).not.toHaveBeenCalled();
    });

    it('does NOT call sendAccessibilityEvent when the captured view has been detached (parent screen replaced)', () => {
        const view = {label: 'display-name', detached: true};
        setLastPressedTriggerForTests(view);
        const prev = stackState(0, [{key: 'profile', name: 'Profile'}]);
        const forward = stackState(1, [
            {key: 'profile', name: 'Profile'},
            {key: 'display-name-page', name: 'DisplayName'},
        ]);
        const back = stackState(0, [{key: 'profile', name: 'Profile'}]);

        handleStateChange(prev);
        handleStateChange(forward);
        handleStateChange(back);
        flushTransitions();

        expect(mockFireFocusEvent).not.toHaveBeenCalled();
    });

    it('cleans the trigger entry from the map after a successful restore', () => {
        setLastPressedTriggerForTests(fakeView('display-name'));
        const prev = stackState(0, [{key: 'profile', name: 'Profile'}]);
        const forward = stackState(1, [
            {key: 'profile', name: 'Profile'},
            {key: 'display-name-page', name: 'DisplayName'},
        ]);
        const back = stackState(0, [{key: 'profile', name: 'Profile'}]);

        handleStateChange(prev);
        handleStateChange(forward);
        expect(getTriggerMapSizeForTests()).toBe(1);
        handleStateChange(back);
        flushTransitions();
        expect(getTriggerMapSizeForTests()).toBe(0);
    });
});

describe('handleStateChange — lateral & cleanup', () => {
    it('cancels a pending restore on a subsequent lateral tab switch', () => {
        setLastPressedTriggerForTests(fakeView('display-name'));
        const initial = stackState(0, [{key: 'profile', name: 'Profile'}]);
        const forward = stackState(1, [
            {key: 'profile', name: 'Profile'},
            {key: 'display-name-page', name: 'DisplayName'},
        ]);
        const back = stackState(0, [{key: 'profile', name: 'Profile'}]);

        handleStateChange(initial);
        handleStateChange(forward);
        handleStateChange(back);

        const lateral = {
            type: 'tab',
            key: 'tab-root',
            index: 1,
            routeNames: ['A', 'B'],
            routes: [
                {key: 'tab-a', name: 'A'},
                {key: 'tab-b', name: 'B'},
            ],
            stale: false,
            history: [],
        };
        const lateralAfter = {...lateral, index: 0};
        handleStateChange(lateral);
        handleStateChange(lateralAfter);

        flushTransitions();
        expect(mockFireFocusEvent).not.toHaveBeenCalled();
    });

    it('drops trigger entries for routes removed from the stack', () => {
        setLastPressedTriggerForTests(fakeView('row-a'));
        const initial = stackState(0, [{key: 'profile', name: 'Profile'}]);
        const intoA = stackState(1, [
            {key: 'profile', name: 'Profile'},
            {key: 'detail-a', name: 'DetailA'},
        ]);
        const resetStack = stackState(0, [{key: 'home', name: 'Home'}]);

        handleStateChange(initial);
        handleStateChange(intoA);
        expect(getTriggerMapSizeForTests()).toBe(1);
        handleStateChange(resetStack);
        expect(getTriggerMapSizeForTests()).toBe(0);
    });

    it('cancelPendingFocusRestore drops any queued restore', () => {
        setLastPressedTriggerForTests(fakeView('display-name'));
        const initial = stackState(0, [{key: 'profile', name: 'Profile'}]);
        const forward = stackState(1, [
            {key: 'profile', name: 'Profile'},
            {key: 'display-name-page', name: 'DisplayName'},
        ]);
        const back = stackState(0, [{key: 'profile', name: 'Profile'}]);

        handleStateChange(initial);
        handleStateChange(forward);
        handleStateChange(back);
        cancelPendingFocusRestore();
        flushTransitions();

        expect(mockFireFocusEvent).not.toHaveBeenCalled();
    });
});

describe('setup / teardown', () => {
    it('is idempotent: a second setup call does not double-subscribe', () => {
        mockNavigationRefState = stackState(0, [{key: 'home', name: 'Home'}]);
        setupNavigationFocusReturn();
        const first = mockStateListeners.length;
        setupNavigationFocusReturn();
        expect(mockStateListeners.length).toBe(first);
    });

    it('teardown clears triggerMap and the staged trigger', () => {
        setLastPressedTriggerForTests(fakeView('row'));
        handleStateChange(stackState(0, [{key: 'profile', name: 'Profile'}]));
        handleStateChange(
            stackState(1, [
                {key: 'profile', name: 'Profile'},
                {key: 'display-name-page', name: 'DisplayName'},
            ]),
        );
        expect(getTriggerMapSizeForTests()).toBe(1);
        teardownNavigationFocusReturn();
        expect(getTriggerMapSizeForTests()).toBe(0);
    });
});

describe('PUSH_PARAMS — same-route param change', () => {
    const ROUTE_KEY = 'Search_Root-K1';

    it('captures against the compound key on forward, restores on backward', () => {
        const trigger = fakeView('search-tab-expense');
        setLastPressedTriggerForTests(trigger);

        notifyPushParamsForward(ROUTE_KEY, {q: 'old'});
        expect(getTriggerMapSizeForTests()).toBe(1);

        notifyPushParamsBackward(ROUTE_KEY, {q: 'old'});
        flushTransitions();
        expect(mockFireFocusEvent).toHaveBeenCalledWith(trigger);
    });

    it('does NOT restore when the back targets a different params hash than the captured one', () => {
        const trigger = fakeView('search-tab-expense');
        setLastPressedTriggerForTests(trigger);

        notifyPushParamsForward(ROUTE_KEY, {q: 'old'});
        notifyPushParamsBackward(ROUTE_KEY, {q: 'unrelated'});
        flushTransitions();
        expect(mockFireFocusEvent).not.toHaveBeenCalled();
    });

    it('drops compound entries when the route is removed from the tree', () => {
        setLastPressedTriggerForTests(fakeView('search-tab-expense'));
        notifyPushParamsForward(ROUTE_KEY, {q: 'old'});
        expect(getTriggerMapSizeForTests()).toBe(1);

        handleStateChange(stackState(0, [{key: ROUTE_KEY, name: 'Search'}]));
        handleStateChange(stackState(0, [{key: 'OtherRoot', name: 'Other'}]));
        expect(getTriggerMapSizeForTests()).toBe(0);
    });
});

describe('web-only stubs return constant values on native', () => {
    it('isFocusRestoreInProgress always returns false', () => {
        expect(isFocusRestoreInProgress()).toBe(false);
    });

    it('shouldSkipAutoFocusDueToExistingFocus always returns false', () => {
        expect(shouldSkipAutoFocusDueToExistingFocus()).toBe(false);
    });
});
