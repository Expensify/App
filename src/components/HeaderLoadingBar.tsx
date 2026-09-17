import {useLoadingBarVisibility} from '@hooks/useInFlightRequests';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import React from 'react';

import LoadingBar from './LoadingBar';

function HeaderLoadingBar() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldShowLoadingBar = useLoadingBarVisibility();

    return <LoadingBar shouldShow={shouldShowLoadingBar && shouldUseNarrowLayout} />;
}

export default HeaderLoadingBar;
