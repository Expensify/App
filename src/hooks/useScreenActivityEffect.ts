import type {DependencyList, EffectCallback} from 'react';

import {useEffect, useInsertionEffect, useRef} from 'react';

/** What the hook tracks for one call site. Only the effects of the hook write it. */
type LiveEffect = {
    /** The cleanup the last setup returned, or undefined while no setup is live. */
    cleanup: ReturnType<EffectCallback>;

    /** Whether the next passive effect has to run the setup, because the component mounted, its dependencies changed, or the cleanup ran. */
    isSetupPending: boolean;

    /** Whether React holds the passive cleanup, which it does while the component is visible. */
    isVisible: boolean;

    /** Whether React holds the insertion cleanup, which it does until the component is removed or its dependencies change. */
    isMounted: boolean;
};

/* eslint-disable no-param-reassign */
function runCleanup(effect: LiveEffect): void {
    const {cleanup} = effect;
    effect.cleanup = undefined;
    effect.isSetupPending = true;
    cleanup?.();
}

function runSetup(effect: LiveEffect, setup: EffectCallback): void {
    effect.isSetupPending = false;
    effect.cleanup = setup();
}
/* eslint-enable no-param-reassign */

/** Reports an error the work throws instead of rethrowing it, as React does for a cleanup that throws during a commit. */
function runAndReportError(work: () => void): void {
    try {
        work();
    } catch (error) {
        console.error(error);
    }
}

/** Hidden removals have no passive cleanup. Drain them before another hook sets up, or after the synchronous commit. */
const pendingCleanups = new Set<LiveEffect>();

function flushPendingCleanups(): void {
    for (const effect of pendingCleanups) {
        // The entry leaves the set first so a cleanup that synchronously commits another root cannot release the same work twice.
        pendingCleanups.delete(effect);
        if (!effect.isMounted) {
            runAndReportError(() => runCleanup(effect));
        }
    }
}

/**
 * useEffect whose cleanup survives an <Activity> hiding the component. The cleanup runs when the dependencies change
 * and when the component is removed, which includes the screen leaving the navigation stack. Use it for work that has
 * to keep running behind a cover, and see "Effects that must survive a cover" in contributingGuides/ACTIVITY_SCREENS.md
 * for how it differs from useEffect.
 *
 * React runs the passive cleanup for a hide as well as for a dependency change and a removal, so the passive effect
 * alone cannot tell them apart. The insertion effect can, because a hide and a reveal never reach it. It records
 * whether the component is mounted and whether a setup is pending, and the passive effect acts on that: its body runs
 * the setup when one is pending, and its cleanup releases the work only when the component is gone or its dependencies
 * changed. Behind a cover no passive effect runs, so a component removed while hidden queues its release. A dependency
 * change cancels its own entry, because its insertion setup runs in the same commit. What stays queued is released by
 * the next passive body of the hook, on any screen, or by a microtask after the commit when no body runs first.
 *
 * Keep what the cleanup releases in the closure of the setup. A plain useEffect of the same component runs its cleanup
 * on the cover, so a ref it clears is already empty when this cleanup runs for a removal behind the cover.
 */
function useScreenActivityEffect(setup: EffectCallback, deps: DependencyList): void {
    // The effects mutate this record, which the React Compiler allows for a ref and rejects for state.
    const effectRef = useRef<LiveEffect>({cleanup: undefined, isSetupPending: false, isVisible: false, isMounted: false});

    useInsertionEffect(() => {
        const effect = effectRef.current;
        // An insertion setup in the same commit means a dependency change, not a removal.
        pendingCleanups.delete(effect);
        effect.isSetupPending = true;
        effect.isMounted = true;
        return () => {
            effect.isMounted = false;
            // A visible component gets its passive cleanup in this commit, and that cleanup runs the release.
            if (effect.isVisible) {
                return;
            }
            if (pendingCleanups.size === 0) {
                // Passive effects may run before or after this microtask, depending on the update priority.
                Promise.resolve().then(flushPendingCleanups);
            }
            pendingCleanups.add(effect);
        };
    }, deps);

    useEffect(() => {
        const effect = effectRef.current;
        // A reveal may replace a hidden instance and synchronously run this setup before the microtask.
        flushPendingCleanups();
        effect.isVisible = true;
        if (effect.isSetupPending) {
            // A cleanup that throws must not stop the setup that follows it.
            runAndReportError(() => runCleanup(effect));
            runSetup(effect, setup);
        }
        return () => {
            effect.isVisible = false;
            // A hide leaves the component mounted with its setup current, and so does the double invocation of StrictMode.
            if (!effect.isMounted || effect.isSetupPending) {
                runCleanup(effect);
            }
        };
        // The call site owns the dependencies, exactly as with useEffect.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}

export default useScreenActivityEffect;
