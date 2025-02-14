import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import type {NonEmptyTuple, ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {GetOnyxTypeForKey, OnyxKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import {isThread} from './ReportUtils';

/**
 * A derived value configuration describes:
 *  - a unique key,
 *  - a tuple of Onyx keys to subscribe to (dependencies),
 *  - a compute function that derives a value from the dependent Onyx values.
 */
type OnyxDerivedValueConfig<Key extends string, Deps extends NonEmptyTuple<OnyxKey>> = {
    key: Key;
    dependencies: Deps;
    compute: (args: {
        -readonly [Index in keyof Deps]: GetOnyxTypeForKey<Deps[Index]>;
    }) => unknown;
};

/**
 * Helper function to create a derived value config. This function is just here to help TypeScript infer Deps, so instead of writing this:
 *
 * const conciergeChatReportIDConfig: OnyxDerivedValueConfig<typeof ONYXKEYS.COLLECTION.REPORT, typeof ONYXKEYS.CONCIERGE_REPORT_ID> = {
 *     dependencies: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.CONCIERGE_REPORT_ID],
 *     ...
 * };
 *
 * We can just write this:
 *
 * const conciergeChatReportIDConfig = createOnyxDerivedValueConfig({
 *     dependencies: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.CONCIERGE_REPORT_ID]
 * })
 */
function createOnyxDerivedValueConfig<Key extends string, Deps extends NonEmptyTuple<OnyxKey>>(config: OnyxDerivedValueConfig<Key, Deps>): OnyxDerivedValueConfig<Key, Deps> {
    return config;
}

/**
 * Global map of derived configs.
 * This object holds our derived value configurations.
 */
const ONYX_DERIVED_VALUES = {
    CONCIERGE_CHAT_REPORT_ID: createOnyxDerivedValueConfig({
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
 * Interface for a derived value store.
 *
 * A derived value store holds the current derived value and a subscribe function.
 * When any dependency updates, the store recalculates the derived value and notifies its subscribers.
 */
type DerivedValueStore<T> = {
    currentValue: T;
    subscribe: (cb: () => void) => () => void;
};

/**
 * Get the union of all derived config keys from our ONYX_DERIVED_VALUES map.
 */
type DerivedValueStoreKey = ValueOf<typeof ONYX_DERIVED_VALUES>['key'];

/**
 * This type maps each config key (from ONYX_DERIVED_VALUES)
 * to a DerivedValueStore whose currentValue type is the return type of that config's compute function.
 */
type DerivedValueStoreMap = {
    [K in DerivedValueStoreKey]: DerivedValueStore<
        ReturnType<
            // Extract from the union of derived configs the one with key K, then get its compute function.
            Extract<ValueOf<typeof ONYX_DERIVED_VALUES>, {key: K}>['compute']
        >
    >;
};

/**
 * Global object holding our derived value stores.
 * We use a Partial so that we can lazily create each store when needed.
 */
const derivedValueStores: Partial<DerivedValueStoreMap> = {};

/**
 * Creates a new derived value store for a given config.
 *
 * For each dependency key in the config, we create an array (currentOnyxValues)
 * that will hold the latest Onyx values. Then we call Onyx.connect for each dependency,
 * updating the corresponding entry in currentOnyxValues whenever the value changes.
 * After each update, we recalculate the derived value using the config.compute function.
 */
function createDerivedValueStore(config: ValueOf<typeof ONYX_DERIVED_VALUES>): DerivedValueStore<ReturnType<typeof config.compute>> {
    // Create an array to hold the current values for each dependency.
    // We cast its type to match the tuple expected by config.compute.
    const currentOnyxValues = new Array(config.dependencies.length) as Parameters<typeof config.compute>[0];
    let derivedValue = config.compute(currentOnyxValues);

    const subscribers = new Set<() => void>();

    // Function to re-calculate the derived value and notify subscribers if it changes.
    function recomputeValue() {
        const newDerivedValue = config.compute(currentOnyxValues);
        // If the derived value has changed, notify all subscribers.
        if (newDerivedValue !== derivedValue) {
            derivedValue = newDerivedValue;
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
            return derivedValue;
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
 * Retrieves (or creates if necessary) the derived value store for the given config.
 *
 * We use the config's literal key to index into our global derivedValueStores object.
 * If a store for that key doesn't exist yet, we create it.
 */
function getDerivedValueStore(config: ValueOf<typeof ONYX_DERIVED_VALUES>) {
    let store = derivedValueStores[config.key];
    if (!store) {
        store = createDerivedValueStore(config);
        derivedValueStores[config.key] = store;
    }
    return store;
}

function get(config: ValueOf<typeof ONYX_DERIVED_VALUES>) {
    const store = getDerivedValueStore(config);
    return store.currentValue;
}

export {ONYX_DERIVED_VALUES};
export default {
    get,
    getDerivedValueStore,
};
