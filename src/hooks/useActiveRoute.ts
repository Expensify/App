import Navigation from '@libs/Navigation/Navigation';

import {useRef} from 'react';

function useActiveRoute() {
    const currentReportRHPActiveRoute = useRef('');

    const getReportRHPActiveRoute = () => {
        if (!currentReportRHPActiveRoute.current) {
            currentReportRHPActiveRoute.current = Navigation.getReportRHPActiveRoute();
        }

        return currentReportRHPActiveRoute.current;
    };

    return {getReportRHPActiveRoute};
}

export default useActiveRoute;
