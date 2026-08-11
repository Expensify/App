/**
 * Rate tripwire that detects runaway Onyx derived-value recompute loops and reports each offending derived key once per session.
 */
import Log from '@libs/Log';

import type {OnyxKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';

import * as Sentry from '@sentry/react-native';
import Onyx from 'react-native-onyx';

const WINDOW_MS = 10_000;

// Hand-tuned flat rate of about 5/s. Make it per-key if one config needs a looser bound.
const RECOMPUTE_THRESHOLD = 50;

/** A single recompute of a derived key: when it happened and which dependency keys triggered it. */
type RecomputeEntry = {
    /** Timestamp of the recompute, in ms. */
    at: number;

    /** Dependency keys whose change triggered this recompute. */
    triggeredKeys: Set<OnyxKey>;
};

/** Rolling detection state for one derived key. */
type KeyState = {
    /** Recomputes within the last `WINDOW_MS`, oldest first. */
    window: RecomputeEntry[];

    /** Whether this key already reported a loop. Latched so each key reports at most once per session. */
    hasReported: boolean;
};

const statesByDerivedKey = new Map<OnyxKey, KeyState>();

// Not useOnyx: this runs in the derived-value engine, outside React.
let isLoadingApp = false;
Onyx.connectWithoutView({
    key: ONYXKEYS.IS_LOADING_APP,
    callback: (value) => {
        isLoadingApp = value ?? false;
        // A new OpenApp (sign-in, cache clear) is a fresh hydration cycle, so let every key report again.
        if (isLoadingApp) {
            statesByDerivedKey.clear();
        }
    },
});

/**
 * Reports a runaway recompute rate for one derived key, once per key per app load, with a per-dependency breakdown.
 * Not a span: spans are dropped while backgrounded, which is when a loop is most likely to spin unnoticed.
 */
function detectOnyxDerivedLoop(derivedKey: OnyxKey, triggeredKeys: Set<OnyxKey>) {
    // OpenApp hydrates dependencies in bursts, so dense recomputes are expected until its data has landed.
    if (isLoadingApp) {
        return;
    }

    let state = statesByDerivedKey.get(derivedKey);
    if (!state) {
        state = {window: [], hasReported: false};
        statesByDerivedKey.set(derivedKey, state);
    }

    if (state.hasReported) {
        return;
    }

    const now = Date.now();
    state.window.push({at: now, triggeredKeys});
    while (state.window.length > 0 && (state.window.at(0)?.at ?? now) <= now - WINDOW_MS) {
        state.window.shift();
    }

    if (state.window.length < RECOMPUTE_THRESHOLD) {
        return;
    }

    state.hasReported = true;

    const dependencyCounts: Record<string, number> = {};
    for (const entry of state.window) {
        for (const dependencyKey of entry.triggeredKeys) {
            dependencyCounts[dependencyKey] = (dependencyCounts[dependencyKey] ?? 0) + 1;
        }
    }

    const message = `[OnyxDerived] recompute loop detected for ${derivedKey}`;
    Sentry.captureMessage(message, {
        level: 'warning',
        extra: {derivedKey, recomputeCount: state.window.length, windowMs: WINDOW_MS, dependencyCounts},
        fingerprint: ['onyx-derived-loop', derivedKey],
    });
    // Mirrored to VictoriaLogs. alert, not info, because it flushes immediately.
    Log.alert(message, {derivedKey, recomputeCount: state.window.length, windowMs: WINDOW_MS, dependencyCounts}, false);

    state.window.length = 0;
}

/** Test-only: clears the latches and windows. */
function resetOnyxDerivedLoopDetection() {
    statesByDerivedKey.clear();
}

export default detectOnyxDerivedLoop;
export {resetOnyxDerivedLoopDetection, RECOMPUTE_THRESHOLD, WINDOW_MS};
