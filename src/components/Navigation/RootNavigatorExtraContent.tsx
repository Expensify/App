import type {ParamListBase} from '@react-navigation/native';
import React from 'react';
import SidePane from '@components/SidePane';
import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import TopLevelBottomTabBar from './TopLevelBottomTabBar';

type RootNavigatorExtraContentProps = {
    state: PlatformStackNavigationState<ParamListBase>;
};

function RootNavigatorExtraContent({state}: RootNavigatorExtraContentProps) {
    return (
        <>
            <TopLevelBottomTabBar state={state} />
            <SidePane />
        </>
    );
}

RootNavigatorExtraContent.displayName = 'RootNavigatorExtraContent';

export default RootNavigatorExtraContent;
