import isSnapshotCompatibleKey from '@libs/SnapshotUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

describe('isSnapshotCompatibleKey', () => {
    it('accepts a member of a snapshot collection', () => {
        // Given a report key, whose collection a Search snapshot carries
        const key = `${ONYXKEYS.COLLECTION.REPORT}123`;

        // When it is checked
        const result = isSnapshotCompatibleKey(key, CONST.SEARCH.SNAPSHOT_ONYX_KEYS);

        // Then it is redirected to the snapshot inside a Search scope
        expect(result).toBe(true);
    });

    it('rejects a key that only shares a word with a snapshot collection', () => {
        // Given a report draft key, which starts with "report" but not with the report collection prefix
        const key = `${ONYXKEYS.COLLECTION.REPORT_DRAFT}1`;

        // When it is checked
        const result = isSnapshotCompatibleKey(key, CONST.SEARCH.SNAPSHOT_ONYX_KEYS);

        // Then it stays on live data
        expect(result).toBe(false);
    });
});
