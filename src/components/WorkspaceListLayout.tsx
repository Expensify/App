import {findFocusedRoute, useNavigationState} from '@react-navigation/core';
import React, {PropsWithChildren} from 'react';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import HighlightableMenuItem from './HighlightableMenuItem';
import NAVIGATION_TABS from './Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from './Navigation/TabBarBottomContent';
import TopBarWithLoadingBar from './Navigation/TopBarWithLoadingBar';
import ScreenWrapper from './ScreenWrapper';
import ScrollView from './ScrollView';

type WorkspaceListLayoutProps = PropsWithChildren<{
    headerButton?: React.ReactNode;
}>;

export default function WorkspaceListLayout({children, headerButton}: WorkspaceListLayoutProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Globe', 'Building']);
    const activeRoute = useNavigationState((state) => findFocusedRoute(state)?.name);
    const isWorkspacesListPage = activeRoute === SCREENS.WORKSPACES_LIST;

    const activeNarrowLayoutTabKey = isWorkspacesListPage ? 'workspaces' : 'domains';
    const activeTabLabel = isWorkspacesListPage ? translate('common.workspaces') : translate('common.domains');

    const navigationOptions = [
        {
            title: translate('common.workspaces'),
            icon: icons.Building,
            route: ROUTES.WORKSPACES_LIST.getRoute(),
            screenName: SCREENS.WORKSPACES_LIST,
        },
        {
            title: translate('common.domains'),
            icon: icons.Globe,
            route: ROUTES.DOMAINS_LIST.getRoute(),
            screenName: SCREENS.DOMAINS_LIST,
        },
    ];

    return (
        <ScreenWrapper
            testID="WorkspacesPage"
            shouldEnableMaxHeight
            shouldShowOfflineIndicatorInWideScreen
            shouldEnablePickerAvoiding={false}
            enableEdgeToEdgeBottomSafeAreaPadding={false}
            bottomContentStyle={styles.overflowVisible}
            bottomContent={<TabBarBottomContent selectedTab={NAVIGATION_TABS.WORKSPACES} />}
        >
            <View style={[styles.flex1, styles.flexRow]}>
                {!shouldUseNarrowLayout && (
                    <View style={styles.sidebarContainer}>
                        <TopBarWithLoadingBar
                            shouldDisplaySearch={false}
                            shouldDisplayHelpButton={false}
                            breadcrumbLabel={activeTabLabel}
                        />
                        <ScrollView contentContainerStyle={styles.flexColumn}>
                            <View style={[styles.pb4, styles.mh3, styles.mt3]}>
                                {navigationOptions.map((navigationOption) => (
                                    <HighlightableMenuItem
                                        shouldIconUseAutoWidthStyle
                                        key={navigationOption.screenName}
                                        icon={navigationOption.icon}
                                        title={navigationOption.title}
                                        wrapperStyle={styles.sectionMenuItem(false)}
                                        focused={activeRoute === navigationOption.screenName}
                                        onPress={() => Navigation.navigate(navigationOption.route)}
                                    />
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                )}

                <View style={styles.flex1}>
                    <TopBarWithLoadingBar
                        shouldDisplayHelpButton
                        breadcrumbLabel={activeTabLabel}
                    >
                        {headerButton}
                    </TopBarWithLoadingBar>
                    {children}
                </View>
            </View>
        </ScreenWrapper>
    );
}
