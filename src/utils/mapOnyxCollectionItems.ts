import type {OnyxCollection} from 'react-native-onyx';

export default function mapOnyxCollectionItems<Item, Collection extends OnyxCollection<Item>, RT>(collection: Collection, mapper: (item: Item) => RT) {
    return Object.entries(collection ?? {}).reduce((acc: NonNullable<OnyxCollection<RT>>, [key, item]) => {
        acc[key] = mapper(item as Item);
        return acc;
    }, {});
}
