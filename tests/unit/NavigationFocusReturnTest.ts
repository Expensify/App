// Typed require with explicit .ts path — matches the project's test-file convention.
/* eslint-disable @typescript-eslint/no-require-imports, import/extensions */
const {resetCycle: resetArbiter, tryClaim, Priorities} = require<{
    resetCycle: () => void;
    tryClaim: (priority: number) => boolean;
    Priorities: {INITIAL: number; AUTO: number; RETURN: number};
}>('../../src/libs/ScreenFocusArbiter.ts');
const {resetForTests: resetHadTabNavigation} = require<{
    resetForTests: () => void;
}>('../../src/libs/hadTabNavigation.ts');
const {
    diffNavigationState,
    collectRouteKeys,
    captureTriggerForRoute,
    restoreTriggerForRoute,
    handleStateChange,
    resetForTests,
    setLastInteractiveElementForTests,
    setActivePopoverLauncher,
    scheduleClearActivePopoverLauncher,
    notifyPushParamsForward,
    notifyPushParamsBackward,
    compoundParamsKey,
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
    setActivePopoverLauncher: (element: HTMLElement | null) => void;
    scheduleClearActivePopoverLauncher: () => void;
    notifyPushParamsForward: (routeKey: string, prevParams: unknown) => void;
    notifyPushParamsBackward: (routeKey: string, targetParams: unknown) => void;
    compoundParamsKey: (routeKey: string, params: unknown) => string;
    setupNavigationFocusReturn: () => void;
    teardownNavigationFocusReturn: () => void;
}>('../../src/libs/NavigationFocusReturn.ts');
/* eslint-enable @typescript-eslint/no-require-imports, import/extensions */

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
            setActivePopoverLauncher(null);

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

        it('should keep the launcher available across a deferred onPostDeactivate clear', () => {
            withFakeTimers(() => {
                const launcher = appendButton();
                setActivePopoverLauncher(launcher);
                scheduleClearActivePopoverLauncher();

                // Within the deferral window, capture should still see the launcher.
                jest.advanceTimersByTime(50);
                captureTriggerForRoute('route-a');

                launcher.blur();
                expect(restoreTriggerForRoute('route-a')).toBe(true);
            });
        });

        it('should clear the launcher after the deferred window elapses', () => {
            withFakeTimers(() => {
                const launcher = appendButton();
                setActivePopoverLauncher(launcher);
                scheduleClearActivePopoverLauncher();
                jest.advanceTimersByTime(2000);

                const fallback = appendButton();
                fireFocusIn(fallback);

                captureTriggerForRoute('route-a');
                fallback.blur();
                const launcherSpy = jest.spyOn(launcher, 'focus');
                expect(restoreTriggerForRoute('route-a')).toBe(true);
                // Expect the fallback was captured, not the (since-cleared) launcher.
                expect(launcherSpy).not.toHaveBeenCalled();
            });
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

        it('nested traps: inner activation does not evict the outer launcher from the stack', () => {
            const outerLauncher = appendButton();
            const innerLauncher = appendButton();
            setActivePopoverLauncher(outerLauncher);
            setActivePopoverLauncher(innerLauncher);

            // Inner trap closes first.
            scheduleClearActivePopoverLauncher(innerLauncher);
            // Capture fires while outer is still active — must see outer, not the deactivated inner.
            captureTriggerForRoute('route-a');

            const outerSpy = jest.spyOn(outerLauncher, 'focus');
            const innerSpy = jest.spyOn(innerLauncher, 'focus');
            outerLauncher.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(outerSpy).toHaveBeenCalled();
            expect(innerSpy).not.toHaveBeenCalled();
        });

        it('sequential traps: opening a new trap within the deferred-clear window does not wipe the earlier launcher', () => {
            withFakeTimers(() => {
                const launcherA = appendButton();
                const launcherB = appendButton();

                // Trap A opens and closes; its 1s clear window starts.
                setActivePopoverLauncher(launcherA);
                scheduleClearActivePopoverLauncher(launcherA);

                // Trap B opens within 500ms — A must still be on the stack (deactivated, within window).
                jest.advanceTimersByTime(500);
                setActivePopoverLauncher(launcherB);

                // User closes B without navigating; A is still in its deferred window.
                scheduleClearActivePopoverLauncher(launcherB);

                // A capture now picks B (top of stack, active most recently). This is the expected behavior.
                captureTriggerForRoute('route-a');

                const spyA = jest.spyOn(launcherA, 'focus');
                const spyB = jest.spyOn(launcherB, 'focus');
                launcherB.blur();
                expect(restoreTriggerForRoute('route-a')).toBe(true);
                expect(spyB).toHaveBeenCalled();
                expect(spyA).not.toHaveBeenCalled();
            });
        });

        it('should cancel a pending deferred clear when a new launcher is set', () => {
            withFakeTimers(() => {
                const launcherA = appendButton();
                const launcherB = appendButton();

                setActivePopoverLauncher(launcherA);
                scheduleClearActivePopoverLauncher();

                // Open another popover within the clear window.
                jest.advanceTimersByTime(100);
                setActivePopoverLauncher(launcherB);

                // Original deferred clear must NOT fire and wipe launcherB.
                jest.advanceTimersByTime(2000);

                captureTriggerForRoute('route-a');
                launcherB.blur();
                const spyB = jest.spyOn(launcherB, 'focus');
                expect(restoreTriggerForRoute('route-a')).toBe(true);
                expect(spyB).toHaveBeenCalled();
            });
        });
    });

    describe('when navigation is mouse-driven', () => {
        it('should not store even when a keyboard target was tracked earlier', () => {
            simulateTab();
            const tracked = document.createElement('button');
            document.body.appendChild(tracked);
            setLastInteractiveElementForTests(tracked);
            simulateMouse();

            captureTriggerForRoute('route-a');
            expect(restoreTriggerForRoute('route-a')).toBe(false);
        });

        it('should not store on a pure mouse session (no prior Tab)', () => {
            simulateMouse();
            const tracked = document.createElement('button');
            document.body.appendChild(tracked);
            setLastInteractiveElementForTests(tracked);

            captureTriggerForRoute('route-a');
            expect(restoreTriggerForRoute('route-a')).toBe(false);
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
        it.each<[label: string, setup: () => HTMLButtonElement]>([
            [
                'disabled',
                () => {
                    const trigger = appendButton();
                    trigger.focus();
                    setLastInteractiveElementForTests(trigger);
                    captureTriggerForRoute('route-a');
                    trigger.blur();
                    trigger.disabled = true;
                    return trigger;
                },
            ],
            [
                'aria-disabled="true"',
                () => {
                    const trigger = appendButton();
                    trigger.focus();
                    setLastInteractiveElementForTests(trigger);
                    captureTriggerForRoute('route-a');
                    trigger.blur();
                    trigger.setAttribute('aria-disabled', 'true');
                    return trigger;
                },
            ],
            [
                'inside an aria-hidden container',
                () => {
                    const hidden = document.createElement('div');
                    hidden.setAttribute('aria-hidden', 'true');
                    const trigger = document.createElement('button');
                    hidden.appendChild(trigger);
                    document.body.appendChild(hidden);
                    trigger.focus();
                    setLastInteractiveElementForTests(trigger);
                    captureTriggerForRoute('route-a');
                    trigger.blur();
                    return trigger;
                },
            ],
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

    it('should release the arbiter cycle after RETURN_HOLD_MS so later unrelated AUTO claims are not blocked for 2 seconds', () => {
        withFakeTimers(() => {
            const trigger = appendButton();
            trigger.focus();
            setLastInteractiveElementForTests(trigger);
            captureTriggerForRoute('route-a');
            trigger.blur();

            expect(restoreTriggerForRoute('route-a')).toBe(true);
            // Immediately after RETURN lands, AUTO is blocked (destination screen's mount-time useAutoFocusInput loses, correctly).
            expect(tryClaim(Priorities.AUTO)).toBe(false);

            // After the hold window, the cycle is released so a later unrelated AUTO (e.g. side-panel open) can succeed.
            jest.advanceTimersByTime(600);
            expect(tryClaim(Priorities.AUTO)).toBe(true);
        });
    });

    it('should cancel a pending return-hold timer when a new navigation starts so stale timers do not wipe the new cycle', () => {
        withFakeTimers(() => {
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
        expect(compoundParamsKey('r', null)).toBe('r::');
        expect(compoundParamsKey('r', undefined)).toBe('r::');
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

    it('should seed prevState from navigationRef so the first transition is not misclassified as noop', () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports, import/extensions
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
        // eslint-disable-next-line @typescript-eslint/no-require-imports, import/extensions
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
});
