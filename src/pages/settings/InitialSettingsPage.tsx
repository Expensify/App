import AccountSwitcher from '@components/AccountSwitcher';
import AccountSwitcherSkeletonView from '@components/AccountSwitcherSkeletonView';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import TopBarWithLoadingBar from '@components/Navigation/TopBarWithLoadingBar';
import ScreenWrapper from '@components/ScreenWrapper';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';

import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useScrollEventEmitter from '@hooks/useScrollEventEmitter';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';

import useIsSidebarRouteActive from '@libs/Navigation/helpers/useIsSidebarRouteActive';
import Navigation from '@libs/Navigation/Navigation';

import {openInitialSettingsPage} from '@userActions/Wallet';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView, ScrollViewProps, StyleProp, ViewStyle} from 'react-native';

import {findFocusedRoute, useNavigationState, useRoute} from '@react-navigation/native';
import React, {useContext, useEffect, useLayoutEffect, useRef} from 'react';
import {View} from 'react-native';

import type {MenuSection} from './useInitialSettingsPageMenuData';

import SettingsMenuItem from './SettingsMenuItem';
import useInitialSettingsPageMenuData from './useInitialSettingsPageMenuData';

type InitialSettingsPageProps = WithCurrentUserPersonalDetailsProps;

function InitialSettingsPage({currentUserPersonalDetails}: InitialSettingsPageProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const tabBarContent = <TabBarBottomContent selectedTab={NAVIGATION_TABS.SETTINGS} />;
    const styles = useThemeStyles();
    const {isExecuting, singleExecution} = useSingleExecution();
    const {translate} = useLocalize();
    const focusedRouteName = useNavigationState((state) => findFocusedRoute(state)?.name);
    const isScreenFocused = useIsSidebarRouteActive(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, shouldUseNarrowLayout);
    const previousUserPersonalDetails = usePrevious(currentUserPersonalDetails);
    const {accountMenuItemsData, generalMenuItemsData} = useInitialSettingsPageMenuData(currentUserPersonalDetails);

    const hasAccountBeenSwitched = currentUserPersonalDetails.accountID !== previousUserPersonalDetails.accountID;

    useEffect(() => {
        if (!hasAccountBeenSwitched) {
            return;
        }

        Navigation.clearPreloadedRoutes();
    }, [hasAccountBeenSwitched]);

    useEffect(() => {
        openInitialSettingsPage();
    }, []);

    const getMenuItemsSection = (menuItemsData: MenuSection, sectionStyle: StyleProp<ViewStyle>) => {
        return (
            <View style={[sectionStyle, styles.pb4, styles.mh3]}>
                <Text
                    style={styles.sectionTitle}
                    accessibilityRole={CONST.ROLE.HEADER}
                >
                    {translate(menuItemsData.sectionTranslationKey)}
                </Text>
                {menuItemsData.items.map((item) => {
                    const keyTitle = item.translationKey ? translate(item.translationKey) : item.title;
                    const isFocused = focusedRouteName ? focusedRouteName === item.screenName : false;

                    return (
                        <SettingsMenuItem
                            key={keyTitle}
                            item={item}
                            keyTitle={keyTitle}
                            isFocused={isFocused}
                            isExecuting={isExecuting}
                            isScreenFocused={isScreenFocused}
                            onPress={singleExecution(item.action)}
                            wrapperStyle={styles.sectionMenuItem(shouldUseNarrowLayout)}
                        />
                    );
                })}
            </View>
        );
    };

    const accountMenuItems = getMenuItemsSection(accountMenuItemsData, styles.accountSettingsSectionContainer);
    const generalMenuItems = getMenuItemsSection(generalMenuItemsData, styles.pt4);

    const isPersonalDetailsEmpty = isEmptyObject(currentUserPersonalDetails) || currentUserPersonalDetails.displayName === undefined;

    const headerContent = (
        <View style={[styles.ph5, styles.pv4]}>
            {isPersonalDetailsEmpty ? (
                <AccountSwitcherSkeletonView avatarSize={CONST.AVATAR_SIZE.DEFAULT} />
            ) : (
                <View style={[styles.flexRow, styles.alignItemsCenter]}>
                    <AccountSwitcher isScreenFocused={isScreenFocused} />
                </View>
            )}
        </View>
    );

    const {saveScrollOffset, getScrollOffset} = useContext(ScrollOffsetContext);
    const route = useRoute();
    const scrollViewRef = useRef<RNScrollView>(null);
    const triggerScrollEvent = useScrollEventEmitter();

    const onScroll: NonNullable<ScrollViewProps['onScroll']> = (e) => {
        // If the layout measurement is 0, it means the flash list is not displayed but the onScroll may be triggered with offset value 0.
        // We should ignore this case.
        if (e.nativeEvent.layoutMeasurement.height === 0) {
            return;
        }
        saveScrollOffset(route, e.nativeEvent.contentOffset.y);
        triggerScrollEvent();
    };

    useLayoutEffect(() => {
        const scrollOffset = getScrollOffset(route);
        if (!scrollOffset || !scrollViewRef.current) {
            return;
        }
        scrollViewRef.current.scrollTo({y: scrollOffset, animated: false});
    }, [getScrollOffset, route]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID="InitialSettingsPage"
            shouldEnableKeyboardAvoidingView={false}
            bottomContent={tabBarContent}
            bottomContentStyle={styles.overflowVisible}
        >
            <TopBarWithLoadingBar
                breadcrumbLabel={translate('initialSettingsPage.account')}
                shouldDisplaySearch={shouldUseNarrowLayout}
                shouldDisplayHelpButton={shouldUseNarrowLayout}
            />
            <ScrollView
                ref={scrollViewRef}
                onScroll={onScroll}
                scrollEventThrottle={CONST.TIMING.MIN_SMOOTH_SCROLL_EVENT_THROTTLE}
                contentContainerStyle={[styles.w100]}
                showsVerticalScrollIndicator={false}
            >
                {headerContent}
                {accountMenuItems}
                {generalMenuItems}
            </ScrollView>
        </ScreenWrapper>
    );
}

export default withCurrentUserPersonalDetails(InitialSettingsPage);
