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
    registerPressable,
    notifyPushParamsForward,
    notifyPushParamsBackward,
    cancelPendingFocusRestore,
    isFocusRestoreInProgress,
    shouldSkipAutoFocusDueToExistingFocus,
    resetForTests,
    setLastPressedTriggerRefForTests,
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
    isFocusRestoreInProgress: () => boolean;
    shouldSkipAutoFocusDueToExistingFocus: () => boolean;
    resetForTests: () => void;
    setLastPressedTriggerRefForTests: (ref: unknown, identifier?: string) => void;
    getTriggerMapSizeForTests: () => number;
    getRegistrySizeForTests: () => number;
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
        setLastPressedTriggerRefForTests(fakeRef(fakeView('display-name')));
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
        setLastPressedTriggerRefForTests(fakeRef(view));
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
        setLastPressedTriggerRefForTests(detachedRef);
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
        setLastPressedTriggerRefForTests(fakeRef(fakeView('display-name')));
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
        setLastPressedTriggerRefForTests(fakeRef(fakeView('display-name')));
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
        setLastPressedTriggerRefForTests(fakeRef(fakeView('row-a')));
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
        setLastPressedTriggerRefForTests(fakeRef(fakeView('display-name')));
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
        setLastPressedTriggerRefForTests(fakeRef(fakeView('row')));
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
        setLastPressedTriggerRefForTests(fakeRef(view));

        notifyPushParamsForward(ROUTE_KEY, {q: 'old'});
        expect(getTriggerMapSizeForTests()).toBe(1);

        notifyPushParamsBackward(ROUTE_KEY, {q: 'old'});
        flushTransitions();
        expect(mockFireFocusEvent).toHaveBeenCalledWith(view);
    });

    it('does NOT restore when the back targets a different params hash than the captured one', () => {
        setLastPressedTriggerRefForTests(fakeRef(fakeView('search-tab-expense')));

        notifyPushParamsForward(ROUTE_KEY, {q: 'old'});
        notifyPushParamsBackward(ROUTE_KEY, {q: 'unrelated'});
        flushTransitions();
        expect(mockFireFocusEvent).not.toHaveBeenCalled();
    });

    it('drops compound entries when the route is removed from the tree', () => {
        setLastPressedTriggerRefForTests(fakeRef(fakeView('search-tab-expense')));
        notifyPushParamsForward(ROUTE_KEY, {q: 'old'});
        expect(getTriggerMapSizeForTests()).toBe(1);

        handleStateChange(stackState(0, [{key: ROUTE_KEY, name: 'Search'}]));
        handleStateChange(stackState(0, [{key: 'OtherRoot', name: 'Other'}]));
        expect(getTriggerMapSizeForTests()).toBe(0);
    });
});

