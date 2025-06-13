import Onyx from 'react-native-onyx';
import type {OnyxCollectionKey, OnyxCollectionValuesMapping, OnyxValues} from '@src/ONYXKEYS';
import type OnyxState from '@src/types/onyx/OnyxState';
import type CollectionDataSet from '@src/types/utils/CollectionDataSet';
import {KEYS_TO_PRESERVE} from './App';

function clearOnyxStateBeforeImport(): Promise<void> {
    return Onyx.clear(KEYS_TO_PRESERVE);
}

function importOnyxCollectionState(collectionsMap: Map<keyof OnyxCollectionValuesMapping, CollectionDataSet<OnyxCollectionKey>>): Promise<void[]> {
    const collectionPromises = Array.from(collectionsMap.entries()).map(([baseKey, items]) => {
        return items ? Onyx.setCollection(baseKey, items) : Promise.resolve();
    });
    return Promise.all(collectionPromises);
}

function importOnyxRegularState(state: OnyxState): Promise<void> {
    if (Object.keys(state).length > 0) {
        return Onyx.multiSet(state as Partial<OnyxValues>);
    }
    return Promise.resolve();
}

export {clearOnyxStateBeforeImport, importOnyxCollectionState, importOnyxRegularState};
