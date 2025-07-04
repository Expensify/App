import type {NonEmptyTuple} from 'type-fest';
import type {OnyxKey} from '@src/ONYXKEYS';
import type {DerivedValueContext} from './types';

/**
 * Check if a specific key exists in sourceValue from OnyxDerived
 */
const hasKeyTriggeredCompute = <K extends OnyxKey, Deps extends NonEmptyTuple<Exclude<OnyxKey, K>>>(key: K, sourceValues: DerivedValueContext<K, Deps>['sourceValues']) => {
    if (!sourceValues) {
        return false;
    }
    return Object.keys(sourceValues).some((sourceKey) => sourceKey === key);
};

export default hasKeyTriggeredCompute;
