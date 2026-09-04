// Typed require with explicit .ts path — matches the project's test-file convention.

// Mocked so isEnterWhileComposition's Safari-specific keyCode===229 path can be exercised without a real Safari UA.
let mockBrowser = 'other';
jest.mock('@libs/Browser', () => ({
    __esModule: true,
    getBrowser: () => mockBrowser,
    isMobileChrome: () => false,
    isSafari: () => mockBrowser === 'safari',
}));

// scheduleRestore defers through TransitionTracker; mock it so the deferred restore can be flushed deterministically (waitForUpcomingTransition is Promise-based and can't be driven by fake timers alone).
type TtEntry = {cb: () => void; cancelled: boolean; waitForUpcomingTransition: boolean | 'navigation'};
let mockTtQueue: TtEntry[] = [];
jest.mock('../../src/libs/Navigation/TransitionTracker', () => ({
    __esModule: true,
    default: {
        startTransition: jest.fn(),
        endTransition: jest.fn(),
        runAfterTransitions: ({callback, waitForUpcomingTransition = false}: {callback: () => void; waitForUpcomingTransition?: boolean | 'navigation'}) => {
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

const {resetCycle: resetArbiter, tryClaim, Priorities} = require<{
    resetCycle: () => void;
    tryClaim: (priority: number) => boolean;
    Priorities: {INITIAL: number; AUTO: number; RETURN: number};
}>('../../src/libs/ScreenFocusArbiter.ts');
const {resetForTests: resetHadTabNavigation, setupHadTabNavigation} = require<{
    resetForTests: () => void;
    setupHadTabNavigation: () => void;
}>('../../src/libs/hadTabNavigation.ts');
const {
    captureTriggerForRoute,
    restoreTriggerForRoute,
    handleStateChange,
    resetForTests,
    setLastInteractiveElementForTests,
    setLastMouseTriggerForTests,
    notifyPushParamsForward,
    notifyPushParamsBackward,
    cancelPendingFocusRestore,
    skipNextFocusRestore,
    isFocusRestoreInProgress,
    shouldSkipAutoFocusDueToExistingFocus,
    setupNavigationFocusReturn,
    teardownNavigationFocusReturn,
} = require<{
    captureTriggerForRoute: (routeKey: string) => void;
    restoreTriggerForRoute: (routeKey: string) => boolean;
    handleStateChange: (state: unknown) => void;
    resetForTests: () => void;
    setLastInteractiveElementForTests: (element: HTMLElement | null) => void;
    setLastMouseTriggerForTests: (element: HTMLElement | null) => void;
    notifyPushParamsForward: (routeKey: string, prevParams: unknown) => void;
    notifyPushParamsBackward: (routeKey: string, targetParams: unknown) => void;
    cancelPendingFocusRestore: () => void;
    skipNextFocusRestore: () => void;
    isFocusRestoreInProgress: () => boolean;
    shouldSkipAutoFocusDueToExistingFocus: () => boolean;
    setupNavigationFocusReturn: () => void;
    teardownNavigationFocusReturn: () => void;
}>('../../src/libs/NavigationFocusReturn/index.ts');
const {diffNavigationState, collectRouteKeys} = require<{
    diffNavigationState: (prev: unknown, next: unknown) => {action: {type: string; captureKey?: string; restoreKey?: string}; removedKeys: string[]};
    collectRouteKeys: (state: unknown) => Set<string>;
}>('../../src/libs/navigationStateDiff.ts');
const {default: compoundParamsKey} = require<{default: (routeKey: string, params: unknown) => string}>('../../src/libs/compoundParamsKey.ts');
const {setActivePopoverLauncher, markActivePopoverLauncherDeactivated} = require<{
    setActivePopoverLauncher: (element: HTMLElement) => void;
    markActivePopoverLauncherDeactivated: (element?: HTMLElement) => void;
}>('../../src/libs/LauncherStack.ts');
const {default: hasFocusableAttributes} = require<{
    default: (el: Element) => boolean;
}>('../../src/libs/focusGuards.ts');

function simulateTab() {
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Tab', bubbles: true}));
}

function simulateKey(key: string, options: {ctrlKey?: boolean; altKey?: boolean; metaKey?: boolean; altGraph?: boolean} = {}) {
    const event = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        ctrlKey: options.ctrlKey,
        altKey: options.altKey,
        metaKey: options.metaKey,
    });
    if (options.altGraph) {
        Object.defineProperty(event, 'getModifierState', {value: (mod: string) => mod === 'AltGraph'});
    }
    document.dispatchEvent(event);
}

function simulateMouse() {
    document.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
}

function simulateTyping() {
    document.dispatchEvent(new KeyboardEvent('keydown', {key: '1', bubbles: true}));
}

function stackState(focused: number, routes: Array<{key: string; name: string; state?: unknown}>) {
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

function appendButton(): HTMLButtonElement {
    const button = document.createElement('button');
    document.body.appendChild(button);
    return button;
}

function appendInput(): HTMLInputElement {
    const input = document.createElement('input');
    document.body.appendChild(input);
    return input;
}

function fireFocusIn(el: HTMLElement): void {
    el.focus();
    el.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
}

function withFakeTimers<T>(fn: () => T): T {
    jest.useFakeTimers();
    try {
        return fn();
    } finally {
        jest.useRealTimers();
    }
}

// Runs the restore callbacks that scheduleRestore queued through the mocked TransitionTracker (mirrors a transition completing).
function flushTransitions(): void {
    const buffered = mockTtQueue;
    mockTtQueue = [];
    for (const entry of buffered) {
        if (entry.cancelled) {
            continue;
        }
        entry.cb();
    }
}

setupHadTabNavigation();
setupNavigationFocusReturn();

beforeEach(() => {
    resetForTests();
    resetArbiter();
    resetHadTabNavigation();
    mockTtQueue = [];
    document.body.innerHTML = '';
});

describe('collectRouteKeys', () => {
    it('should return empty set for undefined', () => {
        expect(collectRouteKeys(undefined).size).toBe(0);
    });

    it('should collect keys from a flat state', () => {
        const state = stackState(0, [
            {key: 'a', name: 'A'},
            {key: 'b', name: 'B'},
        ]);

        expect([...collectRouteKeys(state)].sort()).toEqual(['a', 'b']);
    });

    it('should recurse into nested states', () => {
        const state = stackState(0, [
            {
                key: 'root',
                name: 'Root',
                state: stackState(1, [
                    {key: 'child-a', name: 'ChildA'},
                    {key: 'child-b', name: 'ChildB'},
                ]),
            },
        ]);

        expect([...collectRouteKeys(state)].sort()).toEqual(['child-a', 'child-b', 'root']);
    });
});

describe('diffNavigationState', () => {
    it('should classify identical focused routes as noop', () => {
        const state = stackState(0, [{key: 'a', name: 'A'}]);
        const result = diffNavigationState(state, state);

        expect(result.action.type).toBe('noop');
        expect(result.removedKeys).toEqual([]);
    });

    it('should classify first-ever state (no prev) as noop', () => {
        const next = stackState(0, [{key: 'a', name: 'A'}]);
        const result = diffNavigationState(undefined, next);

        expect(result.action.type).toBe('noop');
    });

    it('should classify a push as forward capture against the previous focused key', () => {
        const prev = stackState(0, [{key: 'a', name: 'A'}]);
        const next = stackState(1, [
            {key: 'a', name: 'A'},
            {key: 'b', name: 'B'},
        ]);
        const result = diffNavigationState(prev, next);

        expect(result.action).toEqual({type: 'forward', captureKey: 'a'});
        expect(result.removedKeys).toEqual([]);
    });

    it('should classify a pop as backward restore against the now-focused key', () => {
        const prev = stackState(1, [
            {key: 'a', name: 'A'},
            {key: 'b', name: 'B'},
        ]);
        const next = stackState(0, [{key: 'a', name: 'A'}]);
        const result = diffNavigationState(prev, next);

        expect(result.action).toEqual({type: 'backward', restoreKey: 'a'});
        expect(result.removedKeys).toEqual(['b']);
    });

    it('should classify a replace (fresh key, old tree dropped) as forward', () => {
        const prev = stackState(0, [{key: 'a', name: 'A'}]);
        const next = stackState(0, [{key: 'c', name: 'C'}]);
        const result = diffNavigationState(prev, next);

        expect(result.action).toEqual({type: 'forward', captureKey: 'a'});
        expect(result.removedKeys).toEqual(['a']);
    });

    it('should detect backward navigation in nested navigators', () => {
        const prev = stackState(0, [
            {
                key: 'outer',
                name: 'Outer',
                state: stackState(1, [
                    {key: 'inner-a', name: 'InnerA'},
                    {key: 'inner-b', name: 'InnerB'},
                ]),
            },
        ]);
        const next = stackState(0, [
            {
                key: 'outer',
                name: 'Outer',
                state: stackState(0, [{key: 'inner-a', name: 'InnerA'}]),
            },
        ]);
        const result = diffNavigationState(prev, next);

        expect(result.action).toEqual({type: 'backward', restoreKey: 'inner-a'});
        expect(result.removedKeys).toEqual(['inner-b']);
    });

    it('should list every key dropped across the tree', () => {
        const prev = stackState(0, [
            {key: 'x', name: 'X'},
            {key: 'y', name: 'Y'},
        ]);
        const next = stackState(0, [{key: 'z', name: 'Z'}]);
        const result = diffNavigationState(prev, next);

        expect(result.removedKeys.sort()).toEqual(['x', 'y']);
    });

    it('should classify a lateral top-tab switch (all tabs mounted, no removal) as lateral', () => {
        const prev = stackState(0, [
            {key: 'tab-1', name: 'Tab1'},
            {key: 'tab-2', name: 'Tab2'},
        ]);
        const next = stackState(1, [
            {key: 'tab-1', name: 'Tab1'},
            {key: 'tab-2', name: 'Tab2'},
        ]);
        const result = diffNavigationState(prev, next);

        expect(result.action.type).toBe('lateral');
        expect(result.removedKeys).toEqual([]);
    });
});

describe('captureTriggerForRoute', () => {
    describe('when navigation is keyboard-driven', () => {
        beforeEach(() => {
            simulateTab();
        });

        it('should store when active element matches the tracked element', () => {
            const trigger = appendButton();
            trigger.focus();
            setLastInteractiveElementForTests(trigger);

            captureTriggerForRoute('route-a');
            trigger.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
        });

        it('should store when active element is body (React Navigation blurred before state change)', () => {
            const trigger = appendButton();
            setLastInteractiveElementForTests(trigger);
            expect(document.activeElement).toBe(document.body);

            captureTriggerForRoute('route-a');
            expect(restoreTriggerForRoute('route-a')).toBe(true);
        });

        it('should not store when lastInteractiveElement is null', () => {
            setLastInteractiveElementForTests(null);
            captureTriggerForRoute('route-a');
            expect(restoreTriggerForRoute('route-a')).toBe(false);
        });

        it('should not store when the tracked element has left the DOM', () => {
            const trigger = appendButton();
            setLastInteractiveElementForTests(trigger);
            trigger.remove();

            captureTriggerForRoute('route-a');
            expect(restoreTriggerForRoute('route-a')).toBe(false);
        });

        it('should not store when active element has drifted to another non-body element', () => {
            const tracked = appendButton();
            const other = appendInput();

            // Pin tracked AFTER other.focus() so the focusin listener doesn't overwrite it.
            other.focus();
            setLastInteractiveElementForTests(tracked);

            captureTriggerForRoute('route-a');
            expect(restoreTriggerForRoute('route-a')).toBe(false);
        });

        // Without the latch, RHP autofocus overwrites lastInteractiveElement before capture, so back-nav lands on <body>.
        it('Enter-keydown latches the pre-activation element before destination autofocus can poison the capture (issue #96970)', () => {
            const row = appendButton();
            const destinationInput = appendInput();
            row.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));
            fireFocusIn(destinationInput);

            captureTriggerForRoute('route-a');

            destinationInput.remove();
            row.blur();
            expect(document.activeElement).toBe(document.body);
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(row);
        });

        it('NumpadEnter latches like Enter', () => {
            const row = appendButton();
            const destinationInput = appendInput();
            row.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'NumpadEnter', bubbles: true}));
            fireFocusIn(destinationInput);

            captureTriggerForRoute('route-a');
            destinationInput.remove();
            row.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(row);
        });

        it('Space-keydown latches like Enter', () => {
            const row = appendButton();
            const destinationInput = appendInput();
            row.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: ' ', code: 'Space', bubbles: true}));
            fireFocusIn(destinationInput);

            captureTriggerForRoute('route-a');
            destinationInput.remove();
            row.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(row);
        });

        it('does not latch on non-activation keys (Tab, arrows)', () => {
            const row = appendButton();
            row.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Tab', code: 'Tab', bubbles: true}));

            const drifted = appendInput();
            fireFocusIn(drifted);
            setLastInteractiveElementForTests(row);

            captureTriggerForRoute('route-a');
            expect(restoreTriggerForRoute('route-a')).toBe(false);
        });

        it('a superseded latch is invalidated when a non-activation keydown intervenes', () => {
            const rowA = appendButton();
            const rowB = appendButton();
            rowA.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Tab', code: 'Tab', bubbles: true}));
            rowB.focus();
            fireFocusIn(rowB);

            captureTriggerForRoute('route-a');
            rowB.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(rowB);
        });

        it('ignores the keydown latch past its TTL', () => {
            withFakeTimers(() => {
                const row = appendButton();
                const destinationInput = appendInput();
                row.focus();

                document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));
                fireFocusIn(destinationInput);
                jest.advanceTimersByTime(4_000);

                captureTriggerForRoute('route-a');
                destinationInput.remove();
                row.blur();
                expect(restoreTriggerForRoute('route-a')).toBe(false);
            });
        });

        it('does not latch when Enter fires while nothing is focused (body activeElement)', () => {
            const row = appendButton();
            setLastInteractiveElementForTests(row);
            expect(document.activeElement).toBe(document.body);

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));

            captureTriggerForRoute('route-a');
            expect(restoreTriggerForRoute('route-a')).toBe(true);
        });

        it('does not latch when the focused element is inert or aria-disabled', () => {
            const row = appendButton();
            row.setAttribute('aria-disabled', 'true');
            row.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));
            const destinationInput = appendInput();
            fireFocusIn(destinationInput);

            captureTriggerForRoute('route-a');
            destinationInput.remove();
            row.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(false);
        });

        it('a later failed activation clears a prior valid latch when focus is on body', () => {
            const rowA = appendButton();
            const rowB = appendButton();
            rowA.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));

            rowA.blur();
            expect(document.activeElement).toBe(document.body);

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));

            rowB.focus();
            fireFocusIn(rowB);
            captureTriggerForRoute('route-a');
            rowB.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(rowB);
        });

        it('a failed activation on a disabled target preserves a still-fresh valid latch', () => {
            const rowA = appendButton();
            const disabledB = appendButton();
            disabledB.setAttribute('aria-disabled', 'true');
            rowA.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));

            disabledB.focus();
            fireFocusIn(disabledB);
            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));

            captureTriggerForRoute('route-a');
            disabledB.remove();
            rowA.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(rowA);
        });

        it('IME Enter clears the latch', () => {
            const rowA = appendButton();
            const composer = appendInput();
            rowA.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));

            composer.focus();
            const ime = new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true});
            Object.defineProperty(ime, 'isComposing', {value: true, configurable: true});
            document.dispatchEvent(ime);

            fireFocusIn(composer);
            captureTriggerForRoute('route-a');
            composer.remove();
            rowA.remove();
            expect(restoreTriggerForRoute('route-a')).toBe(false);
        });

        it('skips a latch that became aria-disabled between keydown and capture', () => {
            const submit = appendButton();
            submit.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));
            submit.setAttribute('aria-disabled', 'true');

            captureTriggerForRoute('route-a');
            submit.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(false);
        });

        it('does not latch on a native input[type=checkbox]', () => {
            const checkbox = document.createElement('input');
            const rowB = appendButton();
            checkbox.type = 'checkbox';
            document.body.appendChild(checkbox);
            checkbox.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));

            rowB.focus();
            fireFocusIn(rowB);
            captureTriggerForRoute('route-a');
            checkbox.remove();
            rowB.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(rowB);
        });

        // SelectionButton renders these roles and GettingStartedRow wires the Checkbox's onPress to Navigation.navigate.
        it.each([['checkbox'], ['radio']])('latches on a role="%s" Pressable used as a navigation trigger', (role) => {
            const trigger = document.createElement('div');
            trigger.setAttribute('role', role);
            trigger.tabIndex = 0;
            document.body.appendChild(trigger);
            trigger.focus();
            fireFocusIn(trigger);

            trigger.dispatchEvent(new KeyboardEvent('keydown', {key: ' ', code: 'Space', bubbles: true}));

            const destinationInput = appendInput();
            destinationInput.focus();
            fireFocusIn(destinationInput);
            captureTriggerForRoute('route-a');
            destinationInput.remove();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(trigger);
        });

        it('does not latch on a Space code whose key value is a remapped printable character (OS-level keyboard remap)', () => {
            const rowA = appendButton();
            rowA.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'ñ', code: 'Space', bubbles: true}));

            const destinationInput = appendInput();
            fireFocusIn(destinationInput);
            captureTriggerForRoute('route-a');
            destinationInput.remove();
            rowA.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(rowA);
        });

        it('does not clear the latch on noop state changes with removedKeys', () => {
            const rowA = appendButton();
            rowA.focus();

            handleStateChange(
                stackState(0, [
                    {key: 'home', name: 'Home'},
                    {key: 'orphan-modal', name: 'Modal'},
                ]),
            );

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));

            handleStateChange(stackState(0, [{key: 'home', name: 'Home'}]));

            captureTriggerForRoute('route-a');
            rowA.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(rowA);
        });

        it('same-target click on a roving-tabindex ARIA element (role=menuitem) preserves the latch', () => {
            const menuItem = document.createElement('div');
            const destinationInput = appendInput();
            menuItem.setAttribute('role', 'menuitem');
            menuItem.setAttribute('tabindex', '-1');
            document.body.appendChild(menuItem);
            menuItem.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));

            menuItem.dispatchEvent(new MouseEvent('click', {bubbles: true}));

            fireFocusIn(destinationInput);
            captureTriggerForRoute('route-a');
            destinationInput.remove();
            menuItem.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(menuItem);
        });

        it('a non-matching Enter/Space release preserves pending', () => {
            withFakeTimers(() => {
                const row = appendButton();
                const destinationInput = appendInput();
                row.focus();

                document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));

                jest.advanceTimersByTime(200);
                row.dispatchEvent(new KeyboardEvent('keyup', {key: ' ', code: 'Space', bubbles: true}));

                jest.advanceTimersByTime(600);
                row.dispatchEvent(new KeyboardEvent('keyup', {key: 'Enter', code: 'Enter', bubbles: true}));

                fireFocusIn(destinationInput);
                captureTriggerForRoute('route-a');
                destinationInput.remove();
                row.blur();
                expect(restoreTriggerForRoute('route-a')).toBe(true);
                expect(document.activeElement).toBe(row);
            });
        });

        it('skipNextFocusRestore + notifyPushParamsBackward preserves lastInteractiveElement for a follow-up synchronous forward (save, goBack, openReport)', () => {
            handleStateChange(stackState(0, [{key: 'home', name: 'Home'}]));
            handleStateChange(
                stackState(1, [
                    {key: 'home', name: 'Home'},
                    {key: 'search', name: 'Search'},
                ]),
            );

            const rowA = appendButton();
            rowA.focus();
            fireFocusIn(rowA);
            setLastInteractiveElementForTests(rowA);

            skipNextFocusRestore();
            notifyPushParamsBackward('search', {q: 'A'});

            captureTriggerForRoute('post-save-route');
            rowA.blur();
            expect(restoreTriggerForRoute('post-save-route')).toBe(true);
            expect(document.activeElement).toBe(rowA);
        });

        it('latches on modifier+Enter (Cmd/Ctrl/Alt/Shift)', () => {
            const row = appendButton();
            const destinationInput = appendInput();
            row.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true, metaKey: true}));
            fireFocusIn(destinationInput);
            captureTriggerForRoute('route-a');

            destinationInput.remove();
            row.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(row);
        });

        it('clears the latch on mismatched keyup within TTL', () => {
            const rowA = appendButton();
            const rowB = appendButton();
            rowA.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));

            rowB.focus();
            fireFocusIn(rowB);
            rowB.dispatchEvent(new KeyboardEvent('keyup', {key: 'Enter', code: 'Enter', bubbles: true}));

            captureTriggerForRoute('route-a');
            rowA.remove();
            rowB.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(rowB);
        });

        it('does not refresh the latch when focus moves during a held key', () => {
            withFakeTimers(() => {
                const rowA = appendButton();
                const rowB = appendButton();
                rowA.focus();

                document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));

                rowB.focus();
                fireFocusIn(rowB);
                jest.advanceTimersByTime(600);
                rowB.dispatchEvent(new KeyboardEvent('keyup', {key: 'Enter', code: 'Enter', bubbles: true}));

                captureTriggerForRoute('route-a');
                rowA.remove();
                rowB.blur();
                expect(restoreTriggerForRoute('route-a')).toBe(true);
                expect(document.activeElement).toBe(rowB);
            });
        });

        it('preserves pending when a modifier is released before the held Enter (Shift+Enter, release Shift first)', () => {
            withFakeTimers(() => {
                const row = appendButton();
                const destinationInput = appendInput();
                row.focus();

                document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true, shiftKey: true}));

                jest.advanceTimersByTime(200);
                row.dispatchEvent(new KeyboardEvent('keyup', {key: 'Shift', code: 'ShiftLeft', bubbles: true}));

                // Enter release past TTL still refreshes.
                jest.advanceTimersByTime(600);
                row.dispatchEvent(new KeyboardEvent('keyup', {key: 'Enter', code: 'Enter', bubbles: true}));

                fireFocusIn(destinationInput);
                captureTriggerForRoute('route-a');
                destinationInput.remove();
                row.blur();
                expect(restoreTriggerForRoute('route-a')).toBe(true);
                expect(document.activeElement).toBe(row);
            });
        });

        it('refreshes the latch timestamp on Enter keyup', () => {
            withFakeTimers(() => {
                const row = appendButton();
                const destinationInput = appendInput();
                row.focus();

                document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));
                jest.advanceTimersByTime(800);
                row.dispatchEvent(new KeyboardEvent('keyup', {key: 'Enter', code: 'Enter', bubbles: true}));

                fireFocusIn(destinationInput);
                captureTriggerForRoute('route-a');

                destinationInput.remove();
                row.blur();
                expect(restoreTriggerForRoute('route-a')).toBe(true);
                expect(document.activeElement).toBe(row);
            });
        });

        it('a newer physical pointerdown supersedes a stale keyboard latch', () => {
            const rowA = appendButton();
            const rowB = appendButton();
            rowA.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));

            rowB.dispatchEvent(new MouseEvent('pointerdown', {bubbles: true}));

            captureTriggerForRoute('route-a');
            rowA.remove();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(rowB);
        });

        it('AT-emitted click on a different target clears the latch', () => {
            const rowA = appendButton();
            const rowB = appendButton();
            rowA.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));

            rowB.dispatchEvent(new MouseEvent('click', {bubbles: true}));
            rowB.focus();
            fireFocusIn(rowB);

            captureTriggerForRoute('route-a');
            rowA.remove();
            rowB.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(rowB);
        });

        it('does not latch on Safari IME-confirmation Enter (keyCode 229 without isComposing)', () => {
            mockBrowser = 'safari';
            try {
                const composer = appendInput();
                const rowB = appendButton();
                composer.focus();

                const event = new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true});
                Object.defineProperty(event, 'keyCode', {value: 229, configurable: true});
                document.dispatchEvent(event);

                rowB.focus();
                fireFocusIn(rowB);
                captureTriggerForRoute('route-a');
                composer.remove();
                rowB.blur();
                expect(restoreTriggerForRoute('route-a')).toBe(true);
                expect(document.activeElement).toBe(rowB);
            } finally {
                mockBrowser = 'other';
            }
        });

        it('a synthetic click from Enter/Space activation does not clear the latch', () => {
            const row = appendButton();
            const destinationInput = appendInput();
            row.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));
            row.dispatchEvent(new MouseEvent('click', {bubbles: true}));

            fireFocusIn(destinationInput);
            captureTriggerForRoute('route-a');
            destinationInput.remove();
            row.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(row);
        });

        it('a fresh keyboard latch trumps a stale mouse trigger even when hadTabNavigation is false', () => {
            const rowA = appendButton();
            const rowB = appendButton();

            // hadTabNavigation stays false since neither mouse-click nor arrows flip it.
            rowA.dispatchEvent(new MouseEvent('pointerdown', {bubbles: true}));
            rowA.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', code: 'ArrowDown', bubbles: true}));
            rowB.focus();
            fireFocusIn(rowB);

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));

            captureTriggerForRoute('route-a');
            rowA.remove();
            rowB.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(rowB);
        });

        it('latches on Enter in a single-line text input (submit-driven nav like SearchPageInput.onSubmitEditing)', () => {
            const searchInput = appendInput();
            const destinationInput = appendInput();
            searchInput.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));
            fireFocusIn(destinationInput);
            captureTriggerForRoute('route-a');

            destinationInput.remove();
            searchInput.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(searchInput);
        });

        it('does not latch on Space in a text input', () => {
            const searchInput = appendInput();
            const rowB = appendButton();
            searchInput.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: ' ', code: 'Space', bubbles: true}));

            rowB.focus();
            fireFocusIn(rowB);
            captureTriggerForRoute('route-a');
            searchInput.remove();
            rowB.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(rowB);
        });

        it('IME keyup does not revive a stale keyboard latch', () => {
            withFakeTimers(() => {
                const rowA = appendButton();
                const rowB = appendButton();
                rowA.focus();

                document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));
                document.dispatchEvent(new KeyboardEvent('keyup', {key: 'Enter', code: 'Enter', bubbles: true}));

                jest.advanceTimersByTime(600);
                const composer = appendInput();
                composer.focus();
                const imeKeydown = new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true});
                Object.defineProperty(imeKeydown, 'isComposing', {value: true, configurable: true});
                document.dispatchEvent(imeKeydown);
                document.dispatchEvent(new KeyboardEvent('keyup', {key: 'Enter', code: 'Enter', bubbles: true}));

                rowB.focus();
                fireFocusIn(rowB);
                captureTriggerForRoute('route-a');
                rowA.remove();
                rowB.blur();
                expect(restoreTriggerForRoute('route-a')).toBe(true);
                expect(document.activeElement).toBe(rowB);
            });
        });

        it('does not refresh timestamp on keyup for a non-activation key', () => {
            withFakeTimers(() => {
                const row = appendButton();
                const rowB = appendButton();
                row.focus();

                document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));

                // Unrelated keyup (e.g. Meta released after Cmd+Tab) must not refresh.
                jest.advanceTimersByTime(800);
                document.dispatchEvent(new KeyboardEvent('keyup', {key: 'Meta', code: 'MetaLeft', bubbles: true}));

                rowB.focus();
                fireFocusIn(rowB);
                captureTriggerForRoute('route-a');
                row.remove();
                rowB.blur();
                expect(restoreTriggerForRoute('route-a')).toBe(true);
                expect(document.activeElement).toBe(rowB);
            });
        });

        it('a standalone modifier keydown does not clear a fresh Enter latch', () => {
            const row = appendButton();
            const destinationInput = appendInput();
            row.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));
            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Shift', code: 'ShiftLeft', bubbles: true, shiftKey: true}));
            fireFocusIn(destinationInput);
            captureTriggerForRoute('route-a');

            destinationInput.remove();
            row.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(row);
        });

        it('does not latch when Enter fires in a textarea', () => {
            const textarea = document.createElement('textarea');
            const rowB = appendButton();
            document.body.appendChild(textarea);
            textarea.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));

            rowB.focus();
            fireFocusIn(rowB);
            captureTriggerForRoute('route-a');

            textarea.remove();
            rowB.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(rowB);
        });

        it('does not latch when Space fires in a contenteditable', () => {
            const composer = document.createElement('div');
            const rowB = appendButton();
            composer.setAttribute('contenteditable', 'true');
            composer.setAttribute('tabindex', '0');
            document.body.appendChild(composer);
            composer.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: ' ', code: 'Space', bubbles: true}));

            rowB.focus();
            fireFocusIn(rowB);
            captureTriggerForRoute('route-a');

            composer.remove();
            rowB.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(rowB);
        });

        it('does not latch during IME composition', () => {
            const composer = appendInput();
            const rowB = appendButton();
            composer.focus();

            const event = new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true});
            Object.defineProperty(event, 'isComposing', {value: true, configurable: true});
            document.dispatchEvent(event);

            rowB.focus();
            fireFocusIn(rowB);
            captureTriggerForRoute('route-a');

            composer.remove();
            rowB.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(rowB);
        });

        it('does not refresh the latch timestamp on auto-repeat Enter', () => {
            withFakeTimers(() => {
                const rowA = appendButton();
                const rowB = appendButton();
                rowA.focus();

                document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));

                // Auto-repeats fire at t=200 and t=600. Timestamp must NOT be refreshed by either.
                const repeat = new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true});
                Object.defineProperty(repeat, 'repeat', {value: true, configurable: true});
                jest.advanceTimersByTime(200);
                document.dispatchEvent(repeat);
                jest.advanceTimersByTime(400);
                document.dispatchEvent(repeat);

                rowB.focus();
                fireFocusIn(rowB);
                captureTriggerForRoute('route-a');
                rowA.remove();
                rowB.blur();
                expect(restoreTriggerForRoute('route-a')).toBe(true);
                expect(document.activeElement).toBe(rowB);
            });
        });

        it.each([['-1'], ['0']])('does not latch a bare div with tabindex=%s (non-interactive focus-only helper)', (tabindex) => {
            const helper = document.createElement('div');
            const rowB = appendButton();
            helper.setAttribute('tabindex', tabindex);
            document.body.appendChild(helper);
            helper.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));

            rowB.focus();
            fireFocusIn(rowB);
            captureTriggerForRoute('route-a');

            helper.remove();
            rowB.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(rowB);
        });

        it('does not latch a role=img with tabindex=0 (presentational focusable, non-interactive)', () => {
            const image = document.createElement('div');
            const rowB = appendButton();
            image.setAttribute('role', 'img');
            image.setAttribute('tabindex', '0');
            document.body.appendChild(image);
            image.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));

            rowB.focus();
            fireFocusIn(rowB);
            captureTriggerForRoute('route-a');

            image.remove();
            rowB.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(rowB);
        });

        it('latches a role=button with tabindex="-1" (roving-tabindex Pressable)', () => {
            const row = document.createElement('div');
            row.setAttribute('role', 'button');
            row.setAttribute('tabindex', '-1');
            document.body.appendChild(row);
            const destinationInput = appendInput();
            row.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));
            fireFocusIn(destinationInput);
            captureTriggerForRoute('route-a');

            destinationInput.remove();
            row.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(row);
        });

        it('two consecutive forward navigations do not reuse the first Enter latch', () => {
            const rowA = appendButton();
            handleStateChange(stackState(0, [{key: 'home', name: 'Home'}]));

            rowA.focus();
            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));
            handleStateChange(
                stackState(1, [
                    {key: 'home', name: 'Home'},
                    {key: 'route-a', name: 'A'},
                ]),
            );

            // Second forward has no fresh Enter. A leaked latch would replay rowA for route-a.
            handleStateChange(
                stackState(2, [
                    {key: 'home', name: 'Home'},
                    {key: 'route-a', name: 'A'},
                    {key: 'route-b', name: 'B'},
                ]),
            );

            rowA.blur();
            expect(restoreTriggerForRoute('home')).toBe(true);
            expect(restoreTriggerForRoute('route-a')).toBe(false);
        });

        it('lateral state change (top-tab switch) clears the latch', () => {
            const tabA = appendButton();
            const tabB = appendButton();

            tabA.focus();
            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));

            handleStateChange(
                stackState(0, [
                    {key: 'tab-a', name: 'TabA'},
                    {key: 'tab-b', name: 'TabB'},
                ]),
            );
            handleStateChange(
                stackState(1, [
                    {key: 'tab-a', name: 'TabA'},
                    {key: 'tab-b', name: 'TabB'},
                ]),
            );

            tabB.focus();
            fireFocusIn(tabB);
            captureTriggerForRoute('post-lateral-route');
            tabB.blur();
            expect(restoreTriggerForRoute('post-lateral-route')).toBe(true);
            expect(document.activeElement).toBe(tabB);
        });

        it('launcher-mediated capture combines the fresh latch as primary with the launcher as fallback', () => {
            const launcher = appendButton();
            const rowInsideTrap = appendButton();
            rowInsideTrap.focus();

            setActivePopoverLauncher(launcher);
            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));

            captureTriggerForRoute('route-a');

            // Row removed on trap close. Restore must fall back to launcher.
            rowInsideTrap.remove();
            const launcherSpy = jest.spyOn(launcher, 'focus');
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(launcherSpy).toHaveBeenCalled();
        });

        it('notifyPushParamsBackward clears the latch', () => {
            const rowA = appendButton();
            rowA.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));
            notifyPushParamsBackward('search', {q: 'A'});

            rowA.remove();
            const rowB = appendButton();
            rowB.focus();
            fireFocusIn(rowB);
            captureTriggerForRoute('post-back-route');
            rowB.blur();
            expect(restoreTriggerForRoute('post-back-route')).toBe(true);
            expect(document.activeElement).toBe(rowB);
        });

        it('notifyPushParamsBackward clears the latch even on the skipped-restore branch (form-submit goBack)', () => {
            const rowA = appendButton();
            rowA.focus();

            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));
            skipNextFocusRestore();
            notifyPushParamsBackward('search', {q: 'A'});

            rowA.remove();
            const rowB = appendButton();
            rowB.focus();
            fireFocusIn(rowB);
            captureTriggerForRoute('post-back-route');
            rowB.blur();
            expect(restoreTriggerForRoute('post-back-route')).toBe(true);
            expect(document.activeElement).toBe(rowB);
        });

        it('teardown removes the keydown listener', () => {
            teardownNavigationFocusReturn();

            const row = appendButton();
            row.focus();
            // Dispatched between teardown and setup. A leaked listener would set the latch here.
            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', code: 'Enter', bubbles: true}));
            setupNavigationFocusReturn();
            simulateTab();
            row.blur();

            captureTriggerForRoute('route-a');
            expect(restoreTriggerForRoute('route-a')).toBe(false);
        });
    });

    describe('modality: arrow and named keys preserve keyboard modality', () => {
        it.each(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown', 'Escape'])(
            'should still capture after Tab → %s → Enter (list-navigation flow)',
            (navKey) => {
                simulateTab();
                simulateKey(navKey);
                simulateKey('Enter');
                const trigger = document.createElement('button');
                document.body.appendChild(trigger);
                trigger.focus();
                setLastInteractiveElementForTests(trigger);

                captureTriggerForRoute('route-a');
                trigger.blur();
                expect(restoreTriggerForRoute('route-a')).toBe(true);
            },
        );

        it('should clear modality when user types printable characters', () => {
            simulateTab();
            simulateKey('a');
            const trigger = document.createElement('button');
            document.body.appendChild(trigger);
            setLastInteractiveElementForTests(trigger);

            captureTriggerForRoute('route-a');
            expect(restoreTriggerForRoute('route-a')).toBe(false);
        });

        it('should clear modality on Backspace / Delete', () => {
            simulateTab();
            simulateKey('Backspace');
            const trigger = document.createElement('button');
            document.body.appendChild(trigger);
            setLastInteractiveElementForTests(trigger);

            captureTriggerForRoute('route-a');
            expect(restoreTriggerForRoute('route-a')).toBe(false);
        });

        it('should clear modality on AltGraph printable chars (international layouts)', () => {
            simulateTab();
            // AltGr+Q on intl layouts → '@' with ctrlKey+altKey+AltGraph set.
            simulateKey('@', {ctrlKey: true, altKey: true, altGraph: true});
            const trigger = appendButton();
            setLastInteractiveElementForTests(trigger);

            captureTriggerForRoute('route-a');
            expect(restoreTriggerForRoute('route-a')).toBe(false);
        });

        it('should preserve modality for non-AltGraph Cmd/Ctrl shortcuts', () => {
            simulateTab();
            simulateKey('k', {metaKey: true});
            const trigger = appendButton();
            trigger.focus();
            setLastInteractiveElementForTests(trigger);

            captureTriggerForRoute('route-a');
            trigger.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
        });

        it('should not crash on synthesized keydown with undefined key (browser autofill / password managers)', () => {
            // Repro: autofill synthesizes a KeyboardEvent with `key: undefined`; without the guard, `e.key.length` throws out of the capture-phase listener.
            const event = new KeyboardEvent('keydown', {bubbles: true});
            Object.defineProperty(event, 'key', {value: undefined, configurable: true});
            expect(() => document.dispatchEvent(event)).not.toThrow();
        });
    });

    describe('when a popover launcher is active', () => {
        beforeEach(() => {
            simulateTab();
        });

        it('should capture the launcher even though a transient menu item holds focus', () => {
            const launcher = document.createElement('button');
            const menuItem = document.createElement('button');
            document.body.appendChild(launcher);
            document.body.appendChild(menuItem);
            // Simulate FocusTrapForModal.onActivate: registers launcher before blur.
            setActivePopoverLauncher(launcher);
            // Focus is now on a menu item inside the popover — the transient element.
            menuItem.focus();
            menuItem.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));

            captureTriggerForRoute('route-a');

            // Popover closes: menu item is removed from DOM, launcher survives.
            menuItem.remove();

            const launcherSpy = jest.spyOn(launcher, 'focus');
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(launcherSpy).toHaveBeenCalled();
        });

        it('should fall through to lastInteractiveElement when the launcher is gone', () => {
            const fallback = document.createElement('button');
            document.body.appendChild(fallback);
            fallback.focus();
            fallback.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));

            // Launcher registered but then removed from DOM before capture.
            const detachedLauncher = document.createElement('button');
            setActivePopoverLauncher(detachedLauncher);

            captureTriggerForRoute('route-a');
            fallback.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
        });

        it('should defer to lastInteractiveElement when the user moved on after popover closed', () => {
            const launcher = document.createElement('button');
            const otherButton = document.createElement('button');
            document.body.appendChild(launcher);
            document.body.appendChild(otherButton);

            // Popover opens then closes: launcher set, deferred clear pending.
            setActivePopoverLauncher(launcher);
            markActivePopoverLauncherDeactivated();

            // FocusTrap returnFocus puts focus on launcher first.
            launcher.focus();
            launcher.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
            // Then user Tabs to a different control.
            otherButton.focus();
            otherButton.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));

            captureTriggerForRoute('route-a');
            otherButton.blur();

            const launcherSpy = jest.spyOn(launcher, 'focus');
            const otherSpy = jest.spyOn(otherButton, 'focus');
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(otherSpy).toHaveBeenCalled();
            expect(launcherSpy).not.toHaveBeenCalled();
        });

        it('should still use the launcher while the popover is active even if focus is on a menu item', () => {
            const launcher = document.createElement('button');
            const menuItem = document.createElement('button');
            document.body.appendChild(launcher);
            document.body.appendChild(menuItem);

            // Popover still active: launcher set, no deferred clear scheduled.
            setActivePopoverLauncher(launcher);
            menuItem.focus();
            menuItem.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));

            captureTriggerForRoute('route-a');
            // Popover closes after the (synchronous) navigation — menu item gets removed.
            menuItem.remove();

            const launcherSpy = jest.spyOn(launcher, 'focus');
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(launcherSpy).toHaveBeenCalled();
        });

        it('should prefer the in-trap element when it survives the nav (long-lived trap with in-trap navigation)', () => {
            const launcher = appendButton(); // "Open side panel"
            const innerLink = appendButton(); // e.g. a help link inside the still-open trap
            setActivePopoverLauncher(launcher);
            innerLink.focus();
            innerLink.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));

            captureTriggerForRoute('route-a');
            // Long-lived trap: inner link stays in DOM across the navigation.
            innerLink.blur();

            const launcherSpy = jest.spyOn(launcher, 'focus');
            const innerSpy = jest.spyOn(innerLink, 'focus');
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(innerSpy).toHaveBeenCalled();
            expect(launcherSpy).not.toHaveBeenCalled();
        });

        it('should use the launcher fallback when primary is in DOM but cannot accept focus (aria-hidden)', () => {
            // Captured a primary (in-trap item) and a fallback (launcher). At restore time, primary is inside aria-hidden container.
            const launcher = appendButton();
            const hiddenWrapper = document.createElement('div');
            hiddenWrapper.setAttribute('aria-hidden', 'true');
            const primary = document.createElement('button');
            hiddenWrapper.appendChild(primary);
            document.body.appendChild(hiddenWrapper);
            setActivePopoverLauncher(launcher);
            primary.focus();
            primary.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));

            captureTriggerForRoute('route-a');

            const launcherSpy = jest.spyOn(launcher, 'focus');
            const primarySpy = jest.spyOn(primary, 'focus');
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(launcherSpy).toHaveBeenCalled();
            expect(primarySpy).not.toHaveBeenCalled();
        });

        it('captureTriggerForRoute consumes the picked launcher from the stack so a subsequent forward nav does not re-find it', () => {
            const launcher = appendButton();
            setActivePopoverLauncher(launcher);
            launcher.focus();
            launcher.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
            captureTriggerForRoute('route-a');

            // With launcher consumed, a second forward nav without re-opening a trap must see NO launcher: capture falls through to lastInteractiveElement path.
            const secondTrigger = appendButton();
            secondTrigger.focus();
            secondTrigger.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
            captureTriggerForRoute('route-b');

            // Detach secondTrigger so the map entry can only be restored via launcher-fallback if launcher was still on stack.
            secondTrigger.remove();
            launcher.blur();

            const launcherSpy = jest.spyOn(launcher, 'focus');
            // Second route has no fallback (launcher was consumed by the first capture), so restore must be 'gone' not 'launcher-focused'.
            expect(restoreTriggerForRoute('route-b')).toBe(false);
            expect(launcherSpy).not.toHaveBeenCalled();
        });
    });

    describe('when navigation is mouse-driven', () => {
        it('should store the clicked trigger (not lastInteractiveElement, which is a stale keyboard target)', () => {
            simulateTab();
            const staleKeyboardTarget = document.createElement('button');
            const clickedButton = document.createElement('button');
            document.body.appendChild(staleKeyboardTarget);
            document.body.appendChild(clickedButton);
            setLastInteractiveElementForTests(staleKeyboardTarget);
            simulateMouse();
            setLastMouseTriggerForTests(clickedButton);

            captureTriggerForRoute('route-a');

            const staleSpy = jest.spyOn(staleKeyboardTarget, 'focus');
            const clickedSpy = jest.spyOn(clickedButton, 'focus');
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(clickedSpy).toHaveBeenCalled();
            expect(staleSpy).not.toHaveBeenCalled();
        });

        it('should not store on a pure mouse session when no click target was recorded', () => {
            simulateMouse();
            captureTriggerForRoute('route-a');
            expect(restoreTriggerForRoute('route-a')).toBe(false);
        });

        it('should skip capture when the recorded click target has been removed from the DOM', () => {
            simulateMouse();
            const detached = document.createElement('button');
            setLastMouseTriggerForTests(detached);
            captureTriggerForRoute('route-a');
            expect(restoreTriggerForRoute('route-a')).toBe(false);
        });

        it('ignores lastMouseTrigger past its TTL so a timer-driven nav long after a click cannot reuse that click', () => {
            withFakeTimers(() => {
                const button = appendButton();
                button.dispatchEvent(new MouseEvent('pointerdown', {bubbles: true}));
                jest.advanceTimersByTime(11_000);

                captureTriggerForRoute('route-a');
                const spy = jest.spyOn(button, 'focus');
                expect(restoreTriggerForRoute('route-a')).toBe(false);
                expect(spy).not.toHaveBeenCalled();
            });
        });

        it('honors lastMouseTrigger within its TTL so typical click → deferred-nav still captures', () => {
            withFakeTimers(() => {
                const button = appendButton();
                button.dispatchEvent(new MouseEvent('pointerdown', {bubbles: true}));
                jest.advanceTimersByTime(2_000);

                captureTriggerForRoute('route-a');
                const spy = jest.spyOn(button, 'focus');
                expect(restoreTriggerForRoute('route-a')).toBe(true);
                expect(spy).toHaveBeenCalled();
            });
        });

        it('clears lastMouseTrigger on a non-focusable activation so a prior focusable click does not leak into the next capture', () => {
            // setupNavigationFocusReturn is installed at module load; dispatch pointerdown events through the real handler to exercise the update path.
            const earlierFocusable = appendButton();
            earlierFocusable.dispatchEvent(new MouseEvent('pointerdown', {bubbles: true}));

            // Next click hits a non-focusable wrapper (div with onClick, no role / no tabindex).
            const wrapper = document.createElement('div');
            document.body.appendChild(wrapper);
            wrapper.dispatchEvent(new MouseEvent('pointerdown', {bubbles: true}));

            // Navigation fires against the wrapper click — capture must not reach for the stale button.
            captureTriggerForRoute('route-a');
            const spy = jest.spyOn(earlierFocusable, 'focus');
            expect(restoreTriggerForRoute('route-a')).toBe(false);
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('cross-modality capture', () => {
        it('mouse-click forward then keyboard back: restore lands on the mouse-clicked trigger (WCAG 2.4.3 across modalities)', () => {
            const statusButton = appendButton();

            // User mouse-clicks Status on Profile — hadTab=false at the forward nav.
            simulateMouse();
            setLastMouseTriggerForTests(statusButton);
            captureTriggerForRoute('route-profile');

            // User switches to keyboard inside Status, Tabs to Clear after, Enters. Not relevant to the restore of the Profile route — we just verify the earlier capture survives.
            simulateTab();

            const spy = jest.spyOn(statusButton, 'focus');
            expect(restoreTriggerForRoute('route-profile')).toBe(true);
            expect(spy).toHaveBeenCalled();
        });

        it('mouse-click into a [contenteditable] region captures it as the trigger (rich-text composer / Markdown input)', () => {
            const editable = document.createElement('div');
            editable.setAttribute('contenteditable', 'true');
            document.body.appendChild(editable);
            editable.dispatchEvent(new MouseEvent('pointerdown', {bubbles: true}));

            captureTriggerForRoute('route-chat');
            const spy = jest.spyOn(editable, 'focus');
            expect(restoreTriggerForRoute('route-chat')).toBe(true);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('FIFO eviction', () => {
        beforeEach(() => {
            simulateTab();
        });

        it('evicts the oldest entry when triggerMap exceeds TRIGGER_MAP_MAX, preventing unbounded growth', () => {
            const TRIGGER_MAP_MAX = 64;
            const buttons: HTMLButtonElement[] = [];
            for (let i = 0; i < TRIGGER_MAP_MAX + 3; i += 1) {
                const btn = appendButton();
                buttons.push(btn);
                btn.focus();
                setLastInteractiveElementForTests(btn);
                captureTriggerForRoute(`route-${i}`);
                btn.blur();
            }
            expect(restoreTriggerForRoute('route-0')).toBe(false);
            expect(restoreTriggerForRoute('route-1')).toBe(false);
            expect(restoreTriggerForRoute('route-2')).toBe(false);

            const lastIdx = TRIGGER_MAP_MAX + 2;
            const last = buttons.at(lastIdx);
            if (!last) {
                throw new Error('setup failure: last button missing');
            }
            const lastSpy = jest.spyOn(last, 'focus');
            expect(restoreTriggerForRoute(`route-${lastIdx}`)).toBe(true);
            expect(lastSpy).toHaveBeenCalled();
        });

        it('re-setting the same route key refreshes insertion order so a still-active key is not evicted', () => {
            const TRIGGER_MAP_MAX = 64;
            const firstBtn = appendButton();
            firstBtn.focus();
            setLastInteractiveElementForTests(firstBtn);
            captureTriggerForRoute('route-persistent');
            firstBtn.blur();

            for (let i = 0; i < TRIGGER_MAP_MAX; i += 1) {
                if (i === TRIGGER_MAP_MAX - 10) {
                    // Re-set mid-fill so route-persistent moves to the tail.
                    firstBtn.focus();
                    setLastInteractiveElementForTests(firstBtn);
                    captureTriggerForRoute('route-persistent');
                    firstBtn.blur();
                }
                const btn = appendButton();
                btn.focus();
                setLastInteractiveElementForTests(btn);
                captureTriggerForRoute(`route-bulk-${i}`);
                btn.blur();
            }

            const spy = jest.spyOn(firstBtn, 'focus');
            expect(restoreTriggerForRoute('route-persistent')).toBe(true);
            expect(spy).toHaveBeenCalled();
        });
    });
});

describe('restoreTriggerForRoute', () => {
    beforeEach(() => {
        simulateTab();
    });

    it('should return false when no trigger is stored', () => {
        expect(restoreTriggerForRoute('unknown')).toBe(false);
    });

    it('should return false when the captured element has been removed', () => {
        const trigger = document.createElement('button');
        document.body.appendChild(trigger);
        setLastInteractiveElementForTests(trigger);
        captureTriggerForRoute('route-a');
        trigger.remove();

        expect(restoreTriggerForRoute('route-a')).toBe(false);
    });

    describe('trigger cannot accept focus', () => {
        function captureInsideWrapper(attr: string): HTMLButtonElement {
            const wrapper = document.createElement('div');
            wrapper.setAttribute(attr, attr === 'aria-hidden' ? 'true' : '');
            const trigger = document.createElement('button');
            wrapper.appendChild(trigger);
            document.body.appendChild(wrapper);
            trigger.focus();
            setLastInteractiveElementForTests(trigger);
            captureTriggerForRoute('route-a');
            trigger.blur();
            return trigger;
        }
        function captureBareButton(mutate?: (btn: HTMLButtonElement) => void): HTMLButtonElement {
            const trigger = appendButton();
            trigger.focus();
            setLastInteractiveElementForTests(trigger);
            captureTriggerForRoute('route-a');
            trigger.blur();
            mutate?.(trigger);
            return trigger;
        }
        it.each<[label: string, setup: () => HTMLButtonElement]>([
            [
                'disabled',
                () =>
                    captureBareButton((t) => {
                        // eslint-disable-next-line no-param-reassign
                        t.disabled = true;
                    }),
            ],
            ['aria-disabled="true"', () => captureBareButton((t) => t.setAttribute('aria-disabled', 'true'))],
            ['inside an aria-hidden container', () => captureInsideWrapper('aria-hidden')],
            ['inside an [inert] subtree', () => captureInsideWrapper('inert')],
        ])('should return false (and not take RETURN priority) when the trigger is %s', (_label, setup) => {
            const trigger = setup();
            const spy = jest.spyOn(trigger, 'focus');
            expect(restoreTriggerForRoute('route-a')).toBe(false);
            expect(spy).not.toHaveBeenCalled();
        });
    });

    it('should preserve the entry on transient aria-hidden so a later retry can restore it', () => {
        const hidden = document.createElement('div');
        hidden.setAttribute('aria-hidden', 'true');
        const trigger = document.createElement('button');
        hidden.appendChild(trigger);
        document.body.appendChild(hidden);
        trigger.focus();
        setLastInteractiveElementForTests(trigger);
        captureTriggerForRoute('route-a');
        trigger.blur();

        expect(restoreTriggerForRoute('route-a')).toBe(false);

        hidden.removeAttribute('aria-hidden');

        const spy = jest.spyOn(trigger, 'focus');
        expect(restoreTriggerForRoute('route-a')).toBe(true);
        expect(spy).toHaveBeenCalled();
    });

    it('should preempt an earlier AUTO/INITIAL focus via the arbiter', () => {
        const trigger = document.createElement('button');
        const other = document.createElement('input');
        document.body.appendChild(trigger);
        document.body.appendChild(other);
        setLastInteractiveElementForTests(trigger);
        trigger.focus();
        captureTriggerForRoute('route-a');
        // AUTO claims and focuses — RETURN must preempt because cycle is held (system-driven, not user-driven).
        expect(tryClaim(Priorities.AUTO)).toBe(true);
        other.focus();

        const spy = jest.spyOn(trigger, 'focus');
        expect(restoreTriggerForRoute('route-a')).toBe(true);
        expect(spy).toHaveBeenCalled();
    });

    it('should release the arbiter cycle when all focus candidates silently no-op (neither primary nor fallback actually received focus)', () => {
        // Mimic display:none-style silent focus failure by stubbing .focus() on both candidates.
        const launcher = appendButton();
        const primary = appendButton();
        setActivePopoverLauncher(launcher);
        primary.focus();
        primary.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
        captureTriggerForRoute('route-a');

        primary.blur();
        jest.spyOn(primary, 'focus').mockImplementation(() => {});
        jest.spyOn(launcher, 'focus').mockImplementation(() => {});

        expect(restoreTriggerForRoute('route-a')).toBe(false);
        // Cycle was released — a subsequent AUTO claim must succeed.
        expect(tryClaim(Priorities.AUTO)).toBe(true);
    });

    it('should preserve the trigger entry on silent-focus failure so a retry attempt can succeed (transient display:none resolves mid-transition)', () => {
        const trigger = appendButton();
        trigger.focus();
        setLastInteractiveElementForTests(trigger);
        captureTriggerForRoute('route-a');
        trigger.blur();

        // First attempt: .focus() silently no-ops; entry must survive.
        const focusSpy = jest.spyOn(trigger, 'focus').mockImplementation(() => {});
        expect(restoreTriggerForRoute('route-a')).toBe(false);
        expect(focusSpy).toHaveBeenCalledTimes(1);

        // Transient state resolves — retry lands.
        focusSpy.mockRestore();
        const secondSpy = jest.spyOn(trigger, 'focus');
        expect(restoreTriggerForRoute('route-a')).toBe(true);
        expect(secondSpy).toHaveBeenCalled();
    });

    it('should NOT steal focus when the user manually focused something during the deferred restore window', () => {
        // Forward capture establishes a trigger; backward nav schedules a restore. Between defer and execute, the user clicks/Tabs to a different element. Restore must respect that.
        const trigger = appendButton();
        const userTarget = appendInput();
        trigger.focus();
        setLastInteractiveElementForTests(trigger);
        captureTriggerForRoute('route-a');

        // Simulate the deferred-restore window — cycle was reset by handleStateChange (idle), then user manually focuses the input.
        userTarget.focus();
        expect(document.activeElement).toBe(userTarget);

        const triggerSpy = jest.spyOn(trigger, 'focus');
        expect(restoreTriggerForRoute('route-a')).toBe(false);
        expect(triggerSpy).not.toHaveBeenCalled();
        expect(document.activeElement).toBe(userTarget);
    });

    it('should still preempt AUTO when the cycle was claimed mid-defer (Status → Clear after race; user-respect must NOT regress this)', () => {
        // AUTO claim during the deferred window means the focus is system-driven, not user-driven. RETURN must still preempt per priority contract.
        const trigger = appendButton();
        const messageInput = appendInput();
        trigger.focus();
        setLastInteractiveElementForTests(trigger);
        captureTriggerForRoute('route-a');

        // Simulate AUTO claiming and focusing during the deferred window (cycle held, not idle).
        expect(tryClaim(Priorities.AUTO)).toBe(true);
        messageInput.focus();

        const triggerSpy = jest.spyOn(trigger, 'focus');
        expect(restoreTriggerForRoute('route-a')).toBe(true);
        expect(triggerSpy).toHaveBeenCalled();
    });

    it('should still preempt AUTO even after useAccessibilityFocus tail-resetCycle idles the cycle — recognize the programmatic-focus marker as app-driven', () => {
        const trigger = appendButton();
        const autoTarget = appendInput();
        trigger.focus();
        setLastInteractiveElementForTests(trigger);
        captureTriggerForRoute('route-a');

        tryClaim(Priorities.AUTO);
        autoTarget.setAttribute('data-programmatic-focus', 'true');
        autoTarget.focus();
        resetArbiter();

        const triggerSpy = jest.spyOn(trigger, 'focus');
        expect(restoreTriggerForRoute('route-a')).toBe(true);
        expect(triggerSpy).toHaveBeenCalled();
    });

    it('releases the cycle at RETURN_HOLD_MS when the user has moved focus elsewhere so unrelated later AUTO claims are not blocked for 2s', () => {
        withFakeTimers(() => {
            const trigger = appendButton();
            const other = appendInput();
            trigger.focus();
            setLastInteractiveElementForTests(trigger);
            captureTriggerForRoute('route-a');
            trigger.blur();

            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(tryClaim(Priorities.AUTO)).toBe(false);

            // User moves on before hold fires.
            other.focus();

            jest.advanceTimersByTime(600);
            expect(tryClaim(Priorities.AUTO)).toBe(true);
        });
    });

    it('KEEPS the hold past RETURN_HOLD_MS when the restored target still holds focus — closes the late-AUTO steal race', () => {
        withFakeTimers(() => {
            const trigger = appendButton();
            trigger.focus();
            setLastInteractiveElementForTests(trigger);
            captureTriggerForRoute('route-a');
            trigger.blur();

            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(trigger);

            jest.advanceTimersByTime(600);
            expect(tryClaim(Priorities.AUTO)).toBe(false);

            // Arbiter's own 2s lazy timeout eventually releases.
            jest.advanceTimersByTime(1500);
            expect(tryClaim(Priorities.AUTO)).toBe(true);
        });
    });

    it('should cancel a pending return-hold timer when a new navigation starts so stale timers do not wipe the new cycle', () => {
        withFakeTimers(() => {
            // Seed prevState so the post-restore handleStateChange diffs as non-noop.
            handleStateChange(stackState(0, [{key: 'route-a', name: 'A'}]));

            const trigger = appendButton();
            trigger.focus();
            setLastInteractiveElementForTests(trigger);
            captureTriggerForRoute('route-a');
            trigger.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);

            // New nav 100ms later. handleStateChange must cancel the stale return-hold timer along with resetCycle.
            jest.advanceTimersByTime(100);
            handleStateChange(stackState(0, [{key: 'other', name: 'Other'}]));
            expect(tryClaim(Priorities.AUTO)).toBe(true);

            // Stale 500ms timer must NOT wipe AUTO later.
            jest.advanceTimersByTime(1000);
            expect(tryClaim(Priorities.INITIAL)).toBe(false);
        });
    });

    it('clears completed RETURN hold/cycle on browser-forward RESET so the destination screen can claim AUTO/INITIAL', () => {
        withFakeTimers(() => {
            const trigger = appendButton();
            trigger.focus();
            setLastInteractiveElementForTests(trigger);
            captureTriggerForRoute('route-a');
            trigger.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(trigger);

            // Pre-cancel: RETURN claimed, AUTO blocked.
            expect(tryClaim(Priorities.AUTO)).toBe(false);
            expect(shouldSkipAutoFocusDueToExistingFocus()).toBe(true);

            cancelPendingFocusRestore();

            expect(tryClaim(Priorities.AUTO)).toBe(true);
            expect(shouldSkipAutoFocusDueToExistingFocus()).toBe(false);
        });
    });

    it('clears a stale AUTO claimed during the deferred-restore window when an in-flight restore is cancelled (PUSH_PARAMS forward / unknown RESET race)', () => {
        withFakeTimers(() => {
            const trigger = appendButton();
            trigger.focus();
            setLastInteractiveElementForTests(trigger);
            captureTriggerForRoute(compoundParamsKey('search', {q: 'A'}));
            trigger.blur();

            // Queue restore; don't advance timers so it stays in-flight (lastRestoreTarget unset).
            notifyPushParamsBackward('search', {q: 'A'});
            // AUTO grabs the cycle during the deferred window.
            expect(tryClaim(Priorities.AUTO)).toBe(true);
            expect(tryClaim(Priorities.INITIAL)).toBe(false);

            notifyPushParamsForward('search', {q: 'B'});

            expect(tryClaim(Priorities.INITIAL)).toBe(true);
        });
    });

    it('clears completed RETURN hold/cycle on PUSH_PARAMS forward so the next params screen can claim AUTO/INITIAL', () => {
        withFakeTimers(() => {
            const trigger = appendButton();
            trigger.focus();
            setLastInteractiveElementForTests(trigger);
            captureTriggerForRoute(compoundParamsKey('search', {q: 'A'}));
            trigger.blur();
            expect(restoreTriggerForRoute(compoundParamsKey('search', {q: 'A'}))).toBe(true);
            expect(document.activeElement).toBe(trigger);
            expect(tryClaim(Priorities.AUTO)).toBe(false);
            expect(shouldSkipAutoFocusDueToExistingFocus()).toBe(true);

            // User activates another same-route PUSH_PARAMS forward while the restored trigger still has focus.
            notifyPushParamsForward('search', {q: 'B'});

            expect(tryClaim(Priorities.AUTO)).toBe(true);
            expect(shouldSkipAutoFocusDueToExistingFocus()).toBe(false);
        });
    });

    it('preserves an in-flight RETURN hold across a noop state update (e.g. setParams on the focused route)', () => {
        withFakeTimers(() => {
            // Seed prevState so the post-restore handleStateChange diffs as 'noop' (same focused key).
            handleStateChange(stackState(0, [{key: 'route-a', name: 'A'}]));

            const trigger = appendButton();
            trigger.focus();
            setLastInteractiveElementForTests(trigger);
            captureTriggerForRoute('route-a');
            trigger.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(document.activeElement).toBe(trigger);

            // Noop update (e.g. setParams on the same focused route) must NOT wipe the RETURN hold/cycle.
            handleStateChange(stackState(0, [{key: 'route-a', name: 'A'}]));
            expect(tryClaim(Priorities.AUTO)).toBe(false);
        });
    });

    it('should respect an onFocus redirect and not override by trying the fallback', () => {
        // Captured primary has an onFocus handler that redirects focus to a composite-widget's internal element.
        // Our post-focus check must see "focus moved somewhere non-body" and treat it as success, not try the fallback and override the redirect.
        const launcher = appendButton();
        const primary = appendButton();
        const redirectTarget = appendButton();
        setActivePopoverLauncher(launcher);
        primary.focus();
        primary.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
        captureTriggerForRoute('route-a');
        primary.blur();

        // Primary's .focus() handler redirects focus to redirectTarget (simulating a composite widget).
        jest.spyOn(primary, 'focus').mockImplementation(() => {
            redirectTarget.focus();
        });
        const launcherSpy = jest.spyOn(launcher, 'focus');

        expect(restoreTriggerForRoute('route-a')).toBe(true);
        expect(document.activeElement).toBe(redirectTarget);
        expect(launcherSpy).not.toHaveBeenCalled();
    });

    it('re-seeds the redirect target (not the captured primary) as the trigger candidate for the next round trip', () => {
        // Mouse modality: focusin does not re-record the restored element, so seedTriggerCandidate is the only source.
        simulateMouse();
        const primary = appendButton();
        const redirectTarget = appendButton();
        setLastMouseTriggerForTests(primary);
        captureTriggerForRoute('route-a');

        // Primary's .focus() handler redirects focus to redirectTarget (simulating a composite widget).
        const focusSpy = jest.spyOn(primary, 'focus').mockImplementation(() => {
            redirectTarget.focus();
        });
        expect(restoreTriggerForRoute('route-a')).toBe(true);
        expect(document.activeElement).toBe(redirectTarget);
        focusSpy.mockRestore();

        // Second round trip, no click in between. The capture must reach for the element that actually holds focus,
        // not the primary whose onFocus bounced away from it.
        redirectTarget.blur();
        captureTriggerForRoute('route-b');
        expect(restoreTriggerForRoute('route-b')).toBe(true);
        expect(document.activeElement).toBe(redirectTarget);
    });

    it('must not treat pre-existing non-body focus as an onFocus redirect when the candidate silently no-ops', () => {
        const launcher = appendButton();
        const primary = appendButton();
        const preExistingInput = appendInput();
        setActivePopoverLauncher(launcher);
        primary.focus();
        primary.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
        captureTriggerForRoute('route-a');
        primary.blur();

        // Simulate AUTO having already claimed and focused an input on the destination screen before RETURN fires.
        expect(tryClaim(Priorities.AUTO)).toBe(true);
        preExistingInput.focus();

        // Primary's .focus() is a silent no-op (simulates display:none / visibility:hidden).
        jest.spyOn(primary, 'focus').mockImplementation(() => {});
        const launcherSpy = jest.spyOn(launcher, 'focus');

        // Fallback (launcher) is in the DOM and accepts focus — restore should try it.
        expect(restoreTriggerForRoute('route-a')).toBe(true);
        expect(launcherSpy).toHaveBeenCalled();
    });

    it('should restore without scrolling the viewport (preventScroll must be preserved)', () => {
        const trigger = appendButton();
        trigger.focus();
        setLastInteractiveElementForTests(trigger);
        captureTriggerForRoute('route-a');
        trigger.blur();

        const focusSpy = jest.spyOn(trigger, 'focus');
        expect(restoreTriggerForRoute('route-a')).toBe(true);
        expect(focusSpy).toHaveBeenCalledWith(expect.objectContaining({preventScroll: true}));
    });

    it("Status → Clear after → Esc: restores to 'Clear after' even when Status AUTO-focuses the Message input", () => {
        withFakeTimers(() => {
            // Exercise the real runtime path: forward+backward handleStateChange with scheduled restore.
            const onStatus = stackState(0, [{key: 'status', name: 'Status'}]);
            const onStatusClearAfter = stackState(1, [
                {key: 'status', name: 'Status'},
                {key: 'clear-after', name: 'ClearAfter'},
            ]);
            const messageInput = appendInput(); // Status page auto-focus target
            const clearAfterButton = appendButton(); // the trigger

            simulateTab();
            handleStateChange(onStatus);

            // User Tab+Enters "Clear after" → forward nav captures the trigger against the Status route.
            fireFocusIn(clearAfterButton);
            handleStateChange(onStatusClearAfter);
            clearAfterButton.blur();

            // User presses Esc → backward nav schedules a restore for Status.
            handleStateChange(onStatus);

            // Before the scheduled restore fires, Status's useAutoFocusInput races ahead and claims AUTO on Message.
            expect(tryClaim(Priorities.AUTO)).toBe(true);

            const messageSpy = jest.spyOn(messageInput, 'focus');
            const clearSpy = jest.spyOn(clearAfterButton, 'focus');

            // Scheduled restore fires; RETURN preempts AUTO and focus lands on "Clear after", not the Message input.
            flushTransitions();
            expect(clearSpy).toHaveBeenCalled();
            expect(messageSpy).not.toHaveBeenCalled();
        });
    });

    it('post-RETURN_HOLD: a late-firing AUTO must not steal focus from the restored trigger (useAutoFocusInput activeElement guard)', () => {
        withFakeTimers(() => {
            const onStatus = stackState(0, [{key: 'status', name: 'Status'}]);
            const onStatusClearAfter = stackState(1, [
                {key: 'status', name: 'Status'},
                {key: 'clear-after', name: 'ClearAfter'},
            ]);
            const messageInput = appendInput();
            const clearAfterButton = appendButton();

            // Forward capture: Tab+Enter on "Clear after" stores it against the Status route.
            simulateTab();
            handleStateChange(onStatus);
            fireFocusIn(clearAfterButton);
            handleStateChange(onStatusClearAfter);
            clearAfterButton.blur();

            // Esc → backward → scheduled restore refocuses Clear after. Hold extends because the target is still focused.
            handleStateChange(onStatus);
            flushTransitions();
            expect(document.activeElement).toBe(clearAfterButton);

            // Late useAutoFocusInput: the guard catches it before it reaches tryClaim.
            const messageSpy = jest.spyOn(messageInput, 'focus');
            const guardSaysSkip = shouldSkipAutoFocusDueToExistingFocus();
            expect(guardSaysSkip).toBe(true);
            if (!guardSaysSkip && tryClaim(Priorities.AUTO)) {
                messageInput.focus();
            }

            expect(messageSpy).not.toHaveBeenCalled();
            expect(document.activeElement).toBe(clearAfterButton);
        });
    });

    it('stack-pop restore fires synchronously inside the transition callback (no rAF defer)', () => {
        withFakeTimers(() => {
            simulateTab();
            const trigger = appendButton();
            fireFocusIn(trigger);
            handleStateChange(stackState(0, [{key: 'route-a', name: 'A'}]));
            handleStateChange(
                stackState(1, [
                    {key: 'route-a', name: 'A'},
                    {key: 'route-b', name: 'B'},
                ]),
            );
            trigger.blur();
            handleStateChange(stackState(0, [{key: 'route-a', name: 'A'}]));
            const spy = jest.spyOn(trigger, 'focus');
            flushTransitions();
            expect(spy).toHaveBeenCalled();
        });
    });

    it('should consume the entry so a second restore returns false', () => {
        const trigger = document.createElement('button');
        document.body.appendChild(trigger);
        trigger.focus();
        setLastInteractiveElementForTests(trigger);
        captureTriggerForRoute('route-a');
        trigger.blur();

        expect(restoreTriggerForRoute('route-a')).toBe(true);
        trigger.blur();
        expect(restoreTriggerForRoute('route-a')).toBe(false);
    });

    it.each<[modality: string, beforeRestore: () => void, expectedFocusVisible: boolean]>([
        ['keyboard', () => {}, true],
        ['mouse', () => simulateMouse(), false],
    ])('should pass focusVisible=%s when modality at restore time is %s', (_modality, beforeRestore, expectedFocusVisible) => {
        simulateTab();
        const trigger = appendButton();
        trigger.focus();
        setLastInteractiveElementForTests(trigger);
        captureTriggerForRoute('route-a');
        trigger.blur();
        beforeRestore();

        const spy = jest.spyOn(trigger, 'focus');
        expect(restoreTriggerForRoute('route-a')).toBe(true);
        expect(spy).toHaveBeenCalledWith({preventScroll: true, focusVisible: expectedFocusVisible});
    });
});

describe('isFocusRestoreInProgress', () => {
    beforeEach(() => {
        simulateTab();
    });

    it('is false normally, true synchronously inside the restore .focus(), and false again after', () => {
        const trigger = appendButton();
        trigger.focus();
        setLastInteractiveElementForTests(trigger);
        captureTriggerForRoute('route-a');
        trigger.blur();

        expect(isFocusRestoreInProgress()).toBe(false);

        // Lists read this in the row's onFocus, which fires synchronously during .focus().
        let valueDuringFocus: boolean | undefined;
        trigger.addEventListener('focus', () => {
            valueDuringFocus = isFocusRestoreInProgress();
        });

        expect(restoreTriggerForRoute('route-a')).toBe(true);

        expect(valueDuringFocus).toBe(true);
        expect(isFocusRestoreInProgress()).toBe(false);
    });

    it('stays false for a focus not driven by restoreTriggerForRoute (e.g. genuine keyboard Tab)', () => {
        const el = appendButton();
        let valueDuringFocus: boolean | undefined;
        el.addEventListener('focus', () => {
            valueDuringFocus = isFocusRestoreInProgress();
        });
        el.focus();
        expect(valueDuringFocus).toBe(false);
    });

    it('resets to false even when .focus() throws', () => {
        const trigger = appendButton();
        trigger.focus();
        setLastInteractiveElementForTests(trigger);
        captureTriggerForRoute('route-a');
        trigger.blur();
        jest.spyOn(trigger, 'focus').mockImplementation(() => {
            throw new Error('boom');
        });

        expect(() => restoreTriggerForRoute('route-a')).toThrow('boom');
        expect(isFocusRestoreInProgress()).toBe(false);
    });
});

describe('shouldSkipAutoFocusDueToExistingFocus', () => {
    function performRestore(): HTMLButtonElement {
        const trigger = appendButton();
        simulateTab();
        trigger.focus();
        setLastInteractiveElementForTests(trigger);
        captureTriggerForRoute('route-a');
        trigger.blur();
        expect(restoreTriggerForRoute('route-a')).toBe(true);
        // Reset arbiter so subsequent AUTO claims aren't blocked by the RETURN cycle.
        resetArbiter();
        return trigger;
    }

    it('returns false when body holds focus (nothing else claimed)', () => {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        expect(shouldSkipAutoFocusDueToExistingFocus()).toBe(false);
    });

    it('returns false when activeElement is NOT the restored target (e.g. LHN item still focused on forward nav)', () => {
        // Reviewer scenario: clicking a sidebar item to open a screen leaves the sidebar item focused. AUTO must NOT skip — the focus is benign, not a RETURN-restored target.
        const lhnItem = appendButton();
        lhnItem.focus();
        expect(shouldSkipAutoFocusDueToExistingFocus()).toBe(false);
    });

    it('returns true when activeElement IS the most recent RETURN-restored target', () => {
        const trigger = performRestore();
        expect(document.activeElement).toBe(trigger);
        expect(shouldSkipAutoFocusDueToExistingFocus()).toBe(true);
    });

    it('returns true when activeElement is a descendant of the RETURN-restored target (e.g. composite widget redirected focus inward)', () => {
        const trigger = performRestore();
        const child = document.createElement('input');
        trigger.appendChild(child);
        child.focus();
        expect(shouldSkipAutoFocusDueToExistingFocus()).toBe(true);
    });

    it('returns false when restored target was wiped by a subsequent navigation (handleStateChange clears lastRestoreTarget)', () => {
        // Seed prevState so the post-restore handleStateChange diffs as non-noop.
        handleStateChange(stackState(0, [{key: 'route-a', name: 'A'}]));
        const trigger = performRestore();
        handleStateChange(stackState(0, [{key: 'next', name: 'Next'}]));
        trigger.focus();
        expect(shouldSkipAutoFocusDueToExistingFocus()).toBe(false);
    });

    it('returns false when restored target is inside an [aria-hidden] ancestor (transitioning-out screen)', () => {
        const hiddenScreen = document.createElement('div');
        hiddenScreen.setAttribute('aria-hidden', 'true');
        const trigger = document.createElement('button');
        hiddenScreen.appendChild(trigger);
        document.body.appendChild(hiddenScreen);
        simulateTab();
        trigger.focus();
        setLastInteractiveElementForTests(trigger);
        captureTriggerForRoute('route-a');
        trigger.blur();
        // pickRestoreTarget returns 'retry' for aria-hidden — restore returns false. Force lastRestoreTarget by removing the wrapper temporarily, restoring, then re-attaching.
        hiddenScreen.removeAttribute('aria-hidden');
        expect(restoreTriggerForRoute('route-a')).toBe(true);
        resetArbiter();
        hiddenScreen.setAttribute('aria-hidden', 'true');
        trigger.focus();
        expect(shouldSkipAutoFocusDueToExistingFocus()).toBe(false);
    });

    it.each<[label: string, prop: 'display' | 'visibility', value: string]>([
        ['display:none', 'display', 'none'],
        ['visibility:hidden', 'visibility', 'hidden'],
    ])('returns false when restored target became %s after restore (transition-out straggler)', (_label, prop, value) => {
        const trigger = performRestore();
        trigger.style[prop] = value;
        expect(shouldSkipAutoFocusDueToExistingFocus()).toBe(false);
    });

    it('returns false when an ANCESTOR of the restored target has display:none (getComputedStyle reports element-self only — needs ancestor walk)', () => {
        const ancestor = document.createElement('div');
        const trigger = document.createElement('button');
        ancestor.appendChild(trigger);
        document.body.appendChild(ancestor);
        simulateTab();
        trigger.focus();
        setLastInteractiveElementForTests(trigger);
        captureTriggerForRoute('route-a');
        trigger.blur();
        expect(restoreTriggerForRoute('route-a')).toBe(true);
        resetArbiter();
        // Hide the ancestor — `getComputedStyle(trigger).display` still reports the element's own visible value.
        ancestor.style.display = 'none';
        trigger.focus();
        expect(shouldSkipAutoFocusDueToExistingFocus()).toBe(false);
    });
});

describe('hasFocusableAttributes', () => {
    it('returns true for a plain button', () => {
        const btn = document.createElement('button');
        document.body.appendChild(btn);
        expect(hasFocusableAttributes(btn)).toBe(true);
    });

    it.each<[label: string, mutate: (wrapper: HTMLElement, btn: HTMLButtonElement) => void]>([
        [
            'disabled',
            (_, btn) => {
                // eslint-disable-next-line no-param-reassign
                btn.disabled = true;
            },
        ],
        ['aria-disabled="true"', (_, btn) => btn.setAttribute('aria-disabled', 'true')],
        ['inside an [aria-hidden="true"] ancestor', (wrapper) => wrapper.setAttribute('aria-hidden', 'true')],
        ['inside an [inert] ancestor', (wrapper) => wrapper.setAttribute('inert', '')],
    ])('returns false when %s', (_label, mutate) => {
        const wrapper = document.createElement('div');
        const btn = document.createElement('button');
        wrapper.appendChild(btn);
        document.body.appendChild(wrapper);
        mutate(wrapper, btn);
        expect(hasFocusableAttributes(btn)).toBe(false);
    });
});

describe('focusin listener', () => {
    it('should update the tracked element when Tab was used', () => {
        simulateTab();
        const button = document.createElement('button');
        document.body.appendChild(button);
        button.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
        button.focus();

        captureTriggerForRoute('route-a');
        button.blur();
        expect(restoreTriggerForRoute('route-a')).toBe(true);
    });

    it('should ignore focusin when user is clicking with mouse', () => {
        simulateMouse();
        const button = document.createElement('button');
        document.body.appendChild(button);
        button.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
        button.focus();

        captureTriggerForRoute('route-a');
        button.blur();
        expect(restoreTriggerForRoute('route-a')).toBe(false);
    });

    it('should ignore focusin when user is typing', () => {
        simulateTab();
        simulateTyping();
        const button = document.createElement('button');
        document.body.appendChild(button);
        button.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
        button.focus();

        captureTriggerForRoute('route-a');
        button.blur();
        expect(restoreTriggerForRoute('route-a')).toBe(false);
    });

    it('should ignore focusin on body', () => {
        simulateTab();
        setLastInteractiveElementForTests(null);
        document.body.dispatchEvent(new FocusEvent('focusin', {bubbles: true, target: document.body} as FocusEventInit));

        captureTriggerForRoute('route-a');
        expect(restoreTriggerForRoute('route-a')).toBe(false);
    });
});

describe('handleStateChange integration', () => {
    const onA = stackState(0, [{key: 'a', name: 'A'}]);
    const onAB = stackState(1, [
        {key: 'a', name: 'A'},
        {key: 'b', name: 'B'},
    ]);

    it('should capture the tracked element on forward navigation', () => {
        simulateTab();
        handleStateChange(onA);

        const trigger = appendButton();
        fireFocusIn(trigger);

        handleStateChange(onAB);

        trigger.blur();
        handleStateChange(onA);
        jest.runAllTimers();

        // Either the scheduled restore fired or we consume it manually — both prove capture happened.
        const stored = restoreTriggerForRoute('a');
        expect(stored || document.activeElement === trigger).toBe(true);
    });

    it('restores on every round trip when the navigation is keyboard-shortcut driven in mouse modality (issue #99569)', () => {
        withFakeTimers(() => {
            handleStateChange(onA);

            // User clicks into a composer and types, which puts us in mouse modality, so focusin never
            // records lastInteractiveElement, and Cmd+Shift+K latches no Enter/Space activation.
            const composer = document.createElement('textarea');
            document.body.appendChild(composer);
            composer.dispatchEvent(new MouseEvent('pointerdown', {bubbles: true}));
            composer.focus();

            // Round trip 1: open the RHP with the shortcut, then click Back.
            handleStateChange(onAB);
            const backButton = appendButton();
            backButton.dispatchEvent(new MouseEvent('pointerdown', {bubbles: true}));
            backButton.remove();
            composer.blur();
            handleStateChange(onA);
            flushTransitions();
            expect(document.activeElement).toBe(composer);

            // Round trip 2: the shortcut again, with no click on the composer in between. The backward transition
            // cleared the click-tracked trigger, so only the restore's re-seed can supply it.
            handleStateChange(onAB);
            composer.blur();
            handleStateChange(onA);
            flushTransitions();
            expect(document.activeElement).toBe(composer);
        });
    });

    it('should do nothing when the focused route has not changed', () => {
        simulateTab();
        handleStateChange(onA);

        const trigger = appendButton();
        setLastInteractiveElementForTests(trigger);

        handleStateChange(onA);
        expect(restoreTriggerForRoute('a')).toBe(false);
    });

    it('should preserve a queued restore when a noop state change (same focused route) arrives', () => {
        withFakeTimers(() => {
            simulateTab();
            handleStateChange(onA);

            const trigger = appendButton();
            fireFocusIn(trigger);

            handleStateChange(onAB);

            trigger.blur();
            handleStateChange(onA);

            // Noop (e.g. setParams on the already-focused route) — pending restore must survive.
            handleStateChange(onA);

            const spy = jest.spyOn(trigger, 'focus');
            flushTransitions();
            expect(spy).toHaveBeenCalled();
        });
    });

    it('clears an armed skipNextFocusRestore on a noop navigation so a later real Back still restores focus', () => {
        withFakeTimers(() => {
            simulateTab();
            handleStateChange(onA);

            const trigger = appendButton();
            fireFocusIn(trigger);
            handleStateChange(onAB);
            trigger.blur();

            skipNextFocusRestore();
            handleStateChange(onAB);

            const spy = jest.spyOn(trigger, 'focus');
            handleStateChange(onA);
            flushTransitions();
            expect(spy).toHaveBeenCalled();
        });
    });

    it('skipNextFocusRestore suppresses the restore for the next backward nav only (form-submit goBack), then resumes', () => {
        withFakeTimers(() => {
            simulateTab();
            handleStateChange(onA);

            const trigger = appendButton();
            fireFocusIn(trigger);
            handleStateChange(onAB);
            trigger.blur();

            skipNextFocusRestore();
            const spy = jest.spyOn(trigger, 'focus');
            handleStateChange(onA);
            flushTransitions();
            expect(spy).not.toHaveBeenCalled();

            // The flag is one-shot: a fresh capture + Back-button dismissal restores normally.
            fireFocusIn(trigger);
            handleStateChange(onAB);
            trigger.blur();
            handleStateChange(onA);
            flushTransitions();
            expect(spy).toHaveBeenCalled();
        });
    });

    it('skipNextFocusRestore drops the entry, so a later same-key backward without re-capture does not replay a stale trigger', () => {
        withFakeTimers(() => {
            simulateTab();
            handleStateChange(onA);

            const trigger = appendButton();
            fireFocusIn(trigger);
            handleStateChange(onAB);
            trigger.blur();

            skipNextFocusRestore();
            handleStateChange(onA);
            flushTransitions();

            const spy = jest.spyOn(trigger, 'focus');
            handleStateChange(onAB);
            trigger.blur();
            handleStateChange(onA);
            flushTransitions();
            expect(spy).not.toHaveBeenCalled();
        });
    });

    it('skipNextFocusRestore flag is cleared by an intervening forward nav so it cannot leak into a later backward', () => {
        withFakeTimers(() => {
            simulateTab();
            handleStateChange(onA);

            const trigger = appendButton();
            fireFocusIn(trigger);

            skipNextFocusRestore();
            handleStateChange(onAB);

            trigger.blur();
            const spy = jest.spyOn(trigger, 'focus');
            handleStateChange(onA);
            flushTransitions();
            expect(spy).toHaveBeenCalled();
        });
    });

    it('should cancel a queued restore when a lateral tab switch arrives before it fires', () => {
        withFakeTimers(() => {
            simulateTab();
            const onTab1 = stackState(0, [
                {key: 'tab-1', name: 'Tab1'},
                {key: 'tab-2', name: 'Tab2'},
            ]);
            handleStateChange(onTab1);

            const trigger = appendButton();
            fireFocusIn(trigger);

            // Push a child onto tab-1 so the subsequent pop is a real backward nav.
            const onTab1Child = stackState(0, [
                {
                    key: 'tab-1',
                    name: 'Tab1',
                    state: stackState(1, [
                        {key: 'tab-1-root', name: 'Root'},
                        {key: 'tab-1-child', name: 'Child'},
                    ]),
                },
                {key: 'tab-2', name: 'Tab2'},
            ]);
            handleStateChange(onTab1Child);

            trigger.blur();
            handleStateChange(onTab1);

            const onTab2 = stackState(1, [
                {key: 'tab-1', name: 'Tab1'},
                {key: 'tab-2', name: 'Tab2'},
            ]);
            handleStateChange(onTab2);

            const spy = jest.spyOn(trigger, 'focus');
            flushTransitions();
            expect(spy).not.toHaveBeenCalled();
        });
    });

    it('should cancel a queued restore when a new state change arrives before it fires', () => {
        withFakeTimers(() => {
            simulateTab();
            handleStateChange(onA);

            const trigger = appendButton();
            fireFocusIn(trigger);

            handleStateChange(onAB);

            trigger.blur();
            handleStateChange(onA);

            // Forward nav arrives before the queued restore fires (e.g. dismissModalWithReport).
            const onAC = stackState(1, [
                {key: 'a', name: 'A'},
                {key: 'c', name: 'C'},
            ]);
            handleStateChange(onAC);

            const spy = jest.spyOn(trigger, 'focus');
            flushTransitions();
            expect(spy).not.toHaveBeenCalled();
        });
    });

    it('should drop triggers for routes that leave the tree entirely', () => {
        simulateTab();
        const trigger = appendButton();
        setLastInteractiveElementForTests(trigger);

        handleStateChange(onA);
        handleStateChange(onAB);

        const next = stackState(0, [{key: 'z', name: 'Z'}]);
        handleStateChange(next);

        expect(restoreTriggerForRoute('a')).toBe(false);
    });

    it('should drop the stale entry after the retry budget is exhausted (trigger stays aria-hidden)', () => {
        withFakeTimers(() => {
            simulateTab();
            const hidden = document.createElement('div');
            hidden.setAttribute('aria-hidden', 'true');
            const trigger = document.createElement('button');
            hidden.appendChild(trigger);
            document.body.appendChild(hidden);
            fireFocusIn(trigger);

            handleStateChange(onA);
            handleStateChange(onAB);
            trigger.blur();
            handleStateChange(onA);

            // Trigger stays aria-hidden across the transition + every rAF retry — scheduleRestore gives up.
            flushTransitions();
            jest.runAllTimers();
            const spy = jest.spyOn(trigger, 'focus');

            // Sibling later clears aria-hidden; the entry must already be dropped.
            hidden.removeAttribute('aria-hidden');
            expect(restoreTriggerForRoute('a')).toBe(false);
            expect(spy).not.toHaveBeenCalled();
        });
    });
});

describe('compoundParamsKey', () => {
    it('should produce the same key regardless of property insertion order', () => {
        expect(compoundParamsKey('search-x', {q: 'foo', sort: 'date'})).toBe(compoundParamsKey('search-x', {sort: 'date', q: 'foo'}));
    });

    it('should produce different keys for different params', () => {
        expect(compoundParamsKey('search-x', {q: 'foo'})).not.toBe(compoundParamsKey('search-x', {q: 'bar'}));
    });

    it('should handle null / undefined params', () => {
        expect(compoundParamsKey('r', null)).toMatch(/^r/);
        expect(compoundParamsKey('r', null)).toBe(compoundParamsKey('r', undefined));
        expect(compoundParamsKey('r', null)).not.toBe('r');
    });

    it('should not collide with bare route keys', () => {
        expect(compoundParamsKey('search-x', {q: 'foo'})).not.toBe('search-x');
    });

    it('should treat explicit-undefined fields as omitted (path rehydration parity)', () => {
        expect(compoundParamsKey('search-x', {q: 'foo', rawQuery: undefined})).toBe(compoundParamsKey('search-x', {q: 'foo'}));
    });

    it('should distinguish explicit null from absent (null is a real value)', () => {
        expect(compoundParamsKey('search-x', {q: 'foo', rawQuery: null})).not.toBe(compoundParamsKey('search-x', {q: 'foo'}));
    });

    it('should distinguish array [undefined] from array [null] (JSON.stringify would otherwise collapse both to "null")', () => {
        expect(compoundParamsKey('search-x', {ids: [undefined]})).not.toBe(compoundParamsKey('search-x', {ids: [null]}));
    });

    it('should produce the same key for two [undefined] arrays', () => {
        expect(compoundParamsKey('search-x', {ids: [undefined, undefined]})).toBe(compoundParamsKey('search-x', {ids: [undefined, undefined]}));
    });

    it('should treat number and string-of-number as equivalent (URL-rehydrated params are always strings)', () => {
        expect(compoundParamsKey('search-x', {id: 123})).toBe(compoundParamsKey('search-x', {id: '123'}));
    });

    it('should treat boolean and string-of-boolean as equivalent', () => {
        expect(compoundParamsKey('search-x', {active: true})).toBe(compoundParamsKey('search-x', {active: 'true'}));
    });

    it('should treat arrays of numbers and arrays of string-of-numbers as equivalent', () => {
        expect(compoundParamsKey('search-x', {ids: [1, 2, 3]})).toBe(compoundParamsKey('search-x', {ids: ['1', '2', '3']}));
    });

    it('should preserve array structure (not collapse to object keys)', () => {
        // An object with numeric keys should NOT match the equivalent array — they're different param shapes.
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const asObject = {ids: {'0': 'a', '1': 'b'}};
        expect(compoundParamsKey('search-x', {ids: ['a', 'b']})).not.toBe(compoundParamsKey('search-x', asObject));
    });

    it('should produce the same key for nested objects with differently-ordered keys (recursive sort)', () => {
        // URL-rehydrated params may reorder nested keys; the compound key must be stable so backward/forward classification holds.
        expect(compoundParamsKey('search-x', {filters: {a: 1, b: 2}})).toBe(compoundParamsKey('search-x', {filters: {b: 2, a: 1}}));
    });
});

describe('PUSH_PARAMS notifications', () => {
    beforeEach(() => {
        simulateTab();
    });

    it('should roundtrip: forward captures the trigger, backward restores it', () => {
        withFakeTimers(() => {
            const trigger = appendInput();
            fireFocusIn(trigger);

            notifyPushParamsForward('search-x', {q: 'foo'});
            trigger.blur();

            const spy = jest.spyOn(trigger, 'focus');
            notifyPushParamsBackward('search-x', {q: 'foo'});
            flushTransitions();
            jest.runAllTimers();
            expect(spy).toHaveBeenCalled();
        });
    });

    it('recovers focus when the trigger is detached at the first attempt and remounts within the retry budget', () => {
        withFakeTimers(() => {
            const trigger = appendInput();
            fireFocusIn(trigger);
            notifyPushParamsForward('search-x', {q: 'foo'});

            trigger.remove();

            const spy = jest.spyOn(trigger, 'focus');
            notifyPushParamsBackward('search-x', {q: 'foo'});

            flushTransitions();
            expect(spy).not.toHaveBeenCalled();

            document.body.appendChild(trigger);
            jest.runAllTimers();
            expect(spy).toHaveBeenCalled();
        });
    });

    it('should drop compound entries when their bare route is removed from the tree', () => {
        const trigger = appendInput();
        fireFocusIn(trigger);

        handleStateChange(stackState(0, [{key: 'search-x', name: 'Search'}]));
        notifyPushParamsForward('search-x', {q: 'foo'});

        // Search route leaves the tree — its compound entries must be purged too.
        handleStateChange(stackState(0, [{key: 'other', name: 'Other'}]));

        trigger.blur();
        expect(restoreTriggerForRoute(compoundParamsKey('search-x', {q: 'foo'}))).toBe(false);
    });

    it('should not restore for a different params hash', () => {
        withFakeTimers(() => {
            const trigger = appendInput();
            fireFocusIn(trigger);

            notifyPushParamsForward('search-x', {q: 'foo'});
            trigger.blur();

            const spy = jest.spyOn(trigger, 'focus');
            notifyPushParamsBackward('search-x', {q: 'baz'});
            flushTransitions();
            expect(spy).not.toHaveBeenCalled();
        });
    });

    it('defers the first restore attempt by one frame so the post-commit render lands before focus', () => {
        withFakeTimers(() => {
            const trigger = appendInput();
            fireFocusIn(trigger);
            notifyPushParamsForward('search-x', {q: 'foo'});
            trigger.blur();

            const spy = jest.spyOn(trigger, 'focus');
            notifyPushParamsBackward('search-x', {q: 'foo'});
            flushTransitions();
            expect(spy).not.toHaveBeenCalled();
            jest.runAllTimers();
            expect(spy).toHaveBeenCalled();
        });
    });

    it('yields to a user focus that lands during the rAF defer (baseline-vs-activeElement check still wins)', () => {
        withFakeTimers(() => {
            const trigger = appendInput();
            fireFocusIn(trigger);
            notifyPushParamsForward('search-x', {q: 'foo'});
            trigger.blur();

            const triggerSpy = jest.spyOn(trigger, 'focus');
            notifyPushParamsBackward('search-x', {q: 'foo'});
            flushTransitions();
            const userTarget = appendButton();
            userTarget.focus();
            jest.runAllTimers();
            expect(triggerSpy).not.toHaveBeenCalled();
            expect(document.activeElement).toBe(userTarget);
        });
    });

    it('cancelPendingFocusRestore drops the rAF-deferred attempt so a later nav cannot replay it', () => {
        withFakeTimers(() => {
            const trigger = appendInput();
            fireFocusIn(trigger);
            notifyPushParamsForward('search-x', {q: 'foo'});
            trigger.blur();

            const spy = jest.spyOn(trigger, 'focus');
            notifyPushParamsBackward('search-x', {q: 'foo'});
            flushTransitions();
            cancelPendingFocusRestore();
            jest.runAllTimers();
            expect(spy).not.toHaveBeenCalled();
        });
    });
});

describe('teardown / setup lifecycle', () => {
    afterEach(() => {
        // Re-install so later tests still have the listener attached.
        setupNavigationFocusReturn();
    });

    it('should stop reacting to focusin after teardown', () => {
        teardownNavigationFocusReturn();

        simulateTab();
        const button = document.createElement('button');
        document.body.appendChild(button);
        button.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
        button.focus();

        captureTriggerForRoute('route-a');
        button.blur();
        expect(restoreTriggerForRoute('route-a')).toBe(false);
    });

    it('teardown preserves launcher stack entries — launcher-stack state is tied to DOM, not navigation lifecycle', () => {
        // A launcher set before teardown should remain on the stack (stack is pruned lazily via pickLauncher / consumeLauncher or explicit resetForTests).
        const launcher = appendButton();
        simulateTab();
        setActivePopoverLauncher(launcher);

        teardownNavigationFocusReturn();

        // After teardown, if we re-setup and exercise a capture path, the launcher should still be reachable via pickLauncher.
        setupNavigationFocusReturn();
        launcher.focus();
        launcher.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
        captureTriggerForRoute('route-a');

        launcher.blur();
        const launcherSpy = jest.spyOn(launcher, 'focus');
        expect(restoreTriggerForRoute('route-a')).toBe(true);
        expect(launcherSpy).toHaveBeenCalled();
    });

    it('should be idempotent — re-setup after teardown restores behavior', () => {
        teardownNavigationFocusReturn();
        setupNavigationFocusReturn();

        simulateTab();
        const button = document.createElement('button');
        document.body.appendChild(button);
        button.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
        button.focus();

        captureTriggerForRoute('route-a');
        button.blur();
        expect(restoreTriggerForRoute('route-a')).toBe(true);
    });

    it('teardown during an in-flight scheduleRestore cancels cleanly — no focus after teardown', () => {
        withFakeTimers(() => {
            simulateTab();
            const trigger = appendButton();
            fireFocusIn(trigger);
            handleStateChange(stackState(0, [{key: 'a', name: 'A'}]));
            handleStateChange(
                stackState(1, [
                    {key: 'a', name: 'A'},
                    {key: 'b', name: 'B'},
                ]),
            );
            trigger.blur();
            handleStateChange(stackState(0, [{key: 'a', name: 'A'}])); // backward diff queues scheduleRestore

            const spy = jest.spyOn(trigger, 'focus');
            teardownNavigationFocusReturn();
            flushTransitions(); // if cancellation failed, the restore would fire here
            expect(spy).not.toHaveBeenCalled();
        });
    });

    it('should seed prevState from navigationRef so the first transition is not misclassified as noop', () => {
        const navigationRefModule = require<{default: {getRootState: () => unknown; isReady: () => boolean}}>('../../src/libs/Navigation/navigationRef.ts');
        const navigationRef = navigationRefModule.default;
        const originalGetRootState = navigationRef.getRootState.bind(navigationRef);
        const originalIsReady = navigationRef.isReady.bind(navigationRef);
        const initialState = stackState(0, [{key: 'home', name: 'Home'}]);
        navigationRef.getRootState = () => initialState;
        navigationRef.isReady = () => true;
        try {
            teardownNavigationFocusReturn();
            resetForTests();
            setupNavigationFocusReturn();

            // Without the seed, prevState=undefined would make this forward transition classify as noop and skip capture.
            simulateTab();
            const trigger = appendButton();
            trigger.focus();
            setLastInteractiveElementForTests(trigger);
            handleStateChange(
                stackState(1, [
                    {key: 'home', name: 'Home'},
                    {key: 'settings', name: 'Settings'},
                ]),
            );

            trigger.blur();
            expect(restoreTriggerForRoute('home')).toBe(true);
        } finally {
            navigationRef.getRootState = originalGetRootState;
            navigationRef.isReady = originalIsReady;
        }
    });

    it('should seed prevState on the NavigationRoot.onReady re-invocation even when the module-load call already attached the listener', () => {
        const navigationRefModule = require<{default: {getRootState: () => unknown; isReady: () => boolean}}>('../../src/libs/Navigation/navigationRef.ts');
        const navigationRef = navigationRefModule.default;
        const originalGetRootState = navigationRef.getRootState.bind(navigationRef);
        const originalIsReady = navigationRef.isReady.bind(navigationRef);
        const liveInitialState = stackState(0, [{key: 'home', name: 'Home'}]);

        // Phase 1: pre-mount — isReady=false, seed is skipped (no React Navigation console.error either).
        navigationRef.isReady = () => false;
        navigationRef.getRootState = () => undefined;
        try {
            teardownNavigationFocusReturn();
            resetForTests();
            setupNavigationFocusReturn();

            // Phase 2: onReady — container is live. Re-invoking setup must reseed even though stateUnsubscribe is already set.
            navigationRef.isReady = () => true;
            navigationRef.getRootState = () => liveInitialState;
            setupNavigationFocusReturn();

            simulateTab();
            const trigger = appendButton();
            trigger.focus();
            setLastInteractiveElementForTests(trigger);
            handleStateChange(
                stackState(1, [
                    {key: 'home', name: 'Home'},
                    {key: 'settings', name: 'Settings'},
                ]),
            );

            trigger.blur();
            expect(restoreTriggerForRoute('home')).toBe(true);
        } finally {
            navigationRef.getRootState = originalGetRootState;
            navigationRef.isReady = originalIsReady;
        }
    });

    it('teardown clears cached nav state so a later setup re-seeds against the new container (logout → login / HMR remount)', () => {
        const navigationRefModule = require<{default: {getRootState: () => unknown; isReady: () => boolean}}>('../../src/libs/Navigation/navigationRef.ts');
        const navigationRef = navigationRefModule.default;
        const originalGetRootState = navigationRef.getRootState.bind(navigationRef);
        const originalIsReady = navigationRef.isReady.bind(navigationRef);

        // Lifecycle 1: cache prevState + a trigger against the old route tree.
        const firstLifecycleState = stackState(0, [{key: 'old-home', name: 'Home'}]);
        navigationRef.isReady = () => true;
        navigationRef.getRootState = () => firstLifecycleState;
        try {
            resetForTests();
            setupNavigationFocusReturn();

            simulateTab();
            const stale = appendButton();
            stale.focus();
            setLastInteractiveElementForTests(stale);
            captureTriggerForRoute('old-home');
            stale.blur();
            expect(restoreTriggerForRoute('old-home')).toBe(true);

            // Re-capture so triggerMap has an entry going into teardown.
            stale.focus();
            setLastInteractiveElementForTests(stale);
            captureTriggerForRoute('old-home');

            teardownNavigationFocusReturn();

            // Lifecycle 2: fresh container, new route keys.
            const secondLifecycleState = stackState(0, [{key: 'new-home', name: 'Home'}]);
            navigationRef.getRootState = () => secondLifecycleState;
            setupNavigationFocusReturn();

            simulateTab();
            const freshTrigger = appendButton();
            freshTrigger.focus();
            setLastInteractiveElementForTests(freshTrigger);
            handleStateChange(
                stackState(1, [
                    {key: 'new-home', name: 'Home'},
                    {key: 'new-settings', name: 'Settings'},
                ]),
            );

            freshTrigger.blur();
            expect(restoreTriggerForRoute('new-home')).toBe(true);
            // Prior-lifecycle trigger must not leak.
            expect(restoreTriggerForRoute('old-home')).toBe(false);
        } finally {
            navigationRef.getRootState = originalGetRootState;
            navigationRef.isReady = originalIsReady;
        }
    });

    it('does not subscribe a state listener pre-mount; the queue-only unsubscribe would leak past teardown when the container forwards it (StrictMode cleanup/re-setup leak)', () => {
        type NavigationRefMock = {
            addListener: (event: string, callback: (...args: unknown[]) => void) => () => void;
            isReady: () => boolean;
            getRootState: () => unknown;
        };

        const navigationRefModule = require<{default: NavigationRefMock}>('../../src/libs/Navigation/navigationRef.ts');
        const navigationRef = navigationRefModule.default;
        const originalAddListener = navigationRef.addListener.bind(navigationRef);
        const originalIsReady = navigationRef.isReady.bind(navigationRef);
        const originalGetRootState = navigationRef.getRootState.bind(navigationRef);
        const addListenerSpy = jest.fn<ReturnType<typeof navigationRef.addListener>, Parameters<typeof navigationRef.addListener>>(() => () => {});
        navigationRef.addListener = addListenerSpy;
        navigationRef.isReady = () => false;
        navigationRef.getRootState = () => undefined;
        try {
            teardownNavigationFocusReturn();
            resetForTests();
            setupNavigationFocusReturn();
            expect(addListenerSpy).not.toHaveBeenCalled();
        } finally {
            navigationRef.addListener = originalAddListener;
            navigationRef.isReady = originalIsReady;
            navigationRef.getRootState = originalGetRootState;
        }
    });
});
