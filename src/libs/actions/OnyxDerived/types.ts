import type {OnyxCollection, OnyxValue} from 'react-native-onyx';
import type {NonEmptyTuple, ValueOf} from 'type-fest';
import type {OnyxCollectionKey, OnyxCollectionValuesMapping, OnyxDerivedValuesMapping, OnyxKey} from '@src/ONYXKEYS';
import type ONYXKEYS from '@src/ONYXKEYS';

type DerivedValueContext<Key extends OnyxKey, Deps extends NonEmptyTuple<Exclude<OnyxKey, Key>>> = {
    currentValue?: OnyxValue<Key>;
    sourceValues?: {
        [K in Deps[number] as K extends OnyxCollectionKey ? K : never]?: K extends keyof OnyxCollectionValuesMapping ? OnyxCollection<OnyxCollectionValuesMapping[K]> : never;
    };
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
