import getFullPolicySnapshotClearUpdates from '@libs/FullPolicySnapshotUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

const clearUpdate = (policyID: string) => ({
    onyxMethod: Onyx.METHOD.MERGE,
    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
    value: {fullPolicySnapshotLastModified: null},
});

describe('getFullPolicySnapshotClearUpdates', () => {
    it('clears the marker of policies whose tags, categories or members are written locally', () => {
        // Given a request that writes tags, categories and members of three policies in different phases
        const onyxData = {
            optimisticData: [{onyxMethod: Onyx.METHOD.MERGE, key: `${ONYXKEYS.COLLECTION.POLICY_TAGS}A`, value: {}}],
            failureData: [{onyxMethod: Onyx.METHOD.MERGE, key: `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}B`, value: {}}],
            successData: [{onyxMethod: Onyx.METHOD.MERGE, key: `${ONYXKEYS.COLLECTION.POLICY}C`, value: {employeeList: {}}}],
        };

        // When the clear updates are built
        const updates = getFullPolicySnapshotClearUpdates(onyxData);

        // Then each policy's marker is cleared once, because the server does not know about these local changes
        expect(updates).toHaveLength(3);
        expect(updates).toEqual(expect.arrayContaining([clearUpdate('A'), clearUpdate('B'), clearUpdate('C')]));
    });

    it('does not clear the marker for writes that leave the snapshot data alone', () => {
        // Given a request that only renames a policy and updates a report
        const onyxData = {
            optimisticData: [
                {onyxMethod: Onyx.METHOD.MERGE, key: `${ONYXKEYS.COLLECTION.POLICY}A`, value: {name: 'New name'}},
                {onyxMethod: Onyx.METHOD.MERGE, key: `${ONYXKEYS.COLLECTION.REPORT}1`, value: {reportName: 'Report'}},
            ],
        };

        // When the clear updates are built
        const updates = getFullPolicySnapshotClearUpdates(onyxData);

        // Then nothing is cleared, so the next OpenReport can still skip the collections the client already has
        expect(updates).toEqual([]);
    });
});
