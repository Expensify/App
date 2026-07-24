import Navigation from '@libs/Navigation/Navigation';

import {useCallback, useRef} from 'react';

function useActiveRoute() {
    const currentReportRHPActiveRoute = useRef('');

    const getReportRHPActiveRoute = useCallback(() => {
        if (!currentReportRHPActiveRoute.current) {
            currentReportRHPActiveRoute.current = Navigation.getReportRHPActiveRoute();
        }

        return currentReportRHPActiveRoute.current;
    }, []);

    return {getReportRHPActiveRoute};
}

export default useActiveRoute;
