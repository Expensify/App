import {useRoute} from '@react-navigation/native';
import {useMemo} from 'react';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import useOnyx from './useOnyx';

type UseReportFromDynamicRouteResult = {
    report: Report | null | undefined;
    reportID: string;
    isLoading: boolean;
};

/**
 * Hook to extract reportID from dynamic route path and fetch the report
 * Use this for dynamic routes like /r/123/settings/name where reportID is in the URL path
 */
function useReportFromDynamicRoute(): UseReportFromDynamicRouteResult {
    const route = useRoute();

    // Extract reportID from the current path
    const reportID = useMemo(() => {
        const currentPath = route.path ?? '';
        const match = currentPath.match(/\/r\/([^/]+)/);
        return match ? match[1] : '';
    }, [route.path]);

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [isLoadingReportData] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);

    return {
        report,
        reportID,
        isLoading: !reportID || (!report && !!isLoadingReportData),
    };
}

export default useReportFromDynamicRoute;
