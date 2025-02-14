/* eslint-disable rulesdir/prefer-onyx-connect-in-libs */
import {useSyncExternalStore} from 'react';
import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import type {NonEmptyTuple, ValueOf} from 'type-fest';
import {isThread} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {GetOnyxTypeForKey, OnyxKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';

type OnyxComputedValueConfig<Key extends string, Deps extends NonEmptyTuple<OnyxKey>> = {
    key: Key;
    dependencies: Deps;
    compute: (args: {
        -readonly [Index in keyof Deps]: GetOnyxTypeForKey<Deps[Index]>;
    }) => unknown;
};

/**
 * This helper function just reduces the boilerplate needed to create correctly-typed OnyxComputedValueConfig objects.
 * So rather than writing:
 *
 * const conciergeChatReportIDConfig: OnyxComputedValueConfig<typeof ONYXKEYS.COLLECTION.REPORT, typeof ONYXKEYS.CONCIERGE_REPORT_ID> = {
 *     dependencies: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.CONCIERGE_REPORT_ID],
 *     ...
 * };
 *
 * We just have:
 *
 * const conciergeChatReportIDConfig = createOnyxComputedValueConfig({
 *     dependencies: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.CONCIERGE_REPORT_ID]
 * })
 *
 * and the generics are inferred from the function parameter.
 */
function createOnyxComputedValueConfig<Key extends string, Deps extends NonEmptyTuple<OnyxKey>>(config: OnyxComputedValueConfig<Key, Deps>): OnyxComputedValueConfig<Key, Deps> {
    return config;
}

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

type ComputedValueStore<T> = {
    currentValue: T;
    subscribe: (cb: () => void) => () => void;
};
type ComputedValueStoreKey = ValueOf<typeof ONYX_COMPUTED_VALUES>['key'];

type ComputedValueStoreMap = {
    [K in ComputedValueStoreKey]: ComputedValueStore<
        ReturnType<
            Extract<
                ValueOf<typeof ONYX_COMPUTED_VALUES>,
                {
                    key: K;
                }
            >['compute']
        >
    >;
};

const computedValueStores: Partial<ComputedValueStoreMap> = {};

function createComputedValueStore(config: ValueOf<typeof ONYX_COMPUTED_VALUES>): ComputedValueStore<ReturnType<typeof config.compute>> {
    // Create an array to hold the current values for each dependency.
    // We force its type to the same tuple shape as expected by config.compute.
    const currentOnyxValues = new Array(config.dependencies.length) as Parameters<typeof config.compute>[0];
    const computedValue = config.compute(currentOnyxValues);

    const subscribers = new Set<() => void>();

    function recomputeValue() {
        const newComputedValue = config.compute(currentOnyxValues);
        if (newComputedValue !== computedValue) {
            for (const subscriber of subscribers) {
                subscriber();
            }
            subscribers.forEach((callback) => callback());
        }
    }

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
 * - The `config` should be one of the computed values configs from `ONYX_COMPUTED_VALUES`.
 * - This hook will only re-render when the computed value changes.
 */
function useComputedOnyxValue(config: ValueOf<typeof ONYX_COMPUTED_VALUES>): ReturnType<typeof config.compute> {
    const store = getComputedValueStore(config);
    return useSyncExternalStore(store.subscribe, () => store.currentValue);
}

export {ONYX_COMPUTED_VALUES};
export default useComputedOnyxValue;
