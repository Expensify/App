import Onyx from 'react-native-onyx';
import type {OnyxCollectionKey, OnyxCollectionValuesMapping, OnyxValues} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type OnyxState from '@src/types/onyx/OnyxState';
import type CollectionDataSet from '@src/types/utils/CollectionDataSet';
import {KEYS_TO_PRESERVE} from './App';

function clearOnyxStateBeforeImport(): Promise<void> {
    return Onyx.clear(KEYS_TO_PRESERVE);
}

function importOnyxCollectionState(collectionsMap: Map<keyof OnyxCollectionValuesMapping, CollectionDataSet<OnyxCollectionKey>>): Promise<void> {
    // Set all other collections first (in parallel), then set REPORT last.
    // The LHN rebuild is triggered when REPORT data arrives. It depends on
    // module-level caches (allReportActions, transactions, policies, etc.) that
    // are populated by their own Onyx.connect subscribers. By deferring REPORT,
    // those caches are already populated when the LHN re-evaluates.
    const otherPromises: Array<Promise<void>> = [];
    let reportItems: CollectionDataSet<OnyxCollectionKey> | undefined;

    for (const [baseKey, items] of collectionsMap.entries()) {
        if (!items) {
            continue;
        }
        if (baseKey === ONYXKEYS.COLLECTION.REPORT) {
            reportItems = items;
        } else {
            otherPromises.push(Onyx.setCollection(baseKey, items));
        }
    }

    return Promise.all(otherPromises)
        .then(() => (reportItems ? Onyx.setCollection(ONYXKEYS.COLLECTION.REPORT, reportItems as CollectionDataSet<typeof ONYXKEYS.COLLECTION.REPORT>) : undefined))
        .then(() => {});
}

function importOnyxRegularState(state: OnyxState): Promise<void> {
    if (Object.keys(state).length > 0) {
        return Onyx.multiSet(state as Partial<OnyxValues>);
    }
    return Promise.resolve();
}

export {clearOnyxStateBeforeImport, importOnyxCollectionState, importOnyxRegularState};
