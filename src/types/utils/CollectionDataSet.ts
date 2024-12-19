import type {OnyxInputValue} from 'react-native-onyx';
import type {OnyxCollectionKey, OnyxCollectionValuesMapping} from '@src/ONYXKEYS';

/** Helps with typing a collection item update inside Onyx.multiSet call */
type CollectionDataSet<TCollectionKey extends OnyxCollectionKey> = Record<`${TCollectionKey}${string}`, OnyxInputValue<OnyxCollectionValuesMapping[TCollectionKey]>>;

const toCollectionDataSet = <TCollectionKey extends OnyxCollectionKey>(
    collectionKey: TCollectionKey,
    collection: Array<OnyxInputValue<OnyxCollectionValuesMapping[TCollectionKey]>>,
    idSelector: (collectionValue: OnyxCollectionValuesMapping[TCollectionKey]) => string | undefined,
) => {
    const collectionDataSet = collection.reduce<CollectionDataSet<TCollectionKey>>((result, collectionValue) => {
        if (collectionValue) {
            // eslint-disable-next-line no-param-reassign
            result[`${collectionKey}${idSelector(collectionValue)}`] = collectionValue;
        }
        return result;
    }, {} as CollectionDataSet<TCollectionKey>);

    return collectionDataSet;
};

export default CollectionDataSet;

export {toCollectionDataSet};
