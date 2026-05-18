import {findFocusedRoute, useNavigationState} from '@react-navigation/core';
import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import HighlightableMenuItem from '@components/HighlightableMenuItem';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

type WorkspacesInitialPageProps = {};

export default function WorkspacesInitialPage({}: WorkspacesInitialPageProps) {
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Building', 'Globe']);
    const activeRoute = useNavigationState((state) => findFocusedRoute(state)?.name);

    const navigationItems = [
        {
            title: 'Workspaces',
            icon: icons.Building,
            route: ROUTES.WORKSPACES_LIST.getRoute(),
            screenName: SCREENS.WORKSPACES_LIST,
        },
        {
            title: 'Domains',
            icon: icons.Globe,
            route: ROUTES.WORKSPACES_DOMAINS.getRoute(),
            screenName: SCREENS.WORKSPACES_DOMAINS,
        },
    ];

    return (
        <ScreenWrapper
            testID="WorkspacesInitialPage"
            enableEdgeToEdgeBottomSafeAreaPadding={false}
            bottomContent={<TabBarBottomContent selectedTab={NAVIGATION_TABS.WORKSPACES} />}
            bottomContentStyle={styles.overflowVisible}
        >
            <HeaderWithBackButton title="Workspaces" />

            <ScrollView contentContainerStyle={styles.flexColumn}>
                <View style={[styles.pb4, styles.mh3, styles.mt3]}>
                    {navigationItems.map((item) => (
                        <HighlightableMenuItem
                            shouldIconUseAutoWidthStyle
                            key={item.screenName}
                            icon={item.icon}
                            title={item.title}
                            focused={activeRoute === item.screenName}
                            wrapperStyle={styles.sectionMenuItem(false)}
                            onPress={() => Navigation.navigate(item.route)}
                        />
                    ))}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
