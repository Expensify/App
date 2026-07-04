import AccountSwitcher from '@components/AccountSwitcher';
import AccountSwitcherSkeletonView from '@components/AccountSwitcherSkeletonView';
import Icon from '@components/Icon';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import TopBarWithLoadingBar from '@components/Navigation/TopBarWithLoadingBar';
import {PressableWithFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSingleExecution from '@hooks/useSingleExecution';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import useIsSidebarRouteActive from '@libs/Navigation/helpers/useIsSidebarRouteActive';
import Navigation from '@libs/Navigation/Navigation';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import variables from '@styles/variables';

import {openInitialSettingsPage} from '@userActions/Wallet';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView, ScrollViewProps} from 'react-native';

import {findFocusedRoute, useNavigationState, useRoute} from '@react-navigation/native';
import React, {useContext, useEffect, useLayoutEffect, useRef} from 'react';
import {View} from 'react-native';

import type {Menu, MenuData} from './useInitialSettingsPageMenuData';

import SettingsMenuItem from './SettingsMenuItem';
import useInitialSettingsPageMenuData from './useInitialSettingsPageMenuData';

type InitialSettingsPageProps = WithCurrentUserPersonalDetailsProps;

export type {MenuData};

function InitialSettingsPage({currentUserPersonalDetails}: InitialSettingsPageProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Emoji']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const tabBarContent = <TabBarBottomContent selectedTab={NAVIGATION_TABS.SETTINGS} />;
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isExecuting, singleExecution} = useSingleExecution();
    const {translate} = useLocalize();
    const focusedRouteName = useNavigationState((state) => findFocusedRoute(state)?.name);
    const emojiCode = currentUserPersonalDetails?.status?.emojiCode ?? '';
    const isScreenFocused = useIsSidebarRouteActive(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, shouldUseNarrowLayout);
    const {accountMenuItemsData: accountMenuItemsDataFromHook, generalMenuItemsData: generalMenuItemsDataFromHook} = useInitialSettingsPageMenuData(currentUserPersonalDetails);
    const accountMenuItemsData: Menu = {
        ...accountMenuItemsDataFromHook,
        sectionStyle: styles.accountSettingsSectionContainer,
    };
    const generalMenuItemsData: Menu = {
        ...generalMenuItemsDataFromHook,
        sectionStyle: styles.pt4,
    };

    useEffect(() => {
        openInitialSettingsPage();
    }, []);

    /**
     * Return JSX.Element with menu items
     * @param menuItemsData list with menu items data
     * @returns the menu items for passed data
     */
    const getMenuItemsSection = (menuItemsData: Menu) => {
        return (
            <View style={[menuItemsData.sectionStyle, styles.pb4, styles.mh3]}>
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

    const accountMenuItems = getMenuItemsSection(accountMenuItemsData);
    const generalMenuItems = getMenuItemsSection(generalMenuItemsData);

    const isPersonalDetailsEmpty = isEmptyObject(currentUserPersonalDetails) || currentUserPersonalDetails.displayName === undefined;
    const skeletonReasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'InitialSettingsPage',
        isPersonalDetailsEmpty,
    };

    const headerContent = (
        <View style={[styles.ph5, styles.pv4]}>
            {isPersonalDetailsEmpty ? (
                <AccountSwitcherSkeletonView
                    avatarSize={CONST.AVATAR_SIZE.DEFAULT}
                    reasonAttributes={skeletonReasonAttributes}
                />
            ) : (
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.gap3]}>
                    <AccountSwitcher isScreenFocused={isScreenFocused} />
                    <Tooltip text={translate('statusPage.status')}>
                        <PressableWithFeedback
                            accessibilityLabel={
                                emojiCode ? `${translate('statusPage.status')}: ${emojiCode}` : `${translate('statusPage.status')}, ${translate('emojiPicker.emojiNotSelected')}`
                            }
                            accessibilityRole="button"
                            accessible
                            sentryLabel={CONST.SENTRY_LABEL.ACCOUNT.STATUS_PICKER}
                            onPress={() => Navigation.navigate(ROUTES.SETTINGS_STATUS)}
                        >
                            <View style={styles.primaryMediumIcon}>
                                {emojiCode ? (
                                    <Text style={styles.primaryMediumText}>{emojiCode}</Text>
                                ) : (
                                    <Icon
                                        src={icons.Emoji}
                                        width={variables.iconSizeNormal}
                                        height={variables.iconSizeNormal}
                                        fill={theme.icon}
                                    />
                                )}
                            </View>
                        </PressableWithFeedback>
                    </Tooltip>
                </View>
            )}
        </View>
    );

    const {saveScrollOffset, getScrollOffset} = useContext(ScrollOffsetContext);
    const route = useRoute();
    const scrollViewRef = useRef<RNScrollView>(null);

    const onScroll: NonNullable<ScrollViewProps['onScroll']> = (e) => {
        // If the layout measurement is 0, it means the flash list is not displayed but the onScroll may be triggered with offset value 0.
        // We should ignore this case.
        if (e.nativeEvent.layoutMeasurement.height === 0) {
            return;
        }
        saveScrollOffset(route, e.nativeEvent.contentOffset.y);
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
