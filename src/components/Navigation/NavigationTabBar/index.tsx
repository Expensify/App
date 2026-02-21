import {StackActions} from '@react-navigation/native';
import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import FloatingCameraButton from '@components/FloatingCameraButton';
import FloatingGPSButton from '@components/FloatingGPSButton';
import Icon from '@components/Icon';
import ImageSVG from '@components/ImageSVG';
import DebugTabView from '@components/Navigation/DebugTabView';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useRootNavigationState from '@hooks/useRootNavigationState';
import {useSidebarOrderedReports} from '@hooks/useSidebarOrderedReports';
import useStyleUtils from '@hooks/useStyleUtils';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import getAccountTabScreenToOpen from '@libs/Navigation/helpers/getAccountTabScreenToOpen';
import isRoutePreloaded from '@libs/Navigation/helpers/isRoutePreloaded';
import Navigation from '@libs/Navigation/Navigation';
import {startSpan} from '@libs/telemetry/activeSpans';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';
import {getChatTabBrickRoad} from '@libs/WorkspacesSettingsUtils';
import navigationRef from '@navigation/navigationRef';
import type {ReportsSplitNavigatorParamList} from '@navigation/types';
import NavigationTabBarAvatar from '@pages/inbox/sidebar/NavigationTabBarAvatar';
import NavigationTabBarFloatingActionButton from '@pages/inbox/sidebar/NavigationTabBarFloatingActionButton';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';
import getLastRoute from './getLastRoute';
import getTabIconFill from './getTabIconFill';
import NAVIGATION_TABS from './NAVIGATION_TABS';
import SearchTabButton from './SearchTabButton';
import WorkspacesTabButton from './WorkspacesTabButton';

type NavigationTabBarProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
    isTopLevelBar?: boolean;
    shouldShowFloatingButtons?: boolean;
};

function doesLastReportExistSelector(report: OnyxEntry<Report>) {
    return !!report?.reportID;
}

