import type {OnyxCollection, OnyxValue} from 'react-native-onyx';
import type {NonEmptyTuple, ValueOf} from 'type-fest';
import type {OnyxCollectionKey, OnyxCollectionValuesMapping, OnyxDerivedValuesMapping, OnyxKey} from '@src/ONYXKEYS';
import type ONYXKEYS from '@src/ONYXKEYS';

/**
 * A dependency declared with a selector that gates its changed-member delta by relevance.
 * Only meaningful for collection keys: the selector receives a single collection member, and a
 * reference-changed member only triggers a recompute when its projection differs. For a non-collection
 * key the selector argument resolves to `never`, so selectors are collection-only by construction.
 */
type OnyxDerivedDependencyWithSelector<K extends OnyxKey = OnyxKey> = {
    key: K;
    // Declared as a method (not an arrow property) so the `member` parameter is bivariant — this lets a
    // dependency typed for a specific key satisfy the general `OnyxDerivedDependency<OnyxKey>` constraint.
    selector(member: K extends keyof OnyxCollectionValuesMapping ? OnyxCollectionValuesMapping[K] | undefined : never): unknown;
    isEqual?: (a: unknown, b: unknown) => boolean;
};

/** A single declared dependency: a bare Onyx key, or the object form carrying a selector. */
type OnyxDerivedDependency<K extends OnyxKey = OnyxKey> = K | OnyxDerivedDependencyWithSelector<K>;

/** Extract the underlying Onyx key from either dependency form. */
type DepKey<D> = D extends OnyxDerivedDependencyWithSelector<infer K> ? K : D extends OnyxKey ? D : never;

type OnyxCollectionSourceValue<K extends OnyxKey> = K extends OnyxCollectionKey
    ? K extends keyof OnyxCollectionValuesMapping
        ? OnyxCollection<OnyxCollectionValuesMapping[K]>
        : never
    : never;

type DerivedSourceValues<Deps extends readonly OnyxDerivedDependency[]> = Partial<{
    [K in DepKey<Deps[number]>]: OnyxCollectionSourceValue<K>;
}>;

type DerivedValueContext<Key extends OnyxKey, Deps extends NonEmptyTuple<OnyxDerivedDependency>> = {
    currentValue?: OnyxValue<Key>;
    sourceValues?: DerivedSourceValues<Deps>;
};

/**
 * A derived value configuration describes:
 *  - a tuple of Onyx keys to subscribe to (dependencies). A dependency may be a bare key, or the object
 *    form `{key, selector, isEqual?}` that gates the collection delta by relevance (see OnyxDerivedDependency).
 *  - a compute function that derives a value from the dependent Onyx values.
 *    The compute function receives a single argument that's a tuple of the onyx values for the declared
 *    dependencies. Selectors never change the compute arguments — compute always receives the FULL
 *    `OnyxValue` for each dependency's key. For example, if your dependencies are `['report_', 'account']`,
 *    then compute receives a `[OnyxCollection<Report>, OnyxEntry<Account>]`.
 */
type OnyxDerivedValueConfig<Key extends ValueOf<typeof ONYXKEYS.DERIVED>, Deps extends NonEmptyTuple<OnyxDerivedDependency<Exclude<OnyxKey, Key>>>> = {
    key: Key;
    dependencies: Deps;
    compute: (
        args: {
            [Index in keyof Deps]: OnyxValue<DepKey<Deps[Index]>>;
        },
        context: DerivedValueContext<Key, Deps>,
    ) => OnyxDerivedValuesMapping[Key];
};

export type {OnyxDerivedValueConfig, DerivedValueContext, OnyxDerivedDependency, OnyxDerivedDependencyWithSelector, DepKey};
