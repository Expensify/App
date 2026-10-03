import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxData} from '@src/types/onyx/Request';

import type {OnyxKey, OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * Returns updates that clear the full policy snapshot marker of every policy whose members, tags or categories the
 * request writes locally. The marker tells the server which policy version the client fully holds, and a local write
 * (for example failure data that keeps an attempted value) changes that data without the server knowing.
 */
function getFullPolicySnapshotClearUpdates<TKey extends OnyxKey>(onyxData: OnyxData<TKey>): Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> {
    const policyIDs = new Set<string>();
    for (const updates of [onyxData.optimisticData, onyxData.successData, onyxData.failureData, onyxData.finallyData, onyxData.queueFlushedData]) {
        for (const update of updates ?? []) {
            const key = String(update.key);
            if (key.startsWith(ONYXKEYS.COLLECTION.POLICY_TAGS)) {
                policyIDs.add(key.slice(ONYXKEYS.COLLECTION.POLICY_TAGS.length));
            } else if (key.startsWith(ONYXKEYS.COLLECTION.POLICY_CATEGORIES)) {
                policyIDs.add(key.slice(ONYXKEYS.COLLECTION.POLICY_CATEGORIES.length));
            } else if (key.startsWith(ONYXKEYS.COLLECTION.POLICY) && !!update.value && typeof update.value === 'object' && 'employeeList' in update.value) {
                policyIDs.add(key.slice(ONYXKEYS.COLLECTION.POLICY.length));
            }
        }
    }

    return [...policyIDs].map((policyID) => ({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
        value: {fullPolicySnapshotLastModified: null},
    }));
}

export default getFullPolicySnapshotClearUpdates;
