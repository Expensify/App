import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

type PrivateIsArchivedMap = Record<string, string | undefined>;

/**
 * Hook that returns a map of report IDs to their private_isArchived values
 */
function usePrivateIsArchivedMap(): PrivateIsArchivedMap {
    const [allReportNVP] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);

    const map: PrivateIsArchivedMap = {};
    if (allReportNVP) {
        for (const [key, value] of Object.entries(allReportNVP)) {
            map[key] = value?.private_isArchived;
        }
    }
    return map;
}

export default usePrivateIsArchivedMap;
export type {PrivateIsArchivedMap};
