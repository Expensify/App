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

/**
 * Initialize all Onyx derived values, store them in Onyx, and setup listeners to update them when dependencies change.
 */
function init() {
    for (const [key, {compute, dependencies}] of ObjectUtils.typedEntries(ONYX_DERIVED_VALUES)) {
        // Create an array to hold the current values for each dependency.
        // We cast its type to match the tuple expected by config.compute.
        let dependencyValues = new Array(dependencies.length) as Parameters<typeof compute>[0];

        OnyxUtils.get(key).then((storedDerivedValue) => {
            let derivedValue = storedDerivedValue;
            if (derivedValue) {
                Log.info(`Derived value ${derivedValue} for ${key} restored from disk`);
            } else {
                OnyxUtils.tupleGet(dependencies).then((values) => {
                    dependencyValues = values;
                    derivedValue = compute(values, derivedValue);
                    Onyx.set(key, derivedValue ?? null);
                });
            }

            const setDependencyValue = <Index extends number>(i: Index, value: Parameters<typeof compute>[0][Index]) => {
                dependencyValues[i] = value;
            };

            const recomputeDerivedValue = () => {
                const newDerivedValue = compute(dependencyValues, derivedValue);
                if (newDerivedValue !== derivedValue) {
                    Log.info(`[OnyxDerived] value for key ${key} changed, updating it in Onyx`, false, {old: derivedValue ?? null, new: newDerivedValue ?? null});
                    derivedValue = newDerivedValue;
                    Onyx.set(key, derivedValue ?? null);
                }
            };

            for (let i = 0; i < dependencies.length; i++) {
                // eslint-disable-next-line rulesdir/prefer-at
                const dependencyOnyxKey = dependencies[i];
                if (OnyxUtils.isCollectionKey(dependencyOnyxKey)) {
                    Onyx.connect({
                        key: dependencyOnyxKey,
                        waitForCollectionCallback: true,
                        callback: (value) => {
                            Log.info(`[OnyxDerived] dependency ${dependencyOnyxKey} for derived key ${key} changed, recomputing`);
                            setDependencyValue(i, value as Parameters<typeof compute>[0][typeof i]);
                            recomputeDerivedValue();
                        },
                    });
                } else {
                    Onyx.connect({
                        key: dependencyOnyxKey,
                        callback: (value) => {
                            Log.info(`[OnyxDerived] dependency ${dependencyOnyxKey} for derived key ${key} changed, recomputing`);
                            setDependencyValue(i, value as Parameters<typeof compute>[0][typeof i]);
                            recomputeDerivedValue();
                        },
                    });
                }
            }
        });
    }
}

export default init;
