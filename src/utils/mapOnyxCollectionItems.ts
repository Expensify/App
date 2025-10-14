import type {KeyValueMapping, OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {OnyxCollectionKey} from '@src/ONYXKEYS';

export default function mapOnyxCollectionItems<TKey extends OnyxCollectionKey, TReturn, TEntryData = KeyValueMapping[TKey]>(
    collection: OnyxCollection<TEntryData>,
    mapper: (entry: OnyxEntry<TEntryData>, key: TKey) => TReturn,
): NonNullable<OnyxCollection<TReturn>> {
    return Object.entries(collection ?? {}).reduce((acc: NonNullable<OnyxCollection<TReturn>>, [key, entry]) => {
        acc[key] = mapper(entry, key as TKey);
        return acc;
    }, {});
}
