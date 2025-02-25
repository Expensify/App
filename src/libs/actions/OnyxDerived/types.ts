import type {OnyxValue} from 'react-native-onyx';
import type {NonEmptyTuple, ValueOf} from 'type-fest';
import type {OnyxDerivedValuesMapping, OnyxKey} from '@src/ONYXKEYS';
import type ONYXKEYS from '@src/ONYXKEYS';

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
        currentValue: OnyxValue<Key>,
    ) => OnyxDerivedValuesMapping[Key];
};

// eslint-disable-next-line import/prefer-default-export
export type {OnyxDerivedValueConfig};
