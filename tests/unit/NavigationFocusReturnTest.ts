// Typed require with explicit .ts path — matches the project's test-file convention.
/* eslint-disable import/extensions */
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
    diffNavigationState,
    collectRouteKeys,
    captureTriggerForRoute,
    restoreTriggerForRoute,
    handleStateChange,
    resetForTests,
    setLastInteractiveElementForTests,
    setLastMouseTriggerForTests,
    notifyPushParamsForward,
    notifyPushParamsBackward,
    cancelPendingFocusRestore,
    compoundParamsKey,
    shouldSkipAutoFocusDueToExistingFocus,
    setupNavigationFocusReturn,
    teardownNavigationFocusReturn,
} = require<{
    diffNavigationState: (prev: unknown, next: unknown) => {action: {type: string; captureKey?: string; restoreKey?: string}; removedKeys: string[]};
    collectRouteKeys: (state: unknown) => Set<string>;
    captureTriggerForRoute: (routeKey: string) => void;
    restoreTriggerForRoute: (routeKey: string) => boolean;
    handleStateChange: (state: unknown) => void;
    resetForTests: () => void;
    setLastInteractiveElementForTests: (element: HTMLElement | null) => void;
    setLastMouseTriggerForTests: (element: HTMLElement | null) => void;
    notifyPushParamsForward: (routeKey: string, prevParams: unknown) => void;
    notifyPushParamsBackward: (routeKey: string, targetParams: unknown) => void;
    cancelPendingFocusRestore: () => void;
    compoundParamsKey: (routeKey: string, params: unknown) => string;
    shouldSkipAutoFocusDueToExistingFocus: () => boolean;
    setupNavigationFocusReturn: () => void;
    teardownNavigationFocusReturn: () => void;
}>('../../src/libs/NavigationFocusReturn.ts');
const {setActivePopoverLauncher, scheduleClearActivePopoverLauncher} = require<{
    setActivePopoverLauncher: (element: HTMLElement) => void;
    scheduleClearActivePopoverLauncher: (element?: HTMLElement) => void;
}>('../../src/libs/LauncherStack.ts');
const {default: hasFocusableAttributes} = require<{
    default: (el: Element) => boolean;
}>('../../src/libs/focusGuards.ts');
/* eslint-enable import/extensions */

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

setupHadTabNavigation();
setupNavigationFocusReturn();

beforeEach(() => {
    resetForTests();
    resetArbiter();
    resetHadTabNavigation();
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

        it.each(['Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'])(
            'should RESTORE modality on %s after typing — keyboard-initiated back/nav must show visible focus on the restored trigger (WCAG 2.4.7)',
            (navKey) => {
                simulateTab();
                simulateKey('a'); // Typing clears modality.
                simulateKey(navKey); // Nav key restores it.
                const trigger = appendButton();
                trigger.focus();
                setLastInteractiveElementForTests(trigger);

                captureTriggerForRoute('route-a');
                trigger.blur();
                const spy = jest.spyOn(trigger, 'focus');
                expect(restoreTriggerForRoute('route-a')).toBe(true);
                expect(spy).toHaveBeenCalledWith(expect.objectContaining({focusVisible: true}));
            },
        );

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
            scheduleClearActivePopoverLauncher();

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
            jest.runAllTimers();
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
            jest.runAllTimers();
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
        (document.activeElement as HTMLElement | null)?.blur();
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
            jest.runAllTimers();
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
            jest.runAllTimers();
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
            jest.runAllTimers();
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

    it('should drop the stale entry after MAX_RESTORE_ATTEMPTS retries all fail', () => {
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

            // Trigger stays aria-hidden across all retry attempts — scheduleRestore gives up.
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
            jest.runAllTimers(); // if cancellation failed, restore would fire here
            expect(spy).not.toHaveBeenCalled();
        });
    });

    it('should seed prevState from navigationRef so the first transition is not misclassified as noop', () => {
        // eslint-disable-next-line import/extensions
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
        // eslint-disable-next-line import/extensions
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
        // eslint-disable-next-line import/extensions
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
        // eslint-disable-next-line import/extensions
        const navigationRefModule = require<{default: NavigationRefMock}>('../../src/libs/Navigation/navigationRef.ts');
        const navigationRef = navigationRefModule.default;
        const originalAddListener = navigationRef.addListener.bind(navigationRef);
        const originalIsReady = navigationRef.isReady.bind(navigationRef);
        const originalGetRootState = navigationRef.getRootState.bind(navigationRef);
        const addListenerSpy = jest.fn(() => () => {});
        navigationRef.addListener = addListenerSpy as unknown as typeof navigationRef.addListener;
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
