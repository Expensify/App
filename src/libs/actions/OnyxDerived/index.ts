/**
 * This file contains logic for derived Onyx keys. The idea behind derived keys is that if there is a common computation
 * that we're doing in many places across the app to derive some value from multiple Onyx values, we can move that
 * computation into this file, run it only once, and then share it across the app by storing the result of that computation in Onyx.
 *
 * The primary purpose is to optimize performance by reducing redundant computations. More info can be found in the README.
 */
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import Log from '@libs/Log';
import type {OnyxDerivedKey, OnyxDerivedValuesMapping} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type AssertTypesEqual from '@src/types/utils/AssertTypesEqual';
import ObjectUtils from '@src/types/utils/ObjectUtils';
import type SymmetricDifference from '@src/types/utils/SymmetricDifference';
import conciergeChatReportIDConfig from './configs/conciergeChatReportID';

/**
 * Global map of derived configs.
 * This object holds our derived value configurations.
 */
const ONYX_DERIVED_VALUES = {
    [ONYXKEYS.DERIVED.CONCIERGE_CHAT_REPORT_ID]: conciergeChatReportIDConfig,
} as const;

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
                    derivedValue = compute(values);
                    Onyx.set(key, derivedValue ?? null);
                });
            }

            const setDependencyValue = <Index extends number>(i: Index, value: Parameters<typeof compute>[0][Index]) => {
                dependencyValues[i] = value;
            };

            const recomputeDerivedValue = () => {
                const newDerivedValue = compute(dependencyValues);
                if (newDerivedValue !== derivedValue) {
                    Log.info(`[OnyxDerived] value for key ${key} changed, updating it in Onyx`, false, {old: derivedValue, new: newDerivedValue});
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
                            setDependencyValue(i, value);
                            recomputeDerivedValue();
                        },
                    });
                } else {
                    Onyx.connect({
                        key: dependencyOnyxKey,
                        callback: (value) => {
                            Log.info(`[OnyxDerived] dependency ${dependencyOnyxKey} for derived key ${key} changed, recomputing`);
                            setDependencyValue(i, value);
                            recomputeDerivedValue();
                        },
                    });
                }
            }
        });
    }
}

export default init;

// Note: we can't use `as const satisfies...` for ONYX_DERIVED_VALUES without losing type specificity.
// So these type assertions are here to help enforce that ONYX_DERIVED_VALUES has all the keys and the correct types,
// according to the type definitions for derived keys in ONYXKEYS.ts.
type MismatchedDerivedKeysError =
    `Error: ONYX_DERIVED_VALUES does not match ONYXKEYS.DERIVED or OnyxDerivedValuesMapping. The following keys are present in one or the other, but not both: ${SymmetricDifference<
        keyof typeof ONYX_DERIVED_VALUES,
        OnyxDerivedKey
    >}`;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type KeyAssertion = AssertTypesEqual<keyof typeof ONYX_DERIVED_VALUES, OnyxDerivedKey, MismatchedDerivedKeysError>;

type ExpectedDerivedValueComputeReturnTypes = {
    [Key in keyof OnyxDerivedValuesMapping]: OnyxEntry<OnyxDerivedValuesMapping[Key]>;
};
type ActualDerivedValueComputeReturnTypes = {
    [Key in keyof typeof ONYX_DERIVED_VALUES]: ReturnType<(typeof ONYX_DERIVED_VALUES)[Key]['compute']>;
};
type MismatchedDerivedValues = {
    [Key in keyof ExpectedDerivedValueComputeReturnTypes]: ExpectedDerivedValueComputeReturnTypes[Key] extends ActualDerivedValueComputeReturnTypes[Key] ? never : Key;
}[keyof ExpectedDerivedValueComputeReturnTypes];
type MismatchedDerivedValuesError =
    `Error: ONYX_DERIVED_VALUES does not match OnyxDerivedValuesMapping. The following configs have compute functions that do not return the correct type according to OnyxDerivedValuesMapping: ${MismatchedDerivedValues}`;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ComputeReturnTypeAssertion = AssertTypesEqual<MismatchedDerivedValues, never, MismatchedDerivedValuesError>;
