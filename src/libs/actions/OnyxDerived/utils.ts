import Onyx from 'react-native-onyx';
import type {OnyxInput} from 'react-native-onyx';
import type {NonEmptyTuple} from 'type-fest';
import type {OnyxDerivedKey, OnyxKey} from '@src/ONYXKEYS';
import type {DerivedValueContext} from './types';

/**
 * Check if a specific key exists in sourceValue from OnyxDerived
 */
const hasKeyTriggeredCompute = <TKey extends OnyxKey, Deps extends NonEmptyTuple<Exclude<OnyxKey, TKey>>>(key: TKey, sourceValues: DerivedValueContext<TKey, Deps>['sourceValues']) => {
    if (!sourceValues) {
        return false;
    }
    return Object.keys(sourceValues).some((sourceKey) => sourceKey === key);
};

/**
 * Set a derived value in Onyx
 */
const setDerivedValue = (key: OnyxDerivedKey, value: OnyxInput<OnyxDerivedKey>) =>
    Onyx.set(key, value, {
        // Don't skip cache check to prevent race conditions where default values might overwrite actual data.
        // See https://github.com/Expensify/App/pull/88719 for more context.
        skipCacheCheck: false,
    });

export {hasKeyTriggeredCompute, setDerivedValue};
