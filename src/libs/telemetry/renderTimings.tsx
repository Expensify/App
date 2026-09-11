// Per-component render timings for the personal-details subscription POC. Delete once the measurement is done.
// React only records `actualDuration` in a development build, so these numbers are dev-inflated: they are
// comparable against another run of this same instrumentation, not against production render times.
import Log from '@libs/Log';

import type {ComponentType, ProfilerOnRenderCallback} from 'react';

import React, {Profiler, useEffect} from 'react';

/** Aggregated render cost for one instrumented component, split by React's commit phase. */
type RenderTimingSample = {
    /** Commits where the component was newly inserted. Scales with list size. */
    mounts: number;

    /** Total `actualDuration` across those mounts. */
    mountMs: number;

    /** Commits that re-rendered an already-mounted instance. This is what a personal-details write drives up. */
    updates: number;

    /** Total `actualDuration` across those updates. */
    updateMs: number;

    /** Slowest single commit, mount or update. Surfaces the worst frame rather than the average. */
    maxMs: number;

    /**
     * Executions of the instrumented component's own function body, counted by an explicit `noteRender()` call.
     * A `Profiler` fires for any commit *inside* its subtree, so `updates` cannot tell "this component
     * re-rendered" from "one descendant re-rendered". Only components that call `noteRender()` report this.
     */
    bodyRuns: number;
};

/** How often the collected window is logged. Long enough that a scroll or a write lands inside one window. */
const FLUSH_INTERVAL_MS = 5000;

const samplesByID = new Map<string, RenderTimingSample>();

/** Instances currently mounted per id. Survives a flush: `updates` is only readable per-instance against this. */
const liveInstancesByID = new Map<string, number>();

/**
 * Personal-details writes seen in the current window. Bumped by `instrumentPersonalDetailsMerge`. Attribution:
 * updates far outnumbering writes means the re-renders come from parents, not from the personal-details subscription.
 */
let personalDetailsWrites = 0;

let flushTimer: ReturnType<typeof setInterval> | undefined;

function round(ms: number): number {
    return Math.round(ms * 100) / 100;
}

/** Logs the current window and starts a new one. A no-op when nothing rendered. */
function flush() {
    if (samplesByID.size === 0) {
        return;
    }

    const report: Record<string, unknown> = {};
    for (const [id, sample] of samplesByID) {
        const liveInstances = liveInstancesByID.get(id) ?? 0;
        report[id] = {
            liveInstances,
            // Only meaningful for components wired to `noteRender()`. `bodyRuns` well below `updates` means the
            // component itself is stable and its descendants are doing the re-rendering.
            bodyRuns: sample.bodyRuns,
            mounts: sample.mounts,
            mountMs: round(sample.mountMs),
            avgMountMs: sample.mounts ? round(sample.mountMs / sample.mounts) : 0,
            updates: sample.updates,
            // Separates "many instances rendered once" from "few instances rendered many times". Those need opposite fixes.
            updatesPerInstance: liveInstances ? round(sample.updates / liveInstances) : 0,
            // A ratio near 1 means one render per write, which is the subscription cost. Well above 1 means a parent is driving the renders.
            updatesPerWrite: personalDetailsWrites ? round(sample.updates / personalDetailsWrites) : 0,
            updateMs: round(sample.updateMs),
            avgUpdateMs: sample.updates ? round(sample.updateMs / sample.updates) : 0,
            maxMs: round(sample.maxMs),
            totalMs: round(sample.mountMs + sample.updateMs),
        };
    }
    samplesByID.clear();
    const writes = personalDetailsWrites;
    personalDetailsWrites = 0;

    // `sendNow` so samples are greppable mid-run instead of waiting for the batched flush.
    Log.info('[RenderTimings] window', true, {windowMs: FLUSH_INTERVAL_MS, personalDetailsWrites: writes, ...report});
}

/** Drops everything collected so far without logging it. Use it to discard app startup before a measured run. */
function reset() {
    samplesByID.clear();
    personalDetailsWrites = 0;
}

/** Records that a personal-details write landed, so a window can tell subscription-driven renders from parent-driven ones. */
function notePersonalDetailsWrite() {
    personalDetailsWrites++;
}

/**
 * Counts one execution of a component's own function body. Call it at the top of a component that is also
 * wrapped in `withRenderTiming`, to separate its own re-renders from its subtree's.
 */
function noteRender(id: string) {
    let sample = samplesByID.get(id);
    if (!sample) {
        sample = {mounts: 0, mountMs: 0, updates: 0, updateMs: 0, maxMs: 0, bodyRuns: 0};
        samplesByID.set(id, sample);
    }
    sample.bodyRuns++;
}

const onRender: ProfilerOnRenderCallback = (id, phase, actualDuration) => {
    let sample = samplesByID.get(id);
    if (!sample) {
        sample = {mounts: 0, mountMs: 0, updates: 0, updateMs: 0, maxMs: 0, bodyRuns: 0};
        samplesByID.set(id, sample);
    }

    if (phase === 'mount') {
        sample.mounts++;
        sample.mountMs += actualDuration;
    } else {
        sample.updates++;
        sample.updateMs += actualDuration;
    }
    sample.maxMs = Math.max(sample.maxMs, actualDuration);

    flushTimer ??= setInterval(flush, FLUSH_INTERVAL_MS);
};

/**
 * Wraps a component in a `Profiler` that reports its render cost under `id`. Every instance sharing an `id` is
 * aggregated together, so a per-row component reports the whole row set rather than one row.
 */
function withRenderTiming<P extends Record<string, unknown>>(id: string, WrappedComponent: ComponentType<P>) {
    function WithRenderTiming(props: P) {
        useEffect(() => {
            liveInstancesByID.set(id, (liveInstancesByID.get(id) ?? 0) + 1);
            return () => {
                liveInstancesByID.set(id, (liveInstancesByID.get(id) ?? 1) - 1);
            };
        }, []);

        return (
            <Profiler
                id={id}
                onRender={onRender}
            >
                <WrappedComponent {...props} />
            </Profiler>
        );
    }

    WithRenderTiming.displayName = `withRenderTiming(${id})`;
    return WithRenderTiming;
}

// Exposed so a run can be bracketed by hand from the debugger: `renderTimings.reset()` … `renderTimings.flush()`.
Object.assign(globalThis, {renderTimings: {flush, reset}});

export default withRenderTiming;
export {flush, reset, notePersonalDetailsWrite, noteRender};
