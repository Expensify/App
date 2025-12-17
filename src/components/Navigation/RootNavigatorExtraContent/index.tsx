import React from 'react';
import TopLevelNavigationTabBar from '@components/Navigation/TopLevelNavigationTabBar';
import SidePanel from '@components/SidePanel';
import type RootNavigatorExtraContentProps from './types';

function RootNavigatorExtraContent({state}: RootNavigatorExtraContentProps) {
    return (
        <>
            <TopLevelNavigationTabBar state={state} />
            {/* On web, the SidePanel is rendered outside of the main navigator so it can be positioned alongside the screen */}
            <SidePanel />
        </>
    );
}

export default RootNavigatorExtraContent;
