import {useMemo} from 'react';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useActionLoadingReportIDs(): ReadonlySet<string> {
    const [reportMetadata] = useOnyx(ONYXKEYS.COLLECTION.REPORT_METADATA);

    return useMemo(() => {
        if (!reportMetadata) {
            return CONST.EMPTY_SET;
        }

        const ids = new Set<string>();
        for (const [key, value] of Object.entries(reportMetadata)) {
            if (value?.isActionLoading) {
                ids.add(key);
            }
        }

        return ids.size > 0 ? ids : CONST.EMPTY_SET;
    }, [reportMetadata]);
}

export default useActionLoadingReportIDs;
