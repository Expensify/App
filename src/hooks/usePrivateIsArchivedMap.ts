import type {PrivateIsArchivedMap} from '@selectors/ReportNameValuePairs';
import {privateIsArchivedMapSelector} from '@selectors/ReportNameValuePairs';
import ONYXKEYS from '@src/ONYXKEYS';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import useDeepCompareRef from './useDeepCompareRef';
import useOnyx from './useOnyx';

/**
 * Hook that returns a map of report IDs to their private_isArchived values
 */
function usePrivateIsArchivedMap(): PrivateIsArchivedMap {
    const [privateIsArchivedMap = getEmptyObject<PrivateIsArchivedMap>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {
        canBeMissing: true,
        selector: privateIsArchivedMapSelector,
    });

    return useDeepCompareRef(privateIsArchivedMap) ?? {};
}

export default usePrivateIsArchivedMap;
