import Log from '@libs/Log';

import CONST from '@src/CONST';
import type {OnyxKey} from '@src/ONYXKEYS';

import * as Sentry from '@sentry/react-native';

import {getSpan} from './activeSpans';

const WINDOW_MS = 10_000;

// Hand-tuned flat rate (5/s); make it per-key if one config needs a looser bound.
const RECOMPUTE_THRESHOLD = 50;

type RecomputeEntry = {
    at: number;
    triggeredKeys: Set<OnyxKey>;
};

type KeyState = {
    window: RecomputeEntry[];
    hasReported: boolean;
};

const statesByDerivedKey = new Map<OnyxKey, KeyState>();

/**
 * Reports a runaway recompute rate for one derived key, once per key per session, with a per-dependency breakdown.
 * Not a span: spans are dropped while backgrounded, which is when a loop is most likely to spin unnoticed.
 */
function detectOnyxDerivedLoop(derivedKey: OnyxKey, triggeredKeys: Set<OnyxKey>) {
    // Startup hydrates dependencies in bursts, so dense recomputes are expected until the startup span ends.
    if (getSpan(CONST.TELEMETRY.SPAN_APP_STARTUP)) {
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

    // Latched, so nothing reads the window again.
    state.window.length = 0;
}

/** Test-only: clears the latches and windows. */
function resetOnyxDerivedLoopDetection() {
    statesByDerivedKey.clear();
}

export default detectOnyxDerivedLoop;
export {resetOnyxDerivedLoopDetection, RECOMPUTE_THRESHOLD, WINDOW_MS};
