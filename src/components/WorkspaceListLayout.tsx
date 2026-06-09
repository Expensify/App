import type {PropsWithChildren} from 'react';
import React from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';
import NAVIGATION_TABS from './Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from './Navigation/TabBarBottomContent';
import TopBarWithLoadingBar from './Navigation/TopBarWithLoadingBar';
import OfflineIndicator from './OfflineIndicator';
import ScreenWrapper from './ScreenWrapper';

type WorkspaceListLayoutProps = PropsWithChildren<{
    headerButton?: React.ReactNode;
    activeTabKey: 'workspaces' | 'domains';
}>;

export default function WorkspaceListLayout({children, activeTabKey, headerButton}: WorkspaceListLayoutProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();

    const isWorkspacesListPage = activeTabKey === 'workspaces';
    const testID = isWorkspacesListPage ? 'WorkspacesListPage' : 'DomainsListPage';
    const activeTabLabel = isWorkspacesListPage ? translate('common.workspaces') : translate('common.domains');

    return (
        <ScreenWrapper
            testID={testID}
            shouldEnableMaxHeight
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnablePickerAvoiding={false}
            bottomContentStyle={styles.overflowVisible}
            bottomContent={<TabBarBottomContent selectedTab={NAVIGATION_TABS.WORKSPACES} />}
        >
            <View style={[styles.flex1, styles.flexRow]}>
                <View style={[styles.flex1]}>
                    <TopBarWithLoadingBar
                        shouldDisplayHelpButton
                        breadcrumbLabel={activeTabLabel}
                        shouldDisplayAccountAvatar
                    >
                        <View style={[styles.pr3]}>{!shouldDisplayButtonsInSeparateLine && headerButton}</View>
                    </TopBarWithLoadingBar>

                    {shouldDisplayButtonsInSeparateLine && <View style={[styles.flexRow, styles.justifyContentEnd, styles.pr5, styles.pt1, styles.pb2]}>{headerButton}</View>}

                    {children}
                    {!shouldUseNarrowLayout && <OfflineIndicator style={styles.pl5} />}
                </View>
            </View>
        </ScreenWrapper>
    );
}
