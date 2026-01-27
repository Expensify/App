import {archivedReportsIdSetSelector} from '@selectors/ReportNameValuePairs';
import {useMemo} from 'react';
import type {ArchivedReportsIDSet} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

const EMPTY_SET = new Set<string>();

/**
 * Hook that returns a Set of archived report IDs
 */
function useArchivedReportsIdSet(): ArchivedReportsIDSet {
    const [archivedReportsIdSet] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {
        canBeMissing: true,
        selector: archivedReportsIdSetSelector,
    });

    return useMemo(() => archivedReportsIdSet ?? EMPTY_SET, [archivedReportsIdSet]);
}

export default useArchivedReportsIdSet;
