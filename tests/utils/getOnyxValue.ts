import Onyx from 'react-native-onyx';
import type {KeyValueMapping, OnyxEntry, OnyxKey} from 'react-native-onyx';

export default function getOnyxValue<TKey extends OnyxKey>(key: TKey): Promise<OnyxEntry<KeyValueMapping[TKey]>> {
    return new Promise((resolve) => {
        Onyx.connect({
            key,
            callback: (value) => resolve(value),
        });
    });
}
