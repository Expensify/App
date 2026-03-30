import type {OnyxCollection} from 'react-native-onyx';
import {isReportPendingDelete} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import useOnyx from './useOnyx';

/**
 * Returns sorted keys of reports pending deletion.
 * Sorted string[] keeps Onyx comparison cheap (PERF-11).
 */
const selectPendingDeleteReportKeys = (reports: OnyxCollection<Report>): string[] => {
    const keys: string[] = [];
    for (const [key, report] of Object.entries(reports ?? {})) {
        if (isReportPendingDelete(report)) {
            keys.push(key);
        }
    }
    return keys.sort();
};

/**
 * Filters out report IDs whose corresponding reports have a pending DELETE action.
 * Subscribes to the REPORT collection with a lightweight selector to minimize re-renders.
 */
function useFilterPendingDeleteReports(ids: ReadonlyArray<string | undefined>): Array<string | undefined> {
    const [pendingDeleteReportKeys = CONST.EMPTY_ARRAY] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: selectPendingDeleteReportKeys});
    const pendingDeleteReportKeysSet = new Set(pendingDeleteReportKeys);

    return ids.filter((id) => {
        if (!id) {
            return false;
        }
        return !pendingDeleteReportKeysSet.has(`${ONYXKEYS.COLLECTION.REPORT}${id}`);
    });
}

export {selectPendingDeleteReportKeys};
export default useFilterPendingDeleteReports;
