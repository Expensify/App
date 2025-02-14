/* eslint-disable rulesdir/prefer-onyx-connect-in-libs */
import {useSyncExternalStore} from 'react';
import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import type {NonEmptyTuple, ValueOf} from 'type-fest';
import {isThread} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {GetOnyxTypeForKey, OnyxKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * A computed value configuration describes:
 *  - a unique key,
 *  - a tuple of Onyx keys to subscribe to (dependencies),
 *  - a compute function that derives a value from the dependent Onyx values.
 */
type OnyxComputedValueConfig<Key extends string, Deps extends NonEmptyTuple<OnyxKey>> = {
    key: Key;
    dependencies: Deps;
    compute: (args: {
        -readonly [Index in keyof Deps]: GetOnyxTypeForKey<Deps[Index]>;
    }) => unknown;
};

/**
 * Helper function to create a computed value config. This function is just here to help TypeScript infer Deps, so instead of writing this:
 *
 * const conciergeChatReportIDConfig: OnyxComputedValueConfig<typeof ONYXKEYS.COLLECTION.REPORT, typeof ONYXKEYS.CONCIERGE_REPORT_ID> = {
 *     dependencies: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.CONCIERGE_REPORT_ID],
 *     ...
 * };
 *
 * We can just write this:
 *
 * const conciergeChatReportIDConfig = createOnyxComputedValueConfig({
 *     dependencies: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.CONCIERGE_REPORT_ID]
 * })
 */
function createOnyxComputedValueConfig<Key extends string, Deps extends NonEmptyTuple<OnyxKey>>(config: OnyxComputedValueConfig<Key, Deps>): OnyxComputedValueConfig<Key, Deps> {
    return config;
}

/**
 * Global map of computed configs.
 * This object holds our computed value configurations.
 */
const ONYX_COMPUTED_VALUES = {
    CONCIERGE_CHAT_REPORT_ID: createOnyxComputedValueConfig({
        key: 'conciergeChatReportID',
        dependencies: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.CONCIERGE_REPORT_ID],
        compute: ([reports, conciergeChatReportID]) => {
            if (!reports) {
                return null;
            }

            const conciergeReport = Object.values(reports).find((report) => {
                if (!report?.participants || isThread(report)) {
                    return false;
                }

                const participantAccountIDs = new Set(Object.keys(report.participants));
                if (participantAccountIDs.size !== 2) {
                    return false;
                }

                return participantAccountIDs.has(CONST.ACCOUNT_ID.CONCIERGE.toString()) || report?.reportID === conciergeChatReportID;
            });

            return conciergeReport?.reportID;
        },
    }),
} as const;

/**
 * Interface for a computed value store.
 *
 * A computed value store holds the current computed value and a subscribe function.
 * When any dependency updates, the store recalculates the computed value and notifies its subscribers.
 */
type ComputedValueStore<T> = {
    currentValue: T;
    subscribe: (cb: () => void) => () => void;
};

/**
 * Get the union of all computed config keys from our ONYX_COMPUTED_VALUES map.
 */
type ComputedValueStoreKey = ValueOf<typeof ONYX_COMPUTED_VALUES>['key'];

/**
 * This type maps each config key (from ONYX_COMPUTED_VALUES)
 * to a ComputedValueStore whose currentValue type is the return type of that config's compute function.
 */
type ComputedValueStoreMap = {
    [K in ComputedValueStoreKey]: ComputedValueStore<
        ReturnType<
            // Extract from the union of computed configs the one with key K, then get its compute function.
            Extract<ValueOf<typeof ONYX_COMPUTED_VALUES>, {key: K}>['compute']
        >
    >;
};

/**
 * Global object holding our computed value stores.
 * We use a Partial so that we can lazily create each store when needed.
 */
const computedValueStores: Partial<ComputedValueStoreMap> = {};

/**
 * Creates a new computed value store for a given config.
 *
 * For each dependency key in the config, we create an array (currentOnyxValues)
 * that will hold the latest Onyx values. Then we call Onyx.connect for each dependency,
 * updating the corresponding entry in currentOnyxValues whenever the value changes.
 * After each update, we recalculate the computed value using the config.compute function.
 */
function createComputedValueStore(config: ValueOf<typeof ONYX_COMPUTED_VALUES>): ComputedValueStore<ReturnType<typeof config.compute>> {
    // Create an array to hold the current values for each dependency.
    // We cast its type to match the tuple expected by config.compute.
    const currentOnyxValues = new Array(config.dependencies.length) as Parameters<typeof config.compute>[0];
    let computedValue = config.compute(currentOnyxValues);

    const subscribers = new Set<() => void>();

    // Function to re-calculate the computed value and notify subscribers if it changes.
    function recomputeValue() {
        const newComputedValue = config.compute(currentOnyxValues);
        // If the computed value has changed, notify all subscribers.
        if (newComputedValue !== computedValue) {
            computedValue = newComputedValue;
            for (const subscriber of subscribers) {
                subscriber();
            }
        }
    }

    // Create Onyx subscriptions for each dependency.
    const connections = config.dependencies.map((onyxKey, index) =>
        OnyxUtils.isCollectionKey(onyxKey)
            ? Onyx.connect({
                  key: onyxKey,
                  waitForCollectionCallback: true,
                  callback: (value) => {
                      currentOnyxValues[index] = value;
                      recomputeValue();
                  },
              })
            : Onyx.connect({
                  key: onyxKey,
                  callback: (value) => {
                      currentOnyxValues[index] = value;
                      recomputeValue();
                  },
              }),
    );

    return {
        get currentValue() {
            return computedValue;
        },
        subscribe(cb: () => void) {
            subscribers.add(cb);
            return () => {
                subscribers.delete(cb);
                if (subscribers.size === 0) {
                    for (const connection of connections) {
                        Onyx.disconnect(connection);
                    }
                }
            };
        },
    };
}

/**
 * Retrieves (or creates if necessary) the computed value store for the given config.
 *
 * We use the config's literal key to index into our global computedValueStores object.
 * If a store for that key doesn't exist yet, we create it.
 */
function getComputedValueStore(config: ValueOf<typeof ONYX_COMPUTED_VALUES>) {
    let store = computedValueStores[config.key];
    if (!store) {
        store = createComputedValueStore(config);
        computedValueStores[config.key] = store;
    }
    return store;
}

/**
 * Hook that subscribes to a computed Onyx value.
 *
 * Pass in one of the computed configs from ONYX_COMPUTED_VALUES.
 * This hook uses React's useSyncExternalStore to subscribe to the computed store,
 * so that your component re-renders only when the computed value changes.
 */
function useComputedOnyxValue(config: ValueOf<typeof ONYX_COMPUTED_VALUES>): ReturnType<typeof config.compute> {
    const store = getComputedValueStore(config);
    return useSyncExternalStore(store.subscribe, () => store.currentValue);
}

export {ONYX_COMPUTED_VALUES};
export default useComputedOnyxValue;
