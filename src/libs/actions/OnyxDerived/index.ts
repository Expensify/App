/**
 * This file contains logic for derived Onyx keys. The idea behind derived keys is that if there is a common computation
 * that we're doing in many places across the app to derive some value from multiple Onyx values, we can move that
 * computation into this file, run it only once, and then share it across the app by storing the result of that computation in Onyx.
 *
 * The primary purpose is to optimize performance by reducing redundant computations. More info can be found in the README.
 */
import {shallowEqual} from 'fast-equals';
import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import OnyxKeys from 'react-native-onyx/dist/OnyxKeys';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import Log from '@libs/Log';
import {endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxKey} from '@src/ONYXKEYS';
import ObjectUtils from '@src/types/utils/ObjectUtils';
import ONYX_DERIVED_VALUES from './ONYX_DERIVED_VALUES';
import type {DerivedValueContext} from './types';
import {setDerivedValue} from './utils';

/**
 * A widened view of a dependency for the dispatcher to read its optional selector/isEqual without
 * caring about each config's precise per-key types. `selector` is a method (bivariant) so the precise
 * declared dependency is assignable to this — keeping `rawDependency as RawDependency` a safe upcast.
 */
type RawDependency = OnyxKey | {key: OnyxKey; selector?(member: unknown): unknown; isEqual?: (a: unknown, b: unknown) => boolean};

/**
 * For a dependency declared with a selector, narrows Onyx's native `sourceValue` (the changed collection
 * members) to only those whose selected slice actually changed, comparing each against the previous snapshot.
 * Returns the filtered partial collection, or `undefined` when no relevant member changed — so the caller can
 * skip the recompute. Members absent from the previous snapshot (added) are always kept.
 */
function selectRelevantSourceValue(
    sourceValue: Record<string, unknown>,
    currentCollection: OnyxCollection<unknown>,
    previousCollection: OnyxCollection<unknown>,
    selector: (member: unknown) => unknown,
    isEqual: (a: unknown, b: unknown) => boolean,
): Record<string, unknown> | undefined {
    const filtered: Record<string, unknown> = {};
    let hasRelevantChange = false;
    for (const memberKey of Object.keys(sourceValue)) {
        const previousMember = previousCollection?.[memberKey];
        // Reference-changed member whose projected slice is unchanged → irrelevant, drop it.
        if (previousMember !== undefined && isEqual(selector(currentCollection?.[memberKey]), selector(previousMember))) {
            continue;
        }
        filtered[memberKey] = sourceValue[memberKey];
        hasRelevantChange = true;
    }
    return hasRelevantChange ? filtered : undefined;
}

/**
 * Initialize all Onyx derived values, store them in Onyx, and setup listeners to update them when dependencies change.
 * Using connectWithoutView in this function since this is only executed once while initializing the App.
 */
