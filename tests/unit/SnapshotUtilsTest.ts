import isSnapshotCompatibleKey from '@libs/SnapshotUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

describe('isSnapshotCompatibleKey', () => {
    it('accepts a member of a snapshot collection', () => {
        // Given a report key, from a collection that a Search snapshot carries
        const key = `${ONYXKEYS.COLLECTION.REPORT}123`;

        // When the key is matched against the snapshot collections
        const result = isSnapshotCompatibleKey(key, CONST.SEARCH.SNAPSHOT_ONYX_KEYS);

        // Then it matches, so a read of it inside a Search scope goes to the snapshot
        expect(result).toBe(true);
    });

    it('rejects a key that only shares a word with a snapshot collection', () => {
        // Given a report draft key, which starts with "report" but not with the report collection prefix
        const key = `${ONYXKEYS.COLLECTION.REPORT_DRAFT}1`;

        // When the key is matched against the snapshot collections
        const result = isSnapshotCompatibleKey(key, CONST.SEARCH.SNAPSHOT_ONYX_KEYS);

        // Then it does not match, so a read of it stays on live data
        expect(result).toBe(false);
    });
});
