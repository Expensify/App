import Onyx from 'react-native-onyx';
import type {OnyxKey, OnyxValue} from 'react-native-onyx';

export default function getOnyxValue<TKey extends OnyxKey>(key: TKey): Promise<OnyxValue<TKey>> {
    return new Promise((resolve) => {
        Onyx.connect({
            key,
            callback: (value) => resolve(value),
        });
    });
}
