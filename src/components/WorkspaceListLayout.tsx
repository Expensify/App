import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

import NAVIGATION_TABS from './Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from './Navigation/TabBarBottomContent';
import TopBarWithLoadingBar from './Navigation/TopBarWithLoadingBar';
import OfflineIndicator from './OfflineIndicator';
import ScreenWrapper from './ScreenWrapper';
import TabSelectorBase from './TabSelector/TabSelectorBase';

type WorkspaceListActiveTabKey = 'workspaces' | 'domains';

type WorkspaceListHeaderContentProps = {
    activeTabKey: WorkspaceListActiveTabKey;
    headerButton?: React.ReactNode;
    shouldShowHeaderButton?: boolean;
};

type WorkspaceListLayoutProps = {
    children: React.ReactNode;
    headerButton?: React.ReactNode;
    headerComponent?: React.ReactElement;
    activeTabKey: WorkspaceListActiveTabKey;
    scrollHeaderWithTable?: boolean;
};

function WorkspaceListHeaderContent({activeTabKey, headerButton, shouldShowHeaderButton = true}: WorkspaceListHeaderContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Globe', 'Building']);
    const navigationOptions = [
        {
            key: 'workspaces',
            title: translate('common.workspaces'),
            icon: icons.Building,
            route: ROUTES.WORKSPACES_LIST.getRoute(),
            screenName: SCREENS.WORKSPACES_LIST,
        },
        {
            key: 'domains',
            title: translate('common.domains'),
            icon: icons.Globe,
            route: ROUTES.DOMAINS_LIST.getRoute(),
            screenName: SCREENS.DOMAINS_LIST,
        },
    ];

    const onTabPress = (key: string) => {
        const matchingNavigationOption = navigationOptions.find((option) => option.key === key);

        if (!matchingNavigationOption) {
            return;
        }

        Navigation.navigate(matchingNavigationOption.route);
    };

    return (
        <View style={[styles.flexRow, styles.justifyContentBetween, styles.pr5, styles.pt1, styles.pb2]}>
            <TabSelectorBase
                tabs={navigationOptions}
                activeTabKey={activeTabKey}
                onTabPress={onTabPress}
            />
            {shouldShowHeaderButton && headerButton}
        </View>
    );
}

function WorkspaceListLayout({children, activeTabKey, headerButton, headerComponent, scrollHeaderWithTable = false}: WorkspaceListLayoutProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();

    const isWorkspacesListPage = activeTabKey === 'workspaces';
    const testID = isWorkspacesListPage ? 'WorkspacesListPage' : 'DomainsListPage';
    const activeTabLabel = isWorkspacesListPage ? translate('common.workspaces') : translate('common.domains');
    const headerContent = headerComponent ?? (
        <WorkspaceListHeaderContent
            activeTabKey={activeTabKey}
            headerButton={headerButton}
            shouldShowHeaderButton={shouldDisplayButtonsInSeparateLine}
        />
    );

    const content = (
        <>
            {!scrollHeaderWithTable && headerContent}
            {children}
        </>
    );

    return (
        <ScreenWrapper
            testID={testID}
            shouldEnableMaxHeight
            shouldEnablePickerAvoiding={false}
            enableEdgeToEdgeBottomSafeAreaPadding={false}
            bottomContentStyle={styles.overflowVisible}
            bottomContent={<TabBarBottomContent selectedTab={NAVIGATION_TABS.WORKSPACES} />}
        >
            <View style={[styles.flex1, styles.flexRow]}>
                <View style={[styles.flex1]}>
                    <TopBarWithLoadingBar
                        shouldDisplayHelpButton
                        breadcrumbLabel={activeTabLabel}
                    >
                        {!scrollHeaderWithTable && <View style={[styles.pr3]}>{!shouldDisplayButtonsInSeparateLine && headerButton}</View>}
                    </TopBarWithLoadingBar>

                    {content}
                    {!shouldUseNarrowLayout && <OfflineIndicator style={styles.pl5} />}
                </View>
            </View>
        </ScreenWrapper>
    );
}

export {WorkspaceListHeaderContent};
export default WorkspaceListLayout;
