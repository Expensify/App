import React from 'react';
import useLoadingBarVisibility from '@hooks/useLoadingBarVisibility';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import LoadingBar from './LoadingBar';

function HeaderLoadingBar() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldShowLoadingBar = useLoadingBarVisibility();

    return <LoadingBar shouldShow={shouldShowLoadingBar && shouldUseNarrowLayout} />;
}

export default HeaderLoadingBar;
