import type {OnyxCollectionKey, OnyxCollectionValuesMapping, OnyxDerivedValuesMapping, OnyxKey} from '@src/ONYXKEYS';
import type ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxCollection, OnyxValue} from 'react-native-onyx';
import type {NonEmptyTuple, ValueOf} from 'type-fest';

type OnyxCollectionSourceValue<K extends OnyxKey> = K extends OnyxCollectionKey
    ? K extends keyof OnyxCollectionValuesMapping
        ? OnyxCollection<OnyxCollectionValuesMapping[K]>
        : never
    : never;

type DerivedSourceValues<Deps extends readonly OnyxKey[]> = Partial<{
    [K in Deps[number]]: OnyxCollectionSourceValue<K>;
}>;

type DerivedValueContext<Key extends OnyxKey, Deps extends NonEmptyTuple<Exclude<OnyxKey, Key>>> = {
    currentValue?: OnyxValue<Key>;
    sourceValues?: DerivedSourceValues<Deps>;
    // The dependency keys that fired since the last flush. Unlike `sourceValues` (which only holds
    // non-empty deltas), this reflects every dependency that triggered — including a scalar cleared to
    // `undefined` or a collection with no changed members — so trigger-detection can't miss a fire.
    triggeredKeys?: Set<OnyxKey>;
};

/**
 * A derived value configuration describes:
 *  - a tuple of Onyx keys to subscribe to (dependencies),
 *  - a compute function that derives a value from the dependent Onyx values.
 *    The compute function receives a single argument that's a tuple of the onyx values for the declared dependencies.
 *    For example, if your dependencies are `['report_', 'account'], then compute will receive a [OnyxCollection<Report>, OnyxEntry<Account>]
 */
type OnyxDerivedValueConfig<Key extends ValueOf<typeof ONYXKEYS.DERIVED>, Deps extends NonEmptyTuple<Exclude<OnyxKey, Key>>> = {
    key: Key;
    dependencies: Deps;
    compute: (
        args: {
            [Index in keyof Deps]: OnyxValue<Deps[Index]>;
        },
        context: DerivedValueContext<Key, Deps>,
    ) => OnyxDerivedValuesMapping[Key];
};

export type {OnyxDerivedValueConfig, DerivedValueContext};