function NavigationTabBar({selectedTab, isTopLevelBar = false, shouldShowFloatingButtons = true}: NavigationTabBarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {orderedReportIDs} = useSidebarOrderedReports();
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED, {canBeMissing: true});
    const subscriptionPlan = useSubscriptionPlan();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ExpensifyAppIcon', 'Home', 'Inbox']);

    const lastReportRoute = useRootNavigationState((rootState) => {
        if (!rootState) {
            return undefined;
        }
        return getLastRoute(rootState, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT);
    });
    const lastReportRouteReportID = (lastReportRoute?.params as ReportsSplitNavigatorParamList[typeof SCREENS.REPORT])?.reportID;
    const [doesLastReportExist] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${lastReportRouteReportID}`, {canBeMissing: true, selector: doesLastReportExistSelector}, [lastReportRouteReportID]);

    const reportAttributes = useReportAttributes();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [chatTabBrickRoad, setChatTabBrickRoad] = useState<BrickRoad>(undefined);

    const StyleUtils = useStyleUtils();

    // On a wide layout DebugTabView should be rendered only within the navigation tab bar displayed directly on screens.
    const shouldRenderDebugTabViewOnWideLayout = !!isDebugModeEnabled && !isTopLevelBar;

    useEffect(() => {
        setChatTabBrickRoad(getChatTabBrickRoad(orderedReportIDs, reportAttributes));
    }, [orderedReportIDs, reportAttributes]);

    const navigateToNewDotHome = useCallback(() => {
        if (selectedTab === NAVIGATION_TABS.HOME) {
            return;
        }
        Navigation.navigate(ROUTES.HOME);
    }, [selectedTab]);

    const navigateToChats = useCallback(() => {
        if (selectedTab === NAVIGATION_TABS.INBOX) {
            return;
        }

        startSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB, {
            name: CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB,
            op: CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB,
        });

        if (!shouldUseNarrowLayout) {
            if (doesLastReportExist && lastReportRoute) {
                const {reportID, reportActionID, referrer, backTo} = lastReportRoute.params as ReportsSplitNavigatorParamList[typeof SCREENS.REPORT];
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID, reportActionID, referrer, backTo));
                return;
            }

            if (isRoutePreloaded(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR)) {
                // We use dispatch here because the correct screens and params are preloaded and set up in usePreloadFullScreenNavigators.
                navigationRef.dispatch(StackActions.push(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR));
                return;
            }
        }

        Navigation.navigate(ROUTES.INBOX);
    }, [selectedTab, shouldUseNarrowLayout, doesLastReportExist, lastReportRoute]);

    const navigateToSettings = useCallback(() => {
        if (selectedTab === NAVIGATION_TABS.SETTINGS) {
            return;
        }
        interceptAnonymousUser(() => {
            const accountTabPayload = getAccountTabScreenToOpen(subscriptionPlan);

            if (isRoutePreloaded(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR)) {
                // We use dispatch here because the correct screens and params are preloaded and set up in usePreloadFullScreenNavigators.
                navigationRef.dispatch({type: CONST.NAVIGATION.ACTION_TYPE.PUSH, payload: {name: NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, params: accountTabPayload}});
                return;
            }
            navigationRef.dispatch(StackActions.push(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR, accountTabPayload));
        });
    }, [selectedTab, subscriptionPlan]);

    const inboxAccessibilityState = useMemo(() => ({selected: selectedTab === NAVIGATION_TABS.INBOX}), [selectedTab]);

    if (!shouldUseNarrowLayout) {
        return (
            <>
                {shouldRenderDebugTabViewOnWideLayout && (
                    <DebugTabView
                        selectedTab={selectedTab}
                        chatTabBrickRoad={chatTabBrickRoad}
                    />
                )}
                <View
                    style={styles.leftNavigationTabBarContainer}
                    testID="NavigationTabBar"
                >
                    <View style={styles.flex1}>
                        <PressableWithFeedback
                            accessibilityRole={CONST.ROLE.BUTTON}
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
                                <>
                                    <View>
                                        <Icon
                                            src={expensifyIcons.Home}
                                            fill={getTabIconFill(theme, {isSelected: selectedTab === NAVIGATION_TABS.HOME, isHovered: hovered})}
                                            width={variables.iconBottomBar}
                                            height={variables.iconBottomBar}
                                        />
                                    </View>
                                    <Text
                                        numberOfLines={2}
                                        style={[
                                            styles.textSmall,
                                            styles.textAlignCenter,
                                            styles.mt1Half,
                                            selectedTab === NAVIGATION_TABS.HOME ? styles.textBold : styles.textSupporting,
                                            styles.navigationTabBarLabel,
                                        ]}
                                    >
                                        {translate('common.home')}
                                    </Text>
                                </>
                            )}
                        </PressableWithFeedback>
                        <PressableWithFeedback
                            onPress={navigateToChats}
                            role={CONST.ROLE.TAB}
                            accessibilityLabel={chatTabBrickRoad ? `${translate('common.inbox')}. ${translate('common.yourReviewIsRequired')}` : translate('common.inbox')}
                            accessibilityState={inboxAccessibilityState}
                            style={({hovered}) => [styles.leftNavigationTabBarItem, hovered && styles.navigationTabBarItemHovered]}
                            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.INBOX}
                        >
                            {({hovered}) => (
                                <>
                                    <View>
                                        <Icon
                                            src={expensifyIcons.Inbox}
                                            fill={getTabIconFill(theme, {isSelected: selectedTab === NAVIGATION_TABS.INBOX, isHovered: hovered})}
                                            width={variables.iconBottomBar}
                                            height={variables.iconBottomBar}
                                        />
                                        {!!chatTabBrickRoad && (
                                            <View
                                                style={[
                                                    styles.navigationTabBarStatusIndicator,
                                                    styles.statusIndicatorColor(chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO ? theme.iconSuccessFill : theme.danger),
                                                    hovered && {borderColor: theme.sidebarHover},
                                                ]}
                                            />
                                        )}
                                    </View>
                                    <Text
                                        numberOfLines={2}
                                        style={[
                                            styles.textSmall,
                                            styles.textAlignCenter,
                                            styles.mt1Half,
                                            selectedTab === NAVIGATION_TABS.INBOX ? styles.textBold : styles.textSupporting,
                                            styles.navigationTabBarLabel,
                                        ]}
                                    >
                                        {translate('common.inbox')}
                                    </Text>
                                </>
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
                    chatTabBrickRoad={chatTabBrickRoad}
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
                    <View>
                        <Icon
                            src={expensifyIcons.Home}
                            fill={selectedTab === NAVIGATION_TABS.HOME ? theme.iconMenu : theme.icon}
                            width={variables.iconBottomBar}
                            height={variables.iconBottomBar}
                        />
                    </View>
                    <Text
                        numberOfLines={2}
                        style={[
                            styles.textSmall,
                            styles.textAlignCenter,
                            styles.mt1Half,
                            selectedTab === NAVIGATION_TABS.HOME ? styles.textBold : styles.textSupporting,
                            styles.navigationTabBarLabel,
                        ]}
                    >
                        {translate('common.home')}
                    </Text>
                </PressableWithFeedback>
                <PressableWithFeedback
                    onPress={navigateToChats}
                    role={CONST.ROLE.TAB}
                    accessibilityLabel={chatTabBrickRoad ? `${translate('common.inbox')}. ${translate('common.yourReviewIsRequired')}` : translate('common.inbox')}
                    accessibilityState={inboxAccessibilityState}
                    wrapperStyle={styles.flex1}
                    style={styles.navigationTabBarItem}
                    sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.INBOX}
                >
                    <View>
                        <Icon
                            src={expensifyIcons.Inbox}
                            fill={selectedTab === NAVIGATION_TABS.INBOX ? theme.iconMenu : theme.icon}
                            width={variables.iconBottomBar}
                            height={variables.iconBottomBar}
                        />
                        {!!chatTabBrickRoad && (
                            <View
                                style={[
                                    styles.navigationTabBarStatusIndicator,
                                    styles.statusIndicatorColor(chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO ? theme.iconSuccessFill : theme.danger),
                                ]}
                            />
                        )}
                    </View>
                    <Text
                        numberOfLines={1}
                        style={[
                            styles.textSmall,
                            styles.textAlignCenter,
                            styles.mt1Half,
                            selectedTab === NAVIGATION_TABS.INBOX ? styles.textBold : styles.textSupporting,
                            styles.navigationTabBarLabel,
                        ]}
                    >
                        {translate('common.inbox')}
                    </Text>
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

export default memo(NavigationTabBar);
