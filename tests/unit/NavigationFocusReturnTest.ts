// Typed require with explicit .ts path — matches the project's test-file convention.
/* eslint-disable @typescript-eslint/no-require-imports, import/extensions */
const {resetCycle: resetArbiter} = require<{resetCycle: () => void}>('../../src/libs/ScreenFocusArbiter.ts');
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

function simulateKey(key: string) {
    document.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true}));
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

beforeEach(() => {
    resetForTests();
    resetArbiter();
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

        it('should store the last interactive element against the given route key', () => {
            const trigger = document.createElement('button');
            document.body.appendChild(trigger);
            trigger.focus();
            setLastInteractiveElementForTests(trigger);

            captureTriggerForRoute('route-a');

            trigger.blur();
            const spy = jest.spyOn(trigger, 'focus');
            expect(restoreTriggerForRoute('route-a')).toBe(true);
            expect(spy).toHaveBeenCalled();
        });

        it('should not store when lastInteractiveElement is null', () => {
            setLastInteractiveElementForTests(null);
            captureTriggerForRoute('route-a');
            expect(restoreTriggerForRoute('route-a')).toBe(false);
        });

        it('should not store when the tracked element has left the DOM', () => {
            const trigger = document.createElement('button');
            document.body.appendChild(trigger);
            setLastInteractiveElementForTests(trigger);
            trigger.remove();

            captureTriggerForRoute('route-a');
            expect(restoreTriggerForRoute('route-a')).toBe(false);
        });

        it('should not store when active element has drifted to another non-body element', () => {
            const tracked = document.createElement('button');
            const other = document.createElement('input');
            document.body.appendChild(tracked);
            document.body.appendChild(other);

            // Pin tracked AFTER other.focus() so the focusin listener doesn't overwrite it.
            other.focus();
            setLastInteractiveElementForTests(tracked);

            captureTriggerForRoute('route-a');
            expect(restoreTriggerForRoute('route-a')).toBe(false);
        });

        it('should store when active element matches the tracked element', () => {
            const trigger = document.createElement('button');
            document.body.appendChild(trigger);
            trigger.focus();
            setLastInteractiveElementForTests(trigger);

            captureTriggerForRoute('route-a');
            trigger.blur();
            expect(restoreTriggerForRoute('route-a')).toBe(true);
        });

        it('should store when active element is body (React Navigation blurred before state change)', () => {
            const trigger = document.createElement('button');
            document.body.appendChild(trigger);
            setLastInteractiveElementForTests(trigger);
            expect(document.activeElement).toBe(document.body);

            captureTriggerForRoute('route-a');
            expect(restoreTriggerForRoute('route-a')).toBe(true);
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
            jest.useFakeTimers();
            try {
                const launcher = document.createElement('button');
                document.body.appendChild(launcher);
                setActivePopoverLauncher(launcher);

                // Modal close triggers onPostDeactivate before the deferred navigate fires.
                scheduleClearActivePopoverLauncher();

                // Within the deferral window, capture should still see the launcher.
                jest.advanceTimersByTime(50);
                captureTriggerForRoute('route-a');

                launcher.blur();
                expect(restoreTriggerForRoute('route-a')).toBe(true);
            } finally {
                jest.useRealTimers();
            }
        });

        it('should clear the launcher after the deferred window elapses', () => {
            jest.useFakeTimers();
            try {
                const launcher = document.createElement('button');
                document.body.appendChild(launcher);
                setActivePopoverLauncher(launcher);
                scheduleClearActivePopoverLauncher();

                jest.advanceTimersByTime(2000);

                const fallback = document.createElement('button');
                document.body.appendChild(fallback);
                fallback.focus();
                fallback.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));

                captureTriggerForRoute('route-a');
                fallback.blur();
                const launcherSpy = jest.spyOn(launcher, 'focus');
                expect(restoreTriggerForRoute('route-a')).toBe(true);
                // Expect the fallback was captured, not the (since-cleared) launcher.
                expect(launcherSpy).not.toHaveBeenCalled();
            } finally {
                jest.useRealTimers();
            }
        });

        it('should defer to lastInteractiveElement when the user moved on after popover closed', () => {
            const launcher = document.createElement('button');
            const otherButton = document.createElement('button');
            document.body.appendChild(launcher);
            document.body.appendChild(otherButton);

            // Popover opens then closes: launcher is set, scheduled-clear is pending, popoverIsActive=false.
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

            // Popover open: launcher set, popoverIsActive=true (no scheduleClear yet).
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

        it('should cancel a pending deferred clear when a new launcher is set', () => {
            jest.useFakeTimers();
            try {
                const launcherA = document.createElement('button');
                const launcherB = document.createElement('button');
                document.body.appendChild(launcherA);
                document.body.appendChild(launcherB);

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
            } finally {
                jest.useRealTimers();
            }
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

    it('should return false (and not take RETURN priority) when the trigger is disabled', () => {
        const trigger = document.createElement('button');
        document.body.appendChild(trigger);
        trigger.focus();
        setLastInteractiveElementForTests(trigger);
        captureTriggerForRoute('route-a');
        trigger.blur();
        trigger.disabled = true;

        const spy = jest.spyOn(trigger, 'focus');
        expect(restoreTriggerForRoute('route-a')).toBe(false);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should return false when the trigger has aria-disabled="true"', () => {
        const trigger = document.createElement('button');
        document.body.appendChild(trigger);
        trigger.focus();
        setLastInteractiveElementForTests(trigger);
        captureTriggerForRoute('route-a');
        trigger.blur();
        trigger.setAttribute('aria-disabled', 'true');

        expect(restoreTriggerForRoute('route-a')).toBe(false);
    });

    it('should return false when the trigger is inside an aria-hidden container', () => {
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

    it('should pass focusVisible=true when user is keyboard-driven at restore time', () => {
        simulateTab();
        const trigger = document.createElement('button');
        document.body.appendChild(trigger);
        trigger.focus();
        setLastInteractiveElementForTests(trigger);
        captureTriggerForRoute('route-a');
        trigger.blur();

        const spy = jest.spyOn(trigger, 'focus');
        expect(restoreTriggerForRoute('route-a')).toBe(true);
        expect(spy).toHaveBeenCalledWith({preventScroll: true, focusVisible: true});
    });

    it('should pass focusVisible=false when user has switched to mouse by restore time', () => {
        simulateTab();
        const trigger = document.createElement('button');
        document.body.appendChild(trigger);
        trigger.focus();
        setLastInteractiveElementForTests(trigger);
        captureTriggerForRoute('route-a');
        trigger.blur();
        simulateMouse();

        const spy = jest.spyOn(trigger, 'focus');
        expect(restoreTriggerForRoute('route-a')).toBe(true);
        expect(spy).toHaveBeenCalledWith({preventScroll: true, focusVisible: false});
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
    it('should capture the tracked element on forward navigation', () => {
        simulateTab();
        const initial = stackState(0, [{key: 'a', name: 'A'}]);
        handleStateChange(initial);

        const trigger = document.createElement('button');
        document.body.appendChild(trigger);
        trigger.focus();
        trigger.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));

        const next = stackState(1, [
            {key: 'a', name: 'A'},
            {key: 'b', name: 'B'},
        ]);
        handleStateChange(next);

        trigger.blur();
        handleStateChange(initial);
        jest.runAllTimers();

        // Either the scheduled restore fired or we consume it manually — both prove capture happened.
        const stored = restoreTriggerForRoute('a');
        expect(stored || document.activeElement === trigger).toBe(true);
    });

    it('should do nothing when the focused route has not changed', () => {
        simulateTab();
        const state = stackState(0, [{key: 'a', name: 'A'}]);
        handleStateChange(state);

        const trigger = document.createElement('button');
        document.body.appendChild(trigger);
        setLastInteractiveElementForTests(trigger);

        handleStateChange(state);
        expect(restoreTriggerForRoute('a')).toBe(false);
    });

    it('should preserve a queued restore when a noop state change (same focused route) arrives', () => {
        jest.useFakeTimers();
        try {
            simulateTab();
            const onA = stackState(0, [{key: 'a', name: 'A'}]);
            handleStateChange(onA);

            const trigger = document.createElement('button');
            document.body.appendChild(trigger);
            trigger.focus();
            trigger.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));

            const onAB = stackState(1, [
                {key: 'a', name: 'A'},
                {key: 'b', name: 'B'},
            ]);
            handleStateChange(onAB);

            trigger.blur();
            handleStateChange(onA);

            // Noop (e.g. setParams on the already-focused route) — pending restore must survive.
            handleStateChange(onA);

            const spy = jest.spyOn(trigger, 'focus');
            jest.runAllTimers();
            expect(spy).toHaveBeenCalled();
        } finally {
            jest.useRealTimers();
        }
    });

    it('should cancel a queued restore when a lateral tab switch arrives before it fires', () => {
        jest.useFakeTimers();
        try {
            simulateTab();
            const onTab1 = stackState(0, [
                {key: 'tab-1', name: 'Tab1'},
                {key: 'tab-2', name: 'Tab2'},
            ]);
            handleStateChange(onTab1);

            const trigger = document.createElement('button');
            document.body.appendChild(trigger);
            trigger.focus();
            trigger.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));

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
        } finally {
            jest.useRealTimers();
        }
    });

    it('should cancel a queued restore when a new state change arrives before it fires', () => {
        jest.useFakeTimers();
        try {
            simulateTab();
            const onA = stackState(0, [{key: 'a', name: 'A'}]);
            handleStateChange(onA);

            const trigger = document.createElement('button');
            document.body.appendChild(trigger);
            trigger.focus();
            trigger.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));

            const onAB = stackState(1, [
                {key: 'a', name: 'A'},
                {key: 'b', name: 'B'},
            ]);
            handleStateChange(onAB);

            // Backward to A queues a restore...
            trigger.blur();
            handleStateChange(onA);

            // ...but a forward nav arrives before it fires (e.g. dismissModalWithReport).
            const onAC = stackState(1, [
                {key: 'a', name: 'A'},
                {key: 'c', name: 'C'},
            ]);
            handleStateChange(onAC);

            const spy = jest.spyOn(trigger, 'focus');
            jest.runAllTimers();
            expect(spy).not.toHaveBeenCalled();
        } finally {
            jest.useRealTimers();
        }
    });

    it('should drop triggers for routes that leave the tree entirely', () => {
        simulateTab();
        const prev = stackState(0, [
            {key: 'a', name: 'A'},
            {key: 'b', name: 'B'},
        ]);
        const trigger = document.createElement('button');
        document.body.appendChild(trigger);
        setLastInteractiveElementForTests(trigger);

        handleStateChange(stackState(0, [{key: 'a', name: 'A'}]));
        handleStateChange(prev);

        const next = stackState(0, [{key: 'z', name: 'Z'}]);
        handleStateChange(next);

        expect(restoreTriggerForRoute('a')).toBe(false);
    });

    it('should drop the stale entry after MAX_RESTORE_ATTEMPTS retries all fail', () => {
        jest.useFakeTimers();
        try {
            simulateTab();
            const hidden = document.createElement('div');
            hidden.setAttribute('aria-hidden', 'true');
            const trigger = document.createElement('button');
            hidden.appendChild(trigger);
            document.body.appendChild(hidden);
            trigger.focus();
            trigger.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));

            const onA = stackState(0, [{key: 'a', name: 'A'}]);
            handleStateChange(onA);
            const onAB = stackState(1, [
                {key: 'a', name: 'A'},
                {key: 'b', name: 'B'},
            ]);
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
        } finally {
            jest.useRealTimers();
        }
    });
});

