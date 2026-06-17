import {useMemo} from 'react';
import {buildArchivedReportsIDSet} from '@libs/ReportUtils';
import type {ArchivedReportsIDSet} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/**
 * Hook that returns a Set of archived report IDs.
 *
 * Memoized on the source Onyx value so the returned Set keeps a stable reference across renders
 * when nothing changed — consumers that feed it into a `useMemo`/`useCallback`/useOnyx-selector
 * dependency (e.g. WorkspaceRoomsPage, OptionListContextProvider) would otherwise recompute every
 * render, which never settles under the store-based engine.
 */
function useArchivedReportsIDSet(): ArchivedReportsIDSet {
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);

    return useMemo(() => buildArchivedReportsIDSet(reportNameValuePairs), [reportNameValuePairs]);
}

export default useArchivedReportsIDSet;
