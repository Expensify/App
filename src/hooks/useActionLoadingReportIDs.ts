import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useActionLoadingReportIDs(): ReadonlySet<string> {
    const [reportMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT_METADATA);

    const ids = new Set<string>();
    if (!reportMetadata) {
        return ids;
    }

    for (const [key, value] of Object.entries(reportMetadata)) {
        if (value?.isActionLoading) {
            ids.add(key);
        }
    }

    return ids;
}

export default useActionLoadingReportIDs;
