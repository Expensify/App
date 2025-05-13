/**
 * This file contains logic for derived Onyx keys. The idea behind derived keys is that if there is a common computation
 * that we're doing in many places across the app to derive some value from multiple Onyx values, we can move that
 * computation into this file, run it only once, and then share it across the app by storing the result of that computation in Onyx.
 *
 * The primary purpose is to optimize performance by reducing redundant computations. More info can be found in the README.
 */
import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import Log from '@libs/Log';
import ObjectUtils from '@src/types/utils/ObjectUtils';
import ONYX_DERIVED_VALUES from './ONYX_DERIVED_VALUES';
import type {DerivedValueContext} from './types';

/**
 * Initialize all Onyx derived values, store them in Onyx, and setup listeners to update them when dependencies change.
 */
function init() {
    for (const [key, {compute, dependencies}] of ObjectUtils.typedEntries(ONYX_DERIVED_VALUES)) {
        let areAllConnectionsSet = false;
        let connectionsEstablishedCount = 0;
        const totalConnections = dependencies.length;
        const connectionInitializedFlags = new Array(totalConnections).fill(false);

        // Create an array to hold the current values for each dependency.
        // We cast its type to match the tuple expected by config.compute.
        let dependencyValues = new Array(totalConnections) as Parameters<typeof compute>[0];

        OnyxUtils.get(key).then((storedDerivedValue) => {
            let derivedValue = storedDerivedValue;
            if (derivedValue) {
                Log.info(`Derived value for ${key} restored from disk`);
            } else {
                OnyxUtils.tupleGet(dependencies).then((values) => {
                    const initialContext: DerivedValueContext<typeof key, typeof dependencies> = {
                        currentValue: derivedValue,
                        sourceValues: undefined,
                        areAllConnectionsSet: false,
                    };
                    // @ts-expect-error TypeScript can't confirm the shape of tupleGet's return value matches the compute function's parameters
                    derivedValue = compute(dependencyValues, initialContext);
                    dependencyValues = values;
                    Onyx.set(key, derivedValue ?? null);
                });
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

            const recomputeDerivedValue = (sourceKey?: string, sourceValue?: unknown, triggeredByIndex?: number) => {
                // If this recompute was triggered by a connection callback, check if it initializes the connection
                if (triggeredByIndex !== undefined) {
                    checkAndMarkConnectionInitialized(triggeredByIndex);
                }

                const context: DerivedValueContext<typeof key, typeof dependencies> = {
                    currentValue: derivedValue,
                    sourceValues: undefined,
                    areAllConnectionsSet,
                };

                // If we got a source key and value, add it to the sourceValues object
                if (sourceKey && sourceValue !== undefined) {
                    context.sourceValues = {
                        [sourceKey]: sourceValue,
                    };
                }
                // @ts-expect-error TypeScript can't confirm the shape of dependencyValues matches the compute function's parameters
                const newDerivedValue = compute(dependencyValues, context);
                Log.info(`[OnyxDerived] updating value for ${key} in Onyx`, false, {old: derivedValue ?? null, new: newDerivedValue ?? null});
                derivedValue = newDerivedValue;
                Onyx.set(key, derivedValue ?? null);
            };

            for (let i = 0; i < dependencies.length; i++) {
                const dependencyIndex = i;
                const dependencyOnyxKey = dependencies[dependencyIndex];

                if (OnyxUtils.isCollectionKey(dependencyOnyxKey)) {
                    Onyx.connect({
                        key: dependencyOnyxKey,
                        waitForCollectionCallback: true,
                        callback: (value, collectionKey, sourceValue) => {
                            Log.info(`[OnyxDerived] dependency ${collectionKey} for derived key ${key} changed, recomputing`);
                            setDependencyValue(dependencyIndex, value as Parameters<typeof compute>[0][typeof dependencyIndex]);
                            recomputeDerivedValue(dependencyOnyxKey, sourceValue, dependencyIndex);
                        },
                    });
                } else {
                    Onyx.connect({
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