describe('PUSH_PARAMS notifications', () => {
    beforeEach(() => {
        simulateTab();
    });

    describe('compoundParamsKey', () => {
        it('should produce the same key regardless of property insertion order', () => {
            const a = compoundParamsKey('search-x', {q: 'foo', sort: 'date'});
            const b = compoundParamsKey('search-x', {sort: 'date', q: 'foo'});
            expect(a).toBe(b);
        });

        it('should produce different keys for different params', () => {
            const a = compoundParamsKey('search-x', {q: 'foo'});
            const b = compoundParamsKey('search-x', {q: 'bar'});
            expect(a).not.toBe(b);
        });

        it('should handle null / undefined params', () => {
            expect(compoundParamsKey('r', null)).toBe('r::');
            expect(compoundParamsKey('r', undefined)).toBe('r::');
        });

        it('should not collide with bare route keys', () => {
            // A route key alone (used by the regular nav path) shouldn't match a compound key for the same route.
            expect(compoundParamsKey('search-x', {q: 'foo'})).not.toBe('search-x');
        });

        it('should treat explicit-undefined fields as omitted (path rehydration parity)', () => {
            // Saved-search dispatches `rawQuery: undefined`, but URL rebuild omits the field entirely.
            const explicitUndef = compoundParamsKey('search-x', {q: 'foo', rawQuery: undefined});
            const omitted = compoundParamsKey('search-x', {q: 'foo'});
            expect(explicitUndef).toBe(omitted);
        });

        it('should still distinguish explicit null from absent (null is a real value)', () => {
            const withNull = compoundParamsKey('search-x', {q: 'foo', rawQuery: null});
            const omitted = compoundParamsKey('search-x', {q: 'foo'});
            expect(withNull).not.toBe(omitted);
        });
    });

    it('should roundtrip: forward captures the trigger, backward restores it', () => {
        jest.useFakeTimers();
        try {
            const trigger = document.createElement('input');
            document.body.appendChild(trigger);
            trigger.focus();
            trigger.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));

            // User on /search?q=foo, focus on the search input. PUSH_PARAMS dispatches with q=bar.
            notifyPushParamsForward('search-x', {q: 'foo'});

            // Focus moves elsewhere (new results render, etc.)
            trigger.blur();

            // GO_BACK reverts params to q=foo.
            const spy = jest.spyOn(trigger, 'focus');
            notifyPushParamsBackward('search-x', {q: 'foo'});
            jest.runAllTimers();

            expect(spy).toHaveBeenCalled();
        } finally {
            jest.useRealTimers();
        }
    });

    it('should drop compound entries when their bare route is removed from the tree', () => {
        const trigger = document.createElement('input');
        document.body.appendChild(trigger);
        trigger.focus();
        trigger.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));

        // Prime prev state, then capture a compound entry against (search-x, q=foo).
        handleStateChange(stackState(0, [{key: 'search-x', name: 'Search'}]));
        notifyPushParamsForward('search-x', {q: 'foo'});

        // Now the search route leaves the tree entirely.
        handleStateChange(stackState(0, [{key: 'other', name: 'Other'}]));

        // Compound entry must be gone — restore returns false.
        trigger.blur();
        expect(restoreTriggerForRoute(compoundParamsKey('search-x', {q: 'foo'}))).toBe(false);
    });

    it('should not restore for a different params hash', () => {
        jest.useFakeTimers();
        try {
            const trigger = document.createElement('input');
            document.body.appendChild(trigger);
            trigger.focus();
            trigger.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));

            notifyPushParamsForward('search-x', {q: 'foo'});
            trigger.blur();

            // Backward to a different params snapshot — should not restore the foo trigger.
            const spy = jest.spyOn(trigger, 'focus');
            notifyPushParamsBackward('search-x', {q: 'baz'});
            jest.runAllTimers();

            expect(spy).not.toHaveBeenCalled();
        } finally {
            jest.useRealTimers();
        }
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
});
