import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useActionLoadingReportIDs(): ReadonlySet<string> {
    const [reportLoadingStates] = useOnyx(ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE);

    const ids = new Set<string>();
    if (!reportLoadingStates) {
        return ids;
    }

    for (const [key, value] of Object.entries(reportLoadingStates)) {
        if (value?.isActionLoading) {
            ids.add(key);
        }
    }

    return ids;
}

export default useActionLoadingReportIDs;
