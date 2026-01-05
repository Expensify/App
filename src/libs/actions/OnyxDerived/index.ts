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
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import ObjectUtils from '@src/types/utils/ObjectUtils';
import ONYX_DERIVED_VALUES from './ONYX_DERIVED_VALUES';
import type {DerivedValueContext} from './types';
import {setDerivedValue} from './utils';

/**
 * Initialize all Onyx derived values, store them in Onyx, and setup listeners to update them when dependencies change.
 * Using connectWithoutView in this function since this is only executed once while initializing the App.
 */
function init() {
    // for (const [key, {compute, dependencies}] of ObjectUtils.typedEntries(ONYX_DERIVED_VALUES)) {
    //     let areAllConnectionsSet = false;
    //     let connectionsEstablishedCount = 0;
    //     const totalConnections = dependencies.length;
    //     const connectionInitializedFlags = new Array(totalConnections).fill(false);

    //     // Create an array to hold the current values for each dependency.
    //     // We cast its type to match the tuple expected by config.compute.
    //     let dependencyValues = new Array(totalConnections) as Parameters<typeof compute>[0];

    //     OnyxUtils.get(key).then((storedDerivedValue) => {
    //         let derivedValue = storedDerivedValue;
    //         if (derivedValue) {
    //             Log.info(`Derived value for ${key} restored from disk`);
    //         } else {
    //             OnyxUtils.tupleGet(dependencies).then((values) => {
    //                 const initialContext: DerivedValueContext<typeof key, typeof dependencies> = {
    //                     currentValue: derivedValue,
    //                     sourceValues: undefined,
    //                     areAllConnectionsSet: false,
    //                 };
    //                 // @ts-expect-error TypeScript can't confirm the shape of dependencyValues matches the compute function's parameters
    //                 derivedValue = compute(dependencyValues, initialContext);
    //                 dependencyValues = values;
    //                 setDerivedValue(key, derivedValue ?? null);
    //             });
    //         }

    //         const setDependencyValue = <Index extends number>(i: Index, value: Parameters<typeof compute>[0][Index]) => {
    //             dependencyValues[i] = value;
    //         };
    //         const checkAndMarkConnectionInitialized = (index: number) => {
    //             if (connectionInitializedFlags.at(index)) {
    //                 return;
    //             }

    //             connectionInitializedFlags[index] = true;
    //             connectionsEstablishedCount++;
    //             if (connectionsEstablishedCount === totalConnections) {
    //                 areAllConnectionsSet = true;
    //                 Log.info(`[OnyxDerived] All connections initialized for key: ${key}`);
    //             }
    //         };

    //         // Create context once outside the function, swap values inline to avoid overhead of creating new objects frequently
    //         const context: DerivedValueContext<typeof key, typeof dependencies> = {
    //             currentValue: undefined,
    //             sourceValues: undefined,
    //             areAllConnectionsSet: false,
    //         };

    //         const recomputeDerivedValue = (sourceKey?: string, sourceValue?: unknown, triggeredByIndex?: number) => {
    //             // If this recompute was triggered by a connection callback, check if it initializes the connection
    //             if (triggeredByIndex !== undefined) {
    //                 checkAndMarkConnectionInitialized(triggeredByIndex);
    //             }

    //             context.currentValue = derivedValue;
    //             context.areAllConnectionsSet = areAllConnectionsSet;
    //             context.sourceValues = sourceKey && sourceValue !== undefined ? {[sourceKey]: sourceValue} : undefined;

    //             // @ts-expect-error TypeScript can't confirm the shape of dependencyValues matches the compute function's parameters
    //             const newDerivedValue = compute(dependencyValues, context);
    //             Log.info(`[OnyxDerived] updating value for ${key} in Onyx`);
    //             derivedValue = newDerivedValue;
    //             setDerivedValue(key, derivedValue);
    //         };

    //         for (let i = 0; i < dependencies.length; i++) {
    //             const dependencyIndex = i;
    //             const dependencyOnyxKey = dependencies[dependencyIndex];

    //             if (OnyxUtils.isCollectionKey(dependencyOnyxKey)) {
    //                 Onyx.connectWithoutView({
    //                     key: dependencyOnyxKey,
    //                     waitForCollectionCallback: true,
    //                     callback: (value, collectionKey, sourceValue) => {
    //                         Log.info(`[OnyxDerived] dependency ${collectionKey} for derived key ${key} changed, recomputing`);
    //                         setDependencyValue(dependencyIndex, value as Parameters<typeof compute>[0][typeof dependencyIndex]);
    //                         recomputeDerivedValue(dependencyOnyxKey, sourceValue, dependencyIndex);
    //                     },
    //                 });
    //             } else if (dependencyOnyxKey === ONYXKEYS.NVP_PREFERRED_LOCALE) {
    //                 // Special case for locale, we want to recompute derived values when the locale change actually loads.
    //                 Onyx.connectWithoutView({
    //                     key: ONYXKEYS.ARE_TRANSLATIONS_LOADING,
    //                     initWithStoredValues: false,
    //                     callback: (value) => {
    //                         if (value ?? true) {
    //                             Log.info(`[OnyxDerived] translations are still loading, not recomputing derived value for ${key}`);
    //                             return;
    //                         }
    //                         Log.info(`[OnyxDerived] translations loaded, recomputing derived value for ${key}`);
    //                         const localeValue = IntlStore.getCurrentLocale();
    //                         if (!localeValue) {
    //                             Log.info(`[OnyxDerived] No locale found for derived key ${key}, skipping recompute`);
    //                             return;
    //                         }
    //                         Log.info(`[OnyxDerived] dependency ${dependencyOnyxKey} for derived key ${key} changed, recomputing`);
    //                         setDependencyValue(dependencyIndex, localeValue as Parameters<typeof compute>[0][typeof dependencyIndex]);
    //                         recomputeDerivedValue(dependencyOnyxKey, localeValue, dependencyIndex);
    //                     },
    //                 });
    //             } else {
    //                 Onyx.connectWithoutView({
    //                     key: dependencyOnyxKey,
    //                     callback: (value) => {
    //                         Log.info(`[OnyxDerived] dependency ${dependencyOnyxKey} for derived key ${key} changed, recomputing`);
    //                         setDependencyValue(dependencyIndex, value as Parameters<typeof compute>[0][typeof dependencyIndex]);
    //                         // if the dependency is not a collection, pass the entire value as the source value
    //                         recomputeDerivedValue(dependencyOnyxKey, value, dependencyIndex);
    //                     },
    //                 });
    //             }
    //         }
    //     });
    // }
}

export default init;
