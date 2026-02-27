import React from 'react';
import TopLevelNavigationTabBar from '@components/Navigation/TopLevelNavigationTabBar';
import SidePanel from '@components/SidePanel';
import type {ExtraContentProps} from '@libs/Navigation/PlatformStackNavigation/types';

function RootNavigatorExtraContent({state, navigation}: ExtraContentProps) {
    return (
        <>
            <TopLevelNavigationTabBar state={state} />
            {/* On web, the SidePanel is rendered outside of the main navigator so it can be positioned alongside the screen */}
            <SidePanel navigation={navigation} />
        </>
    );
}

export default RootNavigatorExtraContent;
