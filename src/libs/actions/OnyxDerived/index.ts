import getCollectionDelta from '@libs/getCollectionDelta';
import Log from '@libs/Log';
import {endSpan, getSpan, getSpanByPrefix, startSpan} from '@libs/telemetry/activeSpans';
import detectOnyxDerivedLoop from '@libs/telemetry/detectOnyxDerivedLoop';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {OnyxKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import ObjectUtils from '@src/types/utils/ObjectUtils';

import type {OnyxCollection, OnyxValue} from 'react-native-onyx';

/**
 * This file contains logic for derived Onyx keys. The idea behind derived keys is that if there is a common computation
 * that we're doing in many places across the app to derive some value from multiple Onyx values, we can move that
 * computation into this file, run it only once, and then share it across the app by storing the result of that computation in Onyx.
 *
 * The primary purpose is to optimize performance by reducing redundant computations. More info can be found in the README.
 */
import Onyx from 'react-native-onyx';
import OnyxCache, {TASK} from 'react-native-onyx/dist/OnyxCache';
import OnyxKeys from 'react-native-onyx/dist/OnyxKeys';

import type {DerivedValueContext} from './types';

import ONYX_DERIVED_VALUES from './ONYX_DERIVED_VALUES';
import {setDerivedValue} from './utils';

/**
 * Initialize all Onyx derived values, store them in Onyx, and setup listeners to update them when dependencies change.
 * Using connectWithoutView in this function since this is only executed once while initializing the App.
 */
function init() {
    for (const [key, {compute, dependencies, onReset}] of ObjectUtils.typedEntries(ONYX_DERIVED_VALUES)) {
        let areAllConnectionsSet = false;
        let connectionsEstablishedCount = 0;
        const totalConnections = dependencies.length;
        const connectionInitializedFlags = new Array(totalConnections).fill(false);

        // Create an array to hold the current values for each dependency.
        // We cast its type to match the tuple expected by config.compute.
        const dependencyValues = new Array(totalConnections) as Parameters<typeof compute>[0];

        // Hydrate the last stored derived value from disk before wiring up the dependency subscriptions.
        // We use a short-lived connectWithoutView (disconnected after the first callback) so this one-time
        // read goes through the public Onyx API instead of reaching into Onyx internals. Because it is
        // disconnected immediately, it won't re-fire when this same code later writes back to the derived key.
        new Promise<OnyxValue<typeof key>>((resolve) => {
            const connection = Onyx.connectWithoutView({
                key,
                callback: (storedDerivedValue) => {
                    Onyx.disconnect(connection);
                    resolve(storedDerivedValue);
                },
            });
        }).then((storedDerivedValue) => {
            let derivedValue = storedDerivedValue;
            if (derivedValue) {
                Log.info(`Derived value for ${key} restored from disk`);
            }

            const setDependencyValue = <Index extends number>(i: Index, value: Parameters<typeof compute>[0][Index]) => {
                dependencyValues[i] = value;
            };
            const checkAndMarkConnectionInitialized = (index: number) => {
                if (connectionInitializedFlags.at(index)) {
                    return;
                }

                connectionInitializedFlags[index] = true;
                connectionsEstablishedCount++;
                if (connectionsEstablishedCount === totalConnections) {
                    areAllConnectionsSet = true;
                    Log.info(`[OnyxDerived] All connections initialized for key: ${key}`);
                }
            };

            // Create context once outside the function, swap values inline to avoid overhead of creating new objects frequently
            const context: DerivedValueContext<typeof key, typeof dependencies> = {
                currentValue: undefined,
                sourceValues: undefined,
            };

            // Coalesce per-dependency recomputes from one logical change into a single compute on the next microtask.
            let flushScheduled = false;

            // Dependency indexes that fired since the last flush; their deltas are reconstructed at flush time.
            const pendingDependencyIndexes = new Set<number>();

            // Snapshot of each collection dependency captured at the last flush. We diff the current snapshot
            // against it to reconstruct the changed-member delta, instead of relying on Onyx's sourceValue.
            const lastFlushedCollectionValues = new Array<OnyxCollection<unknown>>(totalConnections);
            let hasFlushedOnce = false;

            // Guard so the clear reset runs once per clear window (see recomputeDerivedValue), not on every recompute.
            let clearHandled = false;

            // Called when Onyx is cleared. Coalescing collapses the clear (deps ->
            // undefined) and rehydrate (deps -> populated) into one flush, so the engine never observes the empty
            // intermediate state and would otherwise keep diffing rehydrated data against pre-clear state. Drop the
            // surviving derived value and delta baselines, and let the config reset its own module state, so the next
            // flush computes from scratch with the rehydrated dependencies.
            const resetForClear = () => {
                derivedValue = undefined;
                hasFlushedOnce = false;
                lastFlushedCollectionValues.length = 0;
                onReset?.();
            };

            const runCompute = (sourceValues: Record<string, unknown> | undefined, triggeredKeys: Set<OnyxKey>) => {
                context.currentValue = derivedValue;
                context.sourceValues = sourceValues as typeof context.sourceValues;
                context.triggeredKeys = triggeredKeys;

                const spanId = `${CONST.TELEMETRY.SPAN_ONYX_DERIVED_COMPUTE}_${key}`;
                // No-splash flows end ManualAppStartup before the startup response lands, so without this fallback onlyIfParent drops every recompute it triggers.
                const startupSpan = getSpan(CONST.TELEMETRY.SPAN_APP_STARTUP) ?? getSpanByPrefix(CONST.TELEMETRY.SPAN_STARTUP_DATA.APPLY);
                startSpan(spanId, {
                    name: CONST.TELEMETRY.SPAN_ONYX_DERIVED_COMPUTE,
                    op: CONST.TELEMETRY.SPAN_ONYX_DERIVED_COMPUTE,
                    parentSpan: startupSpan,
                    // A span with no parent is sent as its own transaction, one per recompute.
                    onlyIfParent: true,
                    attributes: {derivedKey: key, [CONST.TELEMETRY.ATTRIBUTE_IS_STARTUP]: !!startupSpan},
                });

                try {
                    // @ts-expect-error TypeScript can't confirm the shape of dependencyValues matches the compute function's parameters
                    const newDerivedValue = compute(dependencyValues, context);
                    Log.info(`[OnyxDerived] updating value for ${key} in Onyx`);
                    derivedValue = newDerivedValue;
                    setDerivedValue(key, derivedValue);
                } finally {
                    endSpan(spanId);
                }
            };

            // dependencyValues is a heterogeneous tuple typed to compute's params; reading a collection entry
            // by runtime index yields a union, so we narrow it back to a collection in one place.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            const readCollectionDependency = (index: number) => dependencyValues[index] as OnyxCollection<unknown>;

            const flushRecompute = () => {
                flushScheduled = false;

                // Reconstruct the source values at flush time by diffing each dependency that fired since the
                // last flush against its last-flushed snapshot. On the very first flush we have no baselines, so
                // we compute from scratch (undefined sourceValues) and capture snapshots for future diffs.
                //
                // We only STAGE the baseline advances / pending-set clear here and commit them after a
                // successful compute. If the compute throws, we keep the baselines and pending set intact so the
                // next dependency change re-diffs the accumulated delta and self-heals.
                let sourceValues: Record<string, unknown> | undefined;
                const stagedBaselines: Array<[number, OnyxCollection<unknown>]> = [];

                // Every dependency that fired this flush, regardless of whether it produced a delta. Configs use
                // this (not sourceValues) to detect which dependencies triggered — see hasKeyTriggeredCompute.
                const triggeredKeys = new Set<OnyxKey>();
                for (const index of pendingDependencyIndexes) {
                    triggeredKeys.add(dependencies[index]);
                }

                detectOnyxDerivedLoop(key, triggeredKeys);

                if (hasFlushedOnce) {
                    for (const index of pendingDependencyIndexes) {
                        const dependencyOnyxKey = dependencies[index];
                        if (OnyxKeys.isCollectionKey(dependencyOnyxKey)) {
                            const currentValue = readCollectionDependency(index);
                            const delta = getCollectionDelta<unknown>(currentValue, lastFlushedCollectionValues.at(index));
                            stagedBaselines.push([index, currentValue]);
                            if (delta !== undefined) {
                                sourceValues ??= {};
                                sourceValues[dependencyOnyxKey] = delta;
                            }
                        } else {
                            // Non-collection dependency: pass the entire value as the source value. A cleared value
                            // carries no incremental delta (the compute reads it live), so skip it.
                            const value = dependencyValues[index];
                            if (value !== undefined) {
                                sourceValues ??= {};
                                sourceValues[dependencyOnyxKey] = value;
                            }
                        }
                    }
                } else {
                    // Capture baselines for every collection dependency so the next flush can diff against them.
                    for (let index = 0; index < totalConnections; index++) {
                        if (OnyxKeys.isCollectionKey(dependencies[index])) {
                            stagedBaselines.push([index, readCollectionDependency(index)]);
                        }
                    }
                }

                try {
                    runCompute(sourceValues, triggeredKeys);
                } catch (error) {
                    // Leave the baselines and pending set intact so the next dependency change re-diffs the
                    // accumulated delta and recomputes. flushScheduled is already false, so it will reschedule.
                    Log.alert(`[OnyxDerived] compute for ${key} threw; keeping pending deltas so the next dependency change recomputes them`, {error});
                    return;
                }

                // Commit only after a successful compute.
                for (const [index, value] of stagedBaselines) {
                    lastFlushedCollectionValues[index] = value;
                }
                hasFlushedOnce = true;
                pendingDependencyIndexes.clear();
            };

            const recomputeDerivedValue = (triggeredByIndex: number) => {
                // If this recompute was triggered by a connection callback, check if it initializes the connection.
                if (!areAllConnectionsSet) {
                    checkAndMarkConnectionInitialized(triggeredByIndex);
                }

                // Before all connections are established, don't write to Onyx.
                // This prevents overwriting a valid disk-cached value with empty defaults,
                // and avoids N-1 unnecessary Onyx writes during initialization.
                // We still update dependencyValues via setDependencyValue so data accumulates correctly.
                if (!areAllConnectionsSet) {
                    Log.info(`[OnyxDerived] not all connections set for ${key}, deferring Onyx write`);
                    return;
                }

                // Reset engine + config state once per cache clear. The clear notifies
                // subscribers (deps -> undefined) while the CLEAR task is pending, so this fires during the clear;
                // the guard makes it run exactly once, and it re-arms after the task finishes.
                if (OnyxCache.hasPendingTask(TASK.CLEAR)) {
                    if (!clearHandled) {
                        clearHandled = true;
                        resetForClear();
                    }
                } else {
                    clearHandled = false;
                }

                pendingDependencyIndexes.add(triggeredByIndex);
                if (flushScheduled) {
                    return;
                }
                flushScheduled = true;
                // Flush on a microtask so the recompute lands before the next render/paint — keeping raw Onyx
                // data and derived data consistent within a render — while still coalescing every dependency
                // change delivered in this synchronous burst. The try/catch isolates a throw so it can't escape
                // as an uncaught microtask error; pending deltas are preserved (flushRecompute clears them only
                // on success), so the next dependency change re-flushes them.
                queueMicrotask(() => {
                    try {
                        flushRecompute();
                    } catch (error) {
                        Log.alert(`[OnyxDerived] flush for ${key} threw`, {error});
                    }
                });
            };

            for (let i = 0; i < dependencies.length; i++) {
                const dependencyIndex = i;
                const dependencyOnyxKey = dependencies[dependencyIndex];

                if (OnyxKeys.isCollectionKey(dependencyOnyxKey)) {
                    Onyx.connectWithoutView({
                        key: dependencyOnyxKey,
                        callback: (value, collectionKey) => {
                            Log.info(`[OnyxDerived] dependency ${collectionKey} for derived key ${key} changed, recomputing`);
                            setDependencyValue(dependencyIndex, value as Parameters<typeof compute>[0][typeof dependencyIndex]);
                            recomputeDerivedValue(dependencyIndex);
                        },
                    });
                } else if (dependencyOnyxKey === ONYXKEYS.NVP_PREFERRED_LOCALE) {
                    // Special case for locale, we want to recompute derived values when the locale change actually loads.
                    Onyx.connectWithoutView({
                        key: ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING,
                        callback: (value) => {
                            if (value ?? true) {
                                Log.info(`[OnyxDerived] translations are still loading, not recomputing derived value for ${key}`);
                                return;
                            }
                            Log.info(`[OnyxDerived] translations loaded, recomputing derived value for ${key}`);
                            const localeValue = IntlStore.getCurrentLocale();
                            if (!localeValue) {
                                Log.info(`[OnyxDerived] No locale found for derived key ${key}, skipping recompute`);
                                return;
                            }
                            Log.info(`[OnyxDerived] dependency ${dependencyOnyxKey} for derived key ${key} changed, recomputing`);
                            setDependencyValue(dependencyIndex, localeValue as Parameters<typeof compute>[0][typeof dependencyIndex]);
                            recomputeDerivedValue(dependencyIndex);
                        },
                    });
                } else {
                    Onyx.connectWithoutView({
                        key: dependencyOnyxKey,
                        callback: (value) => {
                            Log.info(`[OnyxDerived] dependency ${dependencyOnyxKey} for derived key ${key} changed, recomputing`);
                            setDependencyValue(dependencyIndex, value as Parameters<typeof compute>[0][typeof dependencyIndex]);
                            recomputeDerivedValue(dependencyIndex);
                        },
                    });
                }
            }
        });
    }
}

export default init;
