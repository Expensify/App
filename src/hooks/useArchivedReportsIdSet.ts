import {isArchivedReport} from '@libs/ReportUtils';
import type {ArchivedReportsIDSet} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/**
 * Hook that returns a Set of archived report IDs
 */
function useArchivedReportsIdSet(): ArchivedReportsIDSet {
    const [archivedReportsIdSet = new Set<string>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {
        canBeMissing: true,
        selector: (all): ArchivedReportsIDSet => {
            const ids = new Set<string>();
            if (!all) {
                return ids;
            }

            for (const [key, value] of Object.entries(all)) {
                if (isArchivedReport(value)) {
                    ids.add(key);
                }
            }
            return ids;
        },
    });

    return archivedReportsIdSet;
}

export default useArchivedReportsIdSet;
