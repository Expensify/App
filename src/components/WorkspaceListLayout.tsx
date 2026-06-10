import type {PropsWithChildren} from 'react';
import React from 'react';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import NAVIGATION_TABS from './Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from './Navigation/TabBarBottomContent';
import TopBarWithLoadingBar from './Navigation/TopBarWithLoadingBar';
import OfflineIndicator from './OfflineIndicator';
import ScreenWrapper from './ScreenWrapper';
import TabSelectorBase from './TabSelector/TabSelectorBase';

type WorkspaceListLayoutProps = PropsWithChildren<{
    headerButton?: React.ReactNode;
    activeTabKey: 'workspaces' | 'domains';
    searchInput?: React.ReactNode;
}>;

export default function WorkspaceListLayout({children, activeTabKey, headerButton, searchInput}: WorkspaceListLayoutProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Globe', 'Building']);
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();

    const isWorkspacesListPage = activeTabKey === 'workspaces';
    const testID = isWorkspacesListPage ? 'WorkspacesListPage' : 'DomainsListPage';
    const activeTabLabel = isWorkspacesListPage ? translate('common.workspaces') : translate('common.domains');

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
                        shouldRemoveHorizontalMargin
                    >
                        {!shouldDisplayButtonsInSeparateLine && headerButton}
                    </TopBarWithLoadingBar>

                    <View style={[styles.flex1, {width: '100%', maxWidth: variables.contentMaxWidth, alignSelf: 'center'}]}>
                        <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.pr5, styles.pt1, styles.pb2]}>
                            <TabSelectorBase
                                tabs={navigationOptions}
                                activeTabKey={activeTabKey}
                                onTabPress={onTabPress}
                            />
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                                {searchInput}
                                {shouldDisplayButtonsInSeparateLine && headerButton}
                            </View>
                        </View>

                        {children}
                        {!shouldUseNarrowLayout && <OfflineIndicator style={styles.pl5} />}
                    </View>
                </View>
            </View>
        </ScreenWrapper>
    );
}
