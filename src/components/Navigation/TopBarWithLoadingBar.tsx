import {useLoadingBarVisibility} from '@hooks/useInFlightRequests';

import React from 'react';

import type {TopBarProps} from './TopBar';

import TopBar from './TopBar';

type TopBarWithLoadingBarProps = Omit<TopBarProps, 'shouldShowLoadingBar'>;

/**
 * A thin wrapper around TopBar that encapsulates useLoadingBarVisibility().
 * Use this in places where shouldShowLoadingBar is NOT passed explicitly by the parent.
 */
function TopBarWithLoadingBar({breadcrumbLabel, shouldDisplaySearch, shouldDisplayHelpButton, cancelSearch, onBackButtonPress, children}: TopBarWithLoadingBarProps) {
    const shouldShowLoadingBar = useLoadingBarVisibility();
    return (
        <TopBar
            breadcrumbLabel={breadcrumbLabel}
            shouldDisplaySearch={shouldDisplaySearch}
            shouldDisplayHelpButton={shouldDisplayHelpButton}
            cancelSearch={cancelSearch}
            onBackButtonPress={onBackButtonPress}
            shouldShowLoadingBar={shouldShowLoadingBar}
        >
            {children}
        </TopBar>
    );
}

export default TopBarWithLoadingBar;
