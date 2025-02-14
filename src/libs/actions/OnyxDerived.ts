import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import type {NonEmptyTuple, ValueOf} from 'type-fest';
import {isThread} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {GetOnyxTypeForKey, OnyxDerivedValuesMapping, OnyxKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import ObjectUtils from '@src/types/utils/ObjectUtils';

/**
 * A derived value configuration describes:
 *  - a tuple of Onyx keys to subscribe to (dependencies),
 *  - a compute function that derives a value from the dependent Onyx values.
 *    The compute function receives a single argument that's a tuple of the onyx values for the declared dependencies.
 *    For example, if your dependencies are `['report_', 'account'], then compute will receive a [OnyxCollection<Report>, OnyxEntry<Account>]
 */
type OnyxDerivedValueConfig<Key extends ValueOf<typeof ONYXKEYS.DERIVED>, Deps extends NonEmptyTuple<OnyxKey>> = {
    dependencies: Deps;
    compute: (args: {
        -readonly [Index in keyof Deps]: GetOnyxTypeForKey<Deps[Index]>;
    }) => OnyxEntry<OnyxDerivedValuesMapping[Key]>;
};

/**
 * Helper function to create a derived value config. This function is just here to help TypeScript infer Deps, so instead of writing this:
 *
 * const conciergeChatReportIDConfig: OnyxDerivedValueConfig<[typeof ONYXKEYS.COLLECTION.REPORT, typeof ONYXKEYS.CONCIERGE_REPORT_ID]> = {
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
function createOnyxDerivedValueConfig<Key extends ValueOf<typeof ONYXKEYS.DERIVED>, Deps extends NonEmptyTuple<OnyxKey>>(
    config: OnyxDerivedValueConfig<Key, Deps>,
): OnyxDerivedValueConfig<Key, Deps> {
    return config;
}

/**
 * Global map of derived configs.
 * This object holds our derived value configurations.
 */
const ONYX_DERIVED_VALUES = {
    [ONYXKEYS.DERIVED.CONCIERGE_CHAT_REPORT_ID]: createOnyxDerivedValueConfig({
        dependencies: [ONYXKEYS.COLLECTION.REPORT, ONYXKEYS.CONCIERGE_REPORT_ID],
        compute: ([reports, conciergeChatReportID]) => {
            if (!reports) {
                return undefined;
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
 * This helper exists to map an array of Onyx keys such as `['report_', 'conciergeReportID']`
 * to the values for those keys (correctly typed) such as `[OnyxCollection<Report>, OnyxEntry<string>]`
 *
 * Note: just using .map, you'd end up with `Array<OnyxCollection<Report>|OnyxEntry<string>>`, which is not what we want. This preserves the order of the keys provided.
 */
function getOnyxValues<Keys extends readonly OnyxKey[]>(keys: Keys): Promise<{[Index in keyof Keys]: GetOnyxTypeForKey<Keys[Index]>}> {
    return Promise.all(keys.map((key) => OnyxUtils.get(key))) as Promise<{[Index in keyof Keys]: GetOnyxTypeForKey<Keys[Index]>}>;
}

function init() {
    for (const [key, {compute, dependencies}] of ObjectUtils.typedEntries(ONYX_DERIVED_VALUES)) {
        // Create an array to hold the current values for each dependency.
        // We cast its type to match the tuple expected by config.compute.
        let dependencyValues = new Array(dependencies.length) as Parameters<typeof compute>[0];

        OnyxUtils.get(key).then((storedDerivedValue) => {
            let derivedValue = storedDerivedValue;
            if (!derivedValue) {
                getOnyxValues(dependencies).then((values) => {
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
                    derivedValue = newDerivedValue;
                    Onyx.set(key, derivedValue ?? null);
                }
            };

            for (let i = 0; i < dependencies.length; i++) {
                const dependencyOnyxKey = dependencies[i];
                if (OnyxUtils.isCollectionKey(dependencyOnyxKey)) {
                    Onyx.connect({
                        key: dependencyOnyxKey,
                        waitForCollectionCallback: true,
                        callback: (value) => {
                            setDependencyValue(i, value);
                            recomputeDerivedValue();
                        },
                    });
                } else {
                    Onyx.connect({
                        key: dependencyOnyxKey,
                        callback: (value) => {
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
