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

type TtEntry = {cb: () => void; cancelled: boolean; waitForUpcomingTransition: boolean};
let mockTtQueue: TtEntry[] = [];
jest.mock('../../src/libs/Navigation/TransitionTracker', () => ({
    __esModule: true,
    default: {
        startTransition: jest.fn(),
        endTransition: jest.fn(),
        runAfterTransitions: ({callback, waitForUpcomingTransition = false}: {callback: () => void; waitForUpcomingTransition?: boolean}) => {
            const entry: TtEntry = {cb: callback, cancelled: false, waitForUpcomingTransition};
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
    registerPressable,
    notifyPushParamsForward,
    notifyPushParamsBackward,
    cancelPendingFocusRestore,
    skipNextFocusRestore,
    isFocusRestoreInProgress,
    shouldSkipAutoFocusDueToExistingFocus,
    resetForTests,
    getTriggerMapSizeForTests,
    getRegistrySizeForTests,
} = require<{
    setupNavigationFocusReturn: () => void;
    teardownNavigationFocusReturn: () => void;
    handleStateChange: (state: unknown) => void;
    notifyPressedTrigger: (ref: unknown, identifier?: string) => void;
    registerPressable: (routeKey: string, identifier: string, ref: unknown) => () => void;
    notifyPushParamsForward: (routeKey: string, prevParams: unknown) => void;
    notifyPushParamsBackward: (routeKey: string, targetParams: unknown) => void;
    cancelPendingFocusRestore: () => void;
    skipNextFocusRestore: () => void;
    isFocusRestoreInProgress: () => boolean;
    shouldSkipAutoFocusDueToExistingFocus: () => boolean;
    resetForTests: () => void;
    getTriggerMapSizeForTests: () => number;
    getRegistrySizeForTests: () => number;
}>('../../src/libs/NavigationFocusReturn/index.native.ts');
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

function fakeRef(view: unknown): {current: unknown} {
    return {current: view};
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
        notifyPressedTrigger(fakeRef(fakeView('button')));
        const prev = stackState(0, [{key: 'a', name: 'A'}]);
        const next = stackState(1, [
            {key: 'a', name: 'A'},
            {key: 'b', name: 'B'},
        ]);
        handleStateChange(prev);
        handleStateChange(next);
        expect(getTriggerMapSizeForTests()).toBe(0);
    });

    it('stores the most recently pressed ref when the screen reader is on', () => {
        notifyPressedTrigger(fakeRef(fakeView('button-1')));
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
        notifyPressedTrigger(fakeRef(fakeView('button-1')));
        notifyPressedTrigger(fakeRef(fakeView('button-2')));
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
        notifyPressedTrigger(fakeRef(fakeView('non-nav-toggle')));
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
        notifyPressedTrigger(fakeRef(fakeView('display-name')));
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
        notifyPressedTrigger(fakeRef(view));
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

    it('waits for the upcoming transition on a stack pop', () => {
        notifyPressedTrigger(fakeRef(fakeView('display-name')));
        handleStateChange(stackState(0, [{key: 'profile', name: 'Profile'}]));
        handleStateChange(
            stackState(1, [
                {key: 'profile', name: 'Profile'},
                {key: 'display-name-page', name: 'DisplayName'},
            ]),
        );
        handleStateChange(stackState(0, [{key: 'profile', name: 'Profile'}]));

        expect(mockTtQueue.at(-1)?.waitForUpcomingTransition).toBe(true);
    });

    it('does NOT restore when skipNextFocusRestore was called before goBack (form-submit path)', () => {
        notifyPressedTrigger(fakeRef(fakeView('display-name')));
        handleStateChange(stackState(0, [{key: 'profile', name: 'Profile'}]));
        handleStateChange(
            stackState(1, [
                {key: 'profile', name: 'Profile'},
                {key: 'display-name-page', name: 'DisplayName'},
            ]),
        );

        skipNextFocusRestore();
        handleStateChange(stackState(0, [{key: 'profile', name: 'Profile'}]));
        flushTransitions();

        expect(mockFireFocusEvent).not.toHaveBeenCalled();
        expect(getTriggerMapSizeForTests()).toBe(0);
    });

    it('clears the skipped entry so a later deeplink Back to the same route cannot inherit it', () => {
        notifyPressedTrigger(fakeRef(fakeView('display-name')));
        handleStateChange(stackState(0, [{key: 'profile', name: 'Profile'}]));
        handleStateChange(
            stackState(1, [
                {key: 'profile', name: 'Profile'},
                {key: 'display-name-page', name: 'DisplayName'},
            ]),
        );

        skipNextFocusRestore();
        handleStateChange(stackState(0, [{key: 'profile', name: 'Profile'}]));
        flushTransitions();

        // Deeplink-style forward (no fresh trigger) + back: the skipped entry must not resurface.
        handleStateChange(
            stackState(1, [
                {key: 'profile', name: 'Profile'},
                {key: 'new-screen', name: 'NewScreen'},
            ]),
        );
        handleStateChange(stackState(0, [{key: 'profile', name: 'Profile'}]));
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

    it('does NOT call sendAccessibilityEvent when the captured ref has been nulled (Pressable unmounted)', () => {
        // The ref's `.current` going null is the ref-pass-through analog of a detached view.
        const detachedRef = fakeRef(null);
        notifyPressedTrigger(detachedRef);
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
        notifyPressedTrigger(fakeRef(fakeView('display-name')));
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

    it('clears the staged press on a backward nav so a later press-less forward cannot capture the stale Back/Save ref', () => {
        handleStateChange(stackState(0, [{key: 'A', name: 'A'}]));
        handleStateChange(
            stackState(1, [
                {key: 'A', name: 'A'},
                {key: 'B', name: 'B'},
            ]),
        );

        // User presses Back on B (stages the back-button ref), then navigates back.
        notifyPressedTrigger(fakeRef(fakeView('back-button')), 'Back');
        handleStateChange(stackState(0, [{key: 'A', name: 'A'}]));

        // A press-less forward within the TTL must capture nothing — the Back press was consumed by the backward nav.
        handleStateChange(
            stackState(1, [
                {key: 'A', name: 'A'},
                {key: 'C', name: 'C'},
            ]),
        );
        expect(getTriggerMapSizeForTests()).toBe(0);
    });
});

describe('handleStateChange — lateral & cleanup', () => {
    it('cancels a pending restore on a subsequent lateral tab switch', () => {
        notifyPressedTrigger(fakeRef(fakeView('display-name')));
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
        notifyPressedTrigger(fakeRef(fakeView('row-a')));
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
        notifyPressedTrigger(fakeRef(fakeView('display-name')));
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
        notifyPressedTrigger(fakeRef(fakeView('row')));
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
        const view = fakeView('search-tab-expense');
        notifyPressedTrigger(fakeRef(view));

        notifyPushParamsForward(ROUTE_KEY, {q: 'old'});
        expect(getTriggerMapSizeForTests()).toBe(1);

        notifyPushParamsBackward(ROUTE_KEY, {q: 'old'});
        // PUSH_PARAMS emits no transition — restore must not wait for one (would stall on the 1s timeout).
        expect(mockTtQueue.at(-1)?.waitForUpcomingTransition).toBe(false);
        flushTransitions();
        expect(mockFireFocusEvent).toHaveBeenCalledWith(view);
    });

    it('clears the staged press after a PUSH_PARAMS forward so a later stack forward cannot reuse it', () => {
        notifyPressedTrigger(fakeRef(fakeView('search-tab')), 'search-tab');
        notifyPushParamsForward(ROUTE_KEY, {q: 'old'});

        handleStateChange(stackState(0, [{key: 'A', name: 'A'}]));
        handleStateChange(
            stackState(1, [
                {key: 'A', name: 'A'},
                {key: 'B', name: 'B'},
            ]),
        );
        handleStateChange(stackState(0, [{key: 'A', name: 'A'}]));
        flushTransitions();
        expect(mockFireFocusEvent).not.toHaveBeenCalled();
    });

    it('clears the staged press on a PUSH_PARAMS backward so a later press-less forward cannot reuse it', () => {
        handleStateChange(stackState(0, [{key: 'A', name: 'A'}]));

        // User presses Back/Save (stages the ref), then a PUSH_PARAMS back reverts params.
        notifyPressedTrigger(fakeRef(fakeView('back-button')), 'Back');
        notifyPushParamsBackward('A', {q: 'old'});

        // A press-less forward within the TTL must capture nothing.
        handleStateChange(
            stackState(1, [
                {key: 'A', name: 'A'},
                {key: 'B', name: 'B'},
            ]),
        );
        expect(getTriggerMapSizeForTests()).toBe(0);
    });

    it('restores via the registry under the raw route key when the captured ref was nulled (compound key)', () => {
        const detachedRef = fakeRef(fakeView('row'));
        notifyPressedTrigger(detachedRef, 'row');
        notifyPushParamsForward(ROUTE_KEY, {q: 'old'});

        detachedRef.current = null;
        const liveView = fakeView('row-remount');
        registerPressable(ROUTE_KEY, 'row', fakeRef(liveView));

        notifyPushParamsBackward(ROUTE_KEY, {q: 'old'});
        flushTransitions();
        expect(mockFireFocusEvent).toHaveBeenCalledWith(liveView);
    });

    it('does NOT restore when the back targets a different params hash than the captured one', () => {
        notifyPressedTrigger(fakeRef(fakeView('search-tab-expense')));

        notifyPushParamsForward(ROUTE_KEY, {q: 'old'});
        notifyPushParamsBackward(ROUTE_KEY, {q: 'unrelated'});
        flushTransitions();
        expect(mockFireFocusEvent).not.toHaveBeenCalled();
    });

    it('drops compound entries when the route is removed from the tree', () => {
        notifyPressedTrigger(fakeRef(fakeView('search-tab-expense')));
        notifyPushParamsForward(ROUTE_KEY, {q: 'old'});
        expect(getTriggerMapSizeForTests()).toBe(1);

        handleStateChange(stackState(0, [{key: ROUTE_KEY, name: 'Search'}]));
        handleStateChange(stackState(0, [{key: 'OtherRoot', name: 'Other'}]));
        expect(getTriggerMapSizeForTests()).toBe(0);
    });
});

describe('pressable registry — identifier-based fallback', () => {
    it('registers and deregisters by routeKey + identifier', () => {
        const deregister = registerPressable('A', 'row', fakeRef(fakeView('row')));
        expect(getRegistrySizeForTests()).toBe(1);
        deregister();
        expect(getRegistrySizeForTests()).toBe(0);
    });

    it('deregister removes only its own ref, so a same-identifier sibling survives (remount race)', () => {
        const deregisterOld = registerPressable('A', 'row', fakeRef(fakeView('old')));
        registerPressable('A', 'row', fakeRef(fakeView('new')));
        deregisterOld();
        expect(getRegistrySizeForTests()).toBe(1);
    });

    it('restoreTriggerForRoute falls back to the registry when the captured ref was nulled by detach', () => {
        const detachedRef = fakeRef(fakeView('row'));
        notifyPressedTrigger(detachedRef, 'row');

        handleStateChange(stackState(0, [{key: 'A', name: 'A'}]));
        handleStateChange(
            stackState(1, [
                {key: 'A', name: 'A'},
                {key: 'B', name: 'B'},
            ]),
        );

        detachedRef.current = null;
        const liveView = fakeView('row-remount');
        registerPressable('A', 'row', fakeRef(liveView));

        handleStateChange(stackState(0, [{key: 'A', name: 'A'}]));
        flushTransitions();

        expect(mockFireFocusEvent).toHaveBeenCalledWith(liveView);
    });

    it('rAF retry rescues focus when re-attach lags transitionEnd', () => {
        const detachedRef = fakeRef(fakeView('row'));
        notifyPressedTrigger(detachedRef, 'row');

        handleStateChange(stackState(0, [{key: 'A', name: 'A'}]));
        handleStateChange(
            stackState(1, [
                {key: 'A', name: 'A'},
                {key: 'B', name: 'B'},
            ]),
        );

        detachedRef.current = null;
        handleStateChange(stackState(0, [{key: 'A', name: 'A'}]));
        flushTransitions();
        expect(mockFireFocusEvent).not.toHaveBeenCalled();

        const liveView = fakeView('row-remount');
        registerPressable('A', 'row', fakeRef(liveView));
        jest.advanceTimersByTime(20);

        expect(mockFireFocusEvent).toHaveBeenCalledWith(liveView);
    });

    it('keeps retrying across several frames while re-attach lags, instead of giving up after one frame', () => {
        const detachedRef = fakeRef(fakeView('row'));
        notifyPressedTrigger(detachedRef, 'row');

        handleStateChange(stackState(0, [{key: 'A', name: 'A'}]));
        handleStateChange(
            stackState(1, [
                {key: 'A', name: 'A'},
                {key: 'B', name: 'B'},
            ]),
        );

        detachedRef.current = null;
        handleStateChange(stackState(0, [{key: 'A', name: 'A'}]));
        flushTransitions();

        // Two frames pass with the registry still empty — a single-frame retry would already have dropped the entry.
        jest.advanceTimersByTime(20);
        jest.advanceTimersByTime(20);
        expect(mockFireFocusEvent).not.toHaveBeenCalled();
        expect(getTriggerMapSizeForTests()).toBe(1);

        const liveView = fakeView('row-late-remount');
        registerPressable('A', 'row', fakeRef(liveView));
        jest.advanceTimersByTime(20);
        expect(mockFireFocusEvent).toHaveBeenCalledWith(liveView);
    });

    it('gives up and clears the entry once the retry budget is exhausted', () => {
        const detachedRef = fakeRef(fakeView('row'));
        notifyPressedTrigger(detachedRef, 'row');

        handleStateChange(stackState(0, [{key: 'A', name: 'A'}]));
        handleStateChange(
            stackState(1, [
                {key: 'A', name: 'A'},
                {key: 'B', name: 'B'},
            ]),
        );

        detachedRef.current = null;
        handleStateChange(stackState(0, [{key: 'A', name: 'A'}]));
        flushTransitions();

        jest.advanceTimersByTime(200);
        expect(mockFireFocusEvent).not.toHaveBeenCalled();
        expect(getTriggerMapSizeForTests()).toBe(0);
    });

    it('stores two same-route entries under distinct identifiers — duplicate-label rows do NOT collide when distinct ids exist', () => {
        registerPressable('A', 'row-a', fakeRef(fakeView('a')));
        registerPressable('A', 'row-b', fakeRef(fakeView('b')));
        expect(getRegistrySizeForTests()).toBe(2);
    });

    it('fallback resolves the captured identifier even when other same-label registry entries exist for the route', () => {
        const pressedRef = fakeRef(fakeView('a'));
        const otherRef = fakeRef(fakeView('b'));
        notifyPressedTrigger(pressedRef, 'row-a');

        handleStateChange(stackState(0, [{key: 'A', name: 'List'}]));
        handleStateChange(
            stackState(1, [
                {key: 'A', name: 'List'},
                {key: 'B', name: 'Detail'},
            ]),
        );

        pressedRef.current = null;
        const liveA = fakeView('a-remount');
        registerPressable('A', 'row-a', fakeRef(liveA));
        registerPressable('A', 'row-b', otherRef);

        handleStateChange(stackState(0, [{key: 'A', name: 'List'}]));
        flushTransitions();

        expect(mockFireFocusEvent).toHaveBeenCalledWith(liveA);
        expect(mockFireFocusEvent).not.toHaveBeenCalledWith(otherRef.current);
    });

    it('declines the fallback when a colliding identifier maps to multiple live pressables (no wrong-row restore)', () => {
        const detachedRef = fakeRef(fakeView('edit-pressed'));
        notifyPressedTrigger(detachedRef, 'Edit');

        handleStateChange(stackState(0, [{key: 'A', name: 'List'}]));
        handleStateChange(
            stackState(1, [
                {key: 'A', name: 'List'},
                {key: 'B', name: 'Detail'},
            ]),
        );

        // Screen detaches (captured ref nulled), then remounts with several rows sharing the same "Edit" label.
        detachedRef.current = null;
        registerPressable('A', 'Edit', fakeRef(fakeView('row-1-edit')));
        registerPressable('A', 'Edit', fakeRef(fakeView('row-2-edit')));

        handleStateChange(stackState(0, [{key: 'A', name: 'List'}]));
        flushTransitions();
        jest.advanceTimersByTime(200);

        // Ambiguous identifier → focus nothing rather than an arbitrary row; the entry is dropped after the budget.
        expect(mockFireFocusEvent).not.toHaveBeenCalled();
        expect(getTriggerMapSizeForTests()).toBe(0);
    });

    it('back button tie-breaks on collision (dual-header layout) — any backButton in the same route is a correct target', () => {
        const detachedRef = fakeRef(fakeView('back-pressed'));
        notifyPressedTrigger(detachedRef, 'backButton');

        handleStateChange(stackState(0, [{key: 'A', name: 'A'}]));
        handleStateChange(
            stackState(1, [
                {key: 'A', name: 'A'},
                {key: 'B', name: 'B'},
            ]),
        );

        // Captured ref dies, dual-header layout registers two back buttons under one route.
        detachedRef.current = null;
        const liveView = fakeView('backButton-1');
        registerPressable('A', 'backButton', fakeRef(liveView));
        registerPressable('A', 'backButton', fakeRef(fakeView('backButton-2')));

        handleStateChange(stackState(0, [{key: 'A', name: 'A'}]));
        flushTransitions();

        // Tie-break: the first live ref is focused (not declined like row-level collisions).
        expect(mockFireFocusEvent).toHaveBeenCalledWith(liveView);
    });

    it('clears the registry for a route key when that route is removed from the navigation tree', () => {
        registerPressable('B', 'row', fakeRef(fakeView('row')));
        expect(getRegistrySizeForTests()).toBe(1);

        handleStateChange(
            stackState(1, [
                {key: 'A', name: 'A'},
                {key: 'B', name: 'B'},
            ]),
        );
        handleStateChange(stackState(0, [{key: 'A', name: 'A'}]));

        expect(getRegistrySizeForTests()).toBe(0);
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