describe('pressable registry — identifier-based fallback', () => {
    it('registers and deregisters by routeKey + identifier', () => {
        const ref = fakeRef(fakeView('row'));
        const deregister = registerPressable('A', 'Members', ref);
        expect(getRegistrySizeForTests()).toBe(1);
        deregister();
        expect(getRegistrySizeForTests()).toBe(0);
    });

    it('deregister is a no-op once another Pressable has overwritten the same identifier (remount race)', () => {
        const oldRef = fakeRef(fakeView('old'));
        const newRef = fakeRef(fakeView('new'));
        const deregisterOld = registerPressable('A', 'Members', oldRef);
        registerPressable('A', 'Members', newRef);
        deregisterOld();
        expect(getRegistrySizeForTests()).toBe(1);
    });

    it('restoreTriggerForRoute falls back to the registry when the captured ref was nulled by detach', () => {
        const detachedRef = fakeRef(fakeView('row'));
        setLastPressedTriggerRefForTests(detachedRef, 'Members');

        const prev = stackState(0, [{key: 'A', name: 'WorkspaceInitial'}]);
        const forward = stackState(1, [
            {key: 'A', name: 'WorkspaceInitial'},
            {key: 'B', name: 'WorkspaceMembers'},
        ]);
        handleStateChange(prev);
        handleStateChange(forward);

        // Detach simulation: react-native-screens nulls the captured View ref.
        detachedRef.current = null;
        // Re-attach simulation: a new Pressable mounts on the sidebar with the same identifier and a live View.
        const liveView = fakeView('row-remount');
        const liveRef = fakeRef(liveView);
        registerPressable('A', 'Members', liveRef);

        const back = stackState(0, [{key: 'A', name: 'WorkspaceInitial'}]);
        handleStateChange(back);
        flushTransitions();

        expect(mockFireFocusEvent).toHaveBeenCalledWith(liveView);
    });

    it('rAF retry rescues focus when re-attach lags transitionEnd', () => {
        const detachedRef = fakeRef(fakeView('row'));
        setLastPressedTriggerRefForTests(detachedRef, 'Members');

        const prev = stackState(0, [{key: 'A', name: 'WorkspaceInitial'}]);
        const forward = stackState(1, [
            {key: 'A', name: 'WorkspaceInitial'},
            {key: 'B', name: 'WorkspaceMembers'},
        ]);
        handleStateChange(prev);
        handleStateChange(forward);

        detachedRef.current = null;
        handleStateChange(stackState(0, [{key: 'A', name: 'WorkspaceInitial'}]));
        flushTransitions();
        // No registry hit on transitionEnd: nothing fires yet.
        expect(mockFireFocusEvent).not.toHaveBeenCalled();

        // The new Pressable mounts a frame later.
        const liveView = fakeView('row-remount');
        registerPressable('A', 'Members', fakeRef(liveView));
        jest.advanceTimersByTime(20);

        expect(mockFireFocusEvent).toHaveBeenCalledWith(liveView);
    });

    it('stores two same-route entries under distinct identifiers — duplicate-label rows do NOT collide when distinct ids exist', () => {
        const rowAEdit = fakeRef(fakeView('edit-a'));
        const rowBEdit = fakeRef(fakeView('edit-b'));
        registerPressable('A', 'base-list-item-natu26+305', rowAEdit);
        registerPressable('A', 'base-list-item-natu26+306', rowBEdit);
        expect(getRegistrySizeForTests()).toBe(2);
    });

    it('fallback resolves the captured identifier even when other same-label registry entries exist for the route', () => {
        // Simulate two rows with the same accessibilityLabel "Edit" but distinct ids (the per-pressable disambiguation we get for free via the fallback chain).
        const pressedRef = fakeRef(fakeView('edit-on-row-A'));
        const otherRef = fakeRef(fakeView('edit-on-row-B'));
        setLastPressedTriggerRefForTests(pressedRef, 'base-list-item-natu26+305');

        handleStateChange(stackState(0, [{key: 'A', name: 'WorkspaceMembers'}]));
        handleStateChange(
            stackState(1, [
                {key: 'A', name: 'WorkspaceMembers'},
                {key: 'B', name: 'MemberDetails'},
            ]),
        );

        // Detach + re-register under both ids. Only the pressed-row's identifier should resolve.
        pressedRef.current = null;
        const liveA = fakeView('edit-on-row-A-remount');
        registerPressable('A', 'base-list-item-natu26+305', fakeRef(liveA));
        registerPressable('A', 'base-list-item-natu26+306', otherRef);

        handleStateChange(stackState(0, [{key: 'A', name: 'WorkspaceMembers'}]));
        flushTransitions();

        expect(mockFireFocusEvent).toHaveBeenCalledWith(liveA);
        expect(mockFireFocusEvent).not.toHaveBeenCalledWith(otherRef.current);
    });

    it('clears the registry for a route key when that route is removed from the navigation tree', () => {
        registerPressable('B', 'Member-Row', fakeRef(fakeView('row')));
        expect(getRegistrySizeForTests()).toBe(1);

        handleStateChange(
            stackState(1, [
                {key: 'A', name: 'WorkspaceInitial'},
                {key: 'B', name: 'WorkspaceMembers'},
            ]),
        );
        handleStateChange(stackState(0, [{key: 'A', name: 'WorkspaceInitial'}]));

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
