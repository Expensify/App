import React from 'react';
import TopLevelNavigationTabBar from '@components/Navigation/TopLevelNavigationTabBar';
import SidePanel from '@components/SidePanel';
import type RootNavigatorExtraContentProps from './types';

function RootNavigatorExtraContent({state}: RootNavigatorExtraContentProps) {
    return (
        <>
            <TopLevelNavigationTabBar state={state} />
            <SidePanel />
        </>
    );
}

RootNavigatorExtraContent.displayName = 'RootNavigatorExtraContent';

export default RootNavigatorExtraContent;
