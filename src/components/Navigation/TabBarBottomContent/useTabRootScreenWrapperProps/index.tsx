import type TabBarBottomContentProps from '@components/Navigation/TabBarBottomContent/types';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type TabRootScreenWrapperProps from './types';

import TabBarBottomContent from '..';

/** The ScreenWrapper props that keep a tab root screen's content clear of the tab bar. */
function useTabRootScreenWrapperProps(selectedTab: TabBarBottomContentProps['selectedTab']): TabRootScreenWrapperProps {
    const styles = useThemeStyles();

    return {
        bottomContent: <TabBarBottomContent selectedTab={selectedTab} />,
        bottomContentStyle: styles.overflowVisible,
    };
}

export default useTabRootScreenWrapperProps;
