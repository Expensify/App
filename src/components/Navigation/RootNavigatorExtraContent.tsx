import type {ParamListBase} from '@react-navigation/native';
import React from 'react';
import SidePanel from '@components/SidePanel';
import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import TopLevelNavigationTabBar from './TopLevelNavigationTabBar';

type RootNavigatorExtraContentProps = {
    state: PlatformStackNavigationState<ParamListBase>;
};

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