function init() {
    for (const [key, {compute, dependencies}] of ObjectUtils.typedEntries(ONYX_DERIVED_VALUES)) {
        let areAllConnectionsSet = false;
        let connectionsEstablishedCount = 0;
        const totalConnections = dependencies.length;
        const connectionInitializedFlags = new Array(totalConnections).fill(false);

        // Create an array to hold the current values for each dependency.
        // We cast its type to match the tuple expected by config.compute.
        const dependencyValues = new Array(totalConnections) as Parameters<typeof compute>[0];

        OnyxUtils.get(key).then((storedDerivedValue) => {
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

            const recomputeDerivedValue = (sourceKey?: string, sourceValue?: unknown, triggeredByIndex?: number, isGatedBySelector = false) => {
                // If this recompute was triggered by a connection callback, check if it initializes the connection.
                // This must run even when gated, otherwise areAllConnectionsSet would never flip.
                if (!areAllConnectionsSet && triggeredByIndex !== undefined) {
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

                // A selector dependency whose changed members all projected to an unchanged slice carries no
                // relevant change — skip the recompute entirely. This is distinct from a plain `undefined`
                // sourceValue, which means "no incremental info" and still triggers a full recompute (e.g. initial load).
                if (isGatedBySelector) {
                    Log.info(`[OnyxDerived] no relevant change for dependency ${sourceKey} on ${key}, skipping recompute`);
                    return;
                }

                context.currentValue = derivedValue;
                context.sourceValues = sourceKey && sourceValue !== undefined ? {[sourceKey]: sourceValue} : undefined;

                const spanId = `${CONST.TELEMETRY.SPAN_ONYX_DERIVED_COMPUTE}_${key}`;
                startSpan(spanId, {
                    name: CONST.TELEMETRY.SPAN_ONYX_DERIVED_COMPUTE,
                    op: CONST.TELEMETRY.SPAN_ONYX_DERIVED_COMPUTE,
                    parentSpan: getSpan(CONST.TELEMETRY.SPAN_APP_STARTUP),
                    attributes: {derivedKey: key},
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

            for (let i = 0; i < dependencies.length; i++) {
                const dependencyIndex = i;
                // A dependency is either a bare Onyx key or the object form `{key, selector, isEqual?}`.
                // Read the key from the precise declared type (avoids widening it to all OnyxKeys), but read the
                // optional selector/isEqual through the widened RawDependency view.
                const rawDependency = dependencies[dependencyIndex];
                const dependencyOnyxKey = typeof rawDependency === 'object' ? rawDependency.key : rawDependency;
                const dependencyDescriptor = rawDependency as RawDependency;
                // `selector` is a method (bivariant, for type-variance reasons in ./types), so reading it as a value
                // trips `unbound-method` — safe to ignore: derived-value selectors are pure standalone functions.
                // eslint-disable-next-line @typescript-eslint/unbound-method
                const dependencySelector = typeof dependencyDescriptor === 'object' ? dependencyDescriptor.selector : undefined;
                const dependencyIsEqual = typeof dependencyDescriptor === 'object' ? dependencyDescriptor.isEqual : undefined;

                if (OnyxKeys.isCollectionKey(dependencyOnyxKey)) {
                    // Track the previous snapshot per dependency so a selector can compare each changed member's
                    // projection against its prior value. Structural sharing keeps unchanged members reference-equal.
                    let previousCollectionValue: OnyxCollection<unknown>;
                    Onyx.connectWithoutView({
                        key: dependencyOnyxKey,
                        waitForCollectionCallback: true,
                        callback: (value, collectionKey, sourceValue) => {
                            Log.info(`[OnyxDerived] dependency ${collectionKey} for derived key ${key} changed, recomputing`);
                            setDependencyValue(dependencyIndex, value as Parameters<typeof compute>[0][typeof dependencyIndex]);

                            let effectiveSourceValue = sourceValue as Record<string, unknown> | undefined;
                            let isGatedBySelector = false;
                            // Only filter when a selector is declared AND Onyx gave us an incremental delta.
                            // A missing sourceValue (initial load) must still trigger a full recompute, so it is never gated.
                            if (dependencySelector && effectiveSourceValue) {
                                effectiveSourceValue = selectRelevantSourceValue(effectiveSourceValue, value, previousCollectionValue, dependencySelector, dependencyIsEqual ?? shallowEqual);
                                isGatedBySelector = effectiveSourceValue === undefined;
                            }
                            previousCollectionValue = value;
                            recomputeDerivedValue(dependencyOnyxKey, effectiveSourceValue, dependencyIndex, isGatedBySelector);
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
                            recomputeDerivedValue(dependencyOnyxKey, localeValue, dependencyIndex);
                        },
                    });
                } else {
                    Onyx.connectWithoutView({
                        key: dependencyOnyxKey,
                        callback: (value) => {
                            Log.info(`[OnyxDerived] dependency ${dependencyOnyxKey} for derived key ${key} changed, recomputing`);
                            setDependencyValue(dependencyIndex, value as Parameters<typeof compute>[0][typeof dependencyIndex]);
                            // if the dependency is not a collection, pass the entire value as the source value
                            recomputeDerivedValue(dependencyOnyxKey, value, dependencyIndex);
                        },
                    });
                }
            }
        });
    }
}

export default init;
