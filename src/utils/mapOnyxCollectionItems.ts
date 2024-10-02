import type {OnyxCollection} from 'react-native-onyx';

export default function mapOnyxCollectionItems<TKey extends OnyxCollectionKey, TReturn, TEntryData = KeyValueMapping[TKey]>(
    collection: OnyxCollection<TEntryData>,
    mapper: (entry: OnyxEntry<TEntryData>) => TReturn,
): NonNullable<OnyxCollection<TReturn>> {
    return Object.entries(collection ?? {}).reduce((acc: NonNullable<OnyxCollection<TReturn>>, [key, entry]) => {
        acc[key] = mapper(entry);
        return acc;
    }, {});
}
