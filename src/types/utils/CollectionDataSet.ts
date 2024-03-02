import type {OnyxCollectionKey, OnyxCollectionValuesMapping} from '@src/ONYXKEYS';

/** Helps with typing a collection item update inside Onyx.multiSet call */
type CollectionDataSet<TCollectionKey extends OnyxCollectionKey> = Record<`${TCollectionKey}${string}`, OnyxCollectionValuesMapping[TCollectionKey]>;

export default CollectionDataSet;
