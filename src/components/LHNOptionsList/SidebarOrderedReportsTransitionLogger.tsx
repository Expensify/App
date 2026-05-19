import {useEffect, useRef} from 'react';
import usePrevious from '@hooks/usePrevious';
import {useSidebarOrderedReportsState} from '@hooks/useSidebarOrderedReports';
import Log from '@libs/Log';

function SidebarOrderedReportsTransitionLogger() {
    const {orderedReports} = useSidebarOrderedReportsState();
    const orderedReportsLength = orderedReports.length;
    const prevOrderedReportsLength = usePrevious(orderedReportsLength);
    const firstRender = useRef(true);

    useEffect(() => {
        if (orderedReportsLength > 0 && prevOrderedReportsLength === 0) {
            Log.info('[useSidebarOrderedReports] Ordered reports went from empty to non-empty', false);
        }

        if (orderedReportsLength === 0 && (prevOrderedReportsLength ?? 0) > 0) {
            Log.info('[useSidebarOrderedReports] Ordered reports went from non-empty to empty', false);
        }

        if (firstRender.current && orderedReportsLength === 0) {
            Log.info('[useSidebarOrderedReports] Ordered reports initialized empty', false);
        }

        firstRender.current = false;
    }, [orderedReportsLength, prevOrderedReportsLength]);

    return null;
}

export default SidebarOrderedReportsTransitionLogger;
