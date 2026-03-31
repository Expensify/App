import {StackActions} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import FloatingCameraButton from '@components/FloatingCameraButton';
import FloatingGPSButton from '@components/FloatingGPSButton';
import ImageSVG from '@components/ImageSVG';
import DebugTabView from '@components/Navigation/DebugTabView';
import {PressableWithFeedback} from '@components/Pressable';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useThemeStyles from '@hooks/useThemeStyles';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import getAccountTabScreenToOpen from '@libs/Navigation/helpers/getAccountTabScreenToOpen';
import isRoutePreloaded from '@libs/Navigation/helpers/isRoutePreloaded';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@navigation/navigationRef';
import NavigationTabBarAvatar from '@pages/inbox/sidebar/NavigationTabBarAvatar';
import NavigationTabBarFloatingActionButton from '@pages/inbox/sidebar/NavigationTabBarFloatingActionButton';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import NAVIGATION_TABS from './NAVIGATION_TABS';
import SearchTabButton from './SearchTabButton';
import TabBarItem from './TabBarItem';
import WorkspacesTabButton from './WorkspacesTabButton';

type NavigationTabBarProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
    isTopLevelBar?: boolean;
    shouldShowFloatingButtons?: boolean;
};

function NavigationTabBar({selectedTab, isTopLevelBar = false, shouldShowFloatingButtons = true}: NavigationTabBarProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);
    const subscriptionPlan = useSubscriptionPlan();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ExpensifyAppIcon', 'Home']);

    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const StyleUtils = useStyleUtils();

    const shouldRenderDebugTabViewOnWideLayout = !!isDebugModeEnabled && !isTopLevelBar;

    const navigateToNewDotHome = () => {
        if (selectedTab === NAVIGATION_TABS.HOME) {
            return;
        }
        Navigation.navigate(ROUTES.HOME);
    };

    const navigateToSettings = () => {
        if (selectedTab === NAVIGATION_TABS.SETTINGS) {
            return;
        }
        interceptAnonymousUser(() => {
            const accountTabPayload = getAccountTabScreenToOpen(subscriptionPlan);

            if (isRoutePreloaded(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR)) {
                navigationRef.dispatch({type: CONST.NAVIGATION.ACTION_TYPE.PUSH, payload: {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, params: accountTabPayload}});
                return;
            }
            navigationRef.dispatch(StackActions.push(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, accountTabPayload));
        });
    };

    if (!shouldUseNarrowLayout) {
        return (
            <>
                {shouldRenderDebugTabViewOnWideLayout && (
                    <DebugTabView
                        selectedTab={selectedTab}
                        chatTabBrickRoad={undefined}
                    />
                )}
                <View
                    style={styles.leftNavigationTabBarContainer}
                    testID="NavigationTabBar"
                >
                    <View style={styles.flex1}>
                        <PressableWithFeedback
                            role={CONST.ROLE.LINK}
                            accessibilityLabel={translate('common.home')}
                            accessible
                            testID="ExpensifyLogoButton"
                            onPress={navigateToNewDotHome}
                            wrapperStyle={styles.leftNavigationTabBarItem}
                            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.EXPENSIFY_LOGO}
                        >
                            <ImageSVG
                                style={StyleUtils.getAvatarStyle(CONST.AVATAR_SIZE.DEFAULT)}
                                src={expensifyIcons.ExpensifyAppIcon}
                                aria-hidden
                            />
                        </PressableWithFeedback>
                        <PressableWithFeedback
                            onPress={navigateToNewDotHome}
                            role={CONST.ROLE.TAB}
                            accessibilityLabel={translate('common.home')}
                            style={({hovered}) => [styles.leftNavigationTabBarItem, hovered && styles.navigationTabBarItemHovered]}
                            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.HOME}
                        >
                            {({hovered}) => (
                                <TabBarItem
                                    icon={expensifyIcons.Home}
                                    label={translate('common.home')}
                                    isSelected={selectedTab === NAVIGATION_TABS.HOME}
                                    isHovered={hovered}
                                />
                            )}
                        </PressableWithFeedback>
                        <SearchTabButton
                            selectedTab={selectedTab}
                            isWideLayout
                        />
                        <WorkspacesTabButton
                            selectedTab={selectedTab}
                            isWideLayout
                        />
                        <NavigationTabBarAvatar
                            style={styles.leftNavigationTabBarItem}
                            isSelected={selectedTab === NAVIGATION_TABS.SETTINGS}
                            onPress={navigateToSettings}
                        />
                    </View>
                    <View style={styles.leftNavigationTabBarFAB}>
                        <NavigationTabBarFloatingActionButton />
                    </View>
                </View>
            </>
        );
    }

    return (
        <>
            {!!isDebugModeEnabled && (
                <DebugTabView
                    selectedTab={selectedTab}
                    chatTabBrickRoad={undefined}
                />
            )}
            <View
                style={styles.navigationTabBarContainer}
                testID="NavigationTabBar"
            >
                <PressableWithFeedback
                    onPress={navigateToNewDotHome}
                    role={CONST.ROLE.TAB}
                    accessibilityLabel={translate('common.home')}
                    wrapperStyle={styles.flex1}
                    style={styles.navigationTabBarItem}
                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.HOME}
                >
                    <TabBarItem
                        icon={expensifyIcons.Home}
                        label={translate('common.home')}
                        isSelected={selectedTab === NAVIGATION_TABS.HOME}
                    />
                </PressableWithFeedback>
                <SearchTabButton
                    selectedTab={selectedTab}
                    isWideLayout={false}
                />
                <WorkspacesTabButton
                    selectedTab={selectedTab}
                    isWideLayout={false}
                />
                <NavigationTabBarAvatar
                    style={styles.navigationTabBarItem}
                    isSelected={selectedTab === NAVIGATION_TABS.SETTINGS}
                    onPress={navigateToSettings}
                />
            </View>

            {shouldShowFloatingButtons && (
                <>
                    <View style={[styles.navigationTabBarFABItem, styles.ph0, styles.floatingActionButtonPosition]}>
                        <NavigationTabBarFloatingActionButton />
                    </View>
                    <FloatingGPSButton />
                    <FloatingCameraButton />
                </>
            )}
        </>
    );
}

export default NavigationTabBar;
