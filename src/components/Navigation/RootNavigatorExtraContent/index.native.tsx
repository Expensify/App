import React from 'react';
import TopLevelNavigationTabBar from '@components/Navigation/TopLevelNavigationTabBar';
import type RootNavigatorExtraContentProps from './types';

function RootNavigatorExtraContent({state}: RootNavigatorExtraContentProps) {
    return <TopLevelNavigationTabBar state={state} />;
}

RootNavigatorExtraContent.displayName = 'RootNavigatorExtraContent';

export default RootNavigatorExtraContent;
