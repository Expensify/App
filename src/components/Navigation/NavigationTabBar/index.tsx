import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
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
import useRootNavigationState from '@hooks/useRootNavigationState';
import {useSidebarOrderedReportsState} from '@hooks/useSidebarOrderedReports';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {isDeletedAction} from '@libs/ReportActionsUtils';
import {startSpan} from '@libs/telemetry/activeSpans';
import type {ReportsSplitNavigatorParamList} from '@navigation/types';
import NavigationTabBarAvatar from '@pages/inbox/sidebar/NavigationTabBarAvatar';
import NavigationTabBarFloatingActionButton from '@pages/inbox/sidebar/NavigationTabBarFloatingActionButton';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Report, ReportActions} from '@src/types/onyx';
import getLastRoute from './getLastRoute';
import NAVIGATION_TABS from './NAVIGATION_TABS';
import SearchTabButton from './SearchTabButton';
import TabBarItem from './TabBarItem';
import WorkspacesTabButton from './WorkspacesTabButton';

type NavigationTabBarProps = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
    shouldShowFloatingButtons?: boolean;
};

function doesLastReportExistSelector(report: OnyxEntry<Report>) {
    return !!report?.reportID;
}

function NavigationTabBar({selectedTab, shouldShowFloatingButtons = true}: NavigationTabBarProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {chatTabBrickRoad} = useSidebarOrderedReportsState();
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ExpensifyAppIcon', 'Home', 'Inbox']);

    const lastReportRouteReportID = useRootNavigationState((rootState) => {
        if (!rootState) {
            return undefined;
        }
        const route = getLastRoute(rootState, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT);
        return (route?.params as ReportsSplitNavigatorParamList[typeof SCREENS.REPORT])?.reportID;
    });

    const lastReportRouteReportActionID = useRootNavigationState((rootState) => {
        if (!rootState) {
            return undefined;
        }
        const route = getLastRoute(rootState, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT);
        return (route?.params as ReportsSplitNavigatorParamList[typeof SCREENS.REPORT])?.reportActionID;
    });

    const [doesLastReportExist] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${lastReportRouteReportID}`, {selector: doesLastReportExistSelector}, [lastReportRouteReportID]);

    const doesLastReportActionExistSelector = (reportActions: OnyxEntry<ReportActions>) => {
        const reportAction = lastReportRouteReportActionID ? reportActions?.[lastReportRouteReportActionID] : undefined;
        return !!reportAction && !isDeletedAction(reportAction);
    };
    const [doesLastReportActionExist] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${lastReportRouteReportID}`, {selector: doesLastReportActionExistSelector});

    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const StyleUtils = useStyleUtils();

    const shouldRenderDebugTabViewOnWideLayout = !!isDebugModeEnabled;

    let inboxStatusIndicatorColor: string | undefined;
    if (chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO) {
        inboxStatusIndicatorColor = theme.iconSuccessFill;
    } else if (chatTabBrickRoad) {
        inboxStatusIndicatorColor = theme.danger;
    }

    const inboxAccessibilityState = {selected: selectedTab === NAVIGATION_TABS.INBOX};

    const navigateToNewDotHome = () => {
        if (selectedTab === NAVIGATION_TABS.HOME) {
            return;
        }
        Navigation.navigate(ROUTES.HOME);
    };

    const navigateToChats = () => {
        if (selectedTab === NAVIGATION_TABS.INBOX) {
            return;
        }

        startSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB, {
            name: CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB,
            op: CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB,
        });

        if (!shouldUseNarrowLayout && doesLastReportExist) {
            // Fetch route params on-demand to avoid storing the full route object in render-time state
            const rootState = navigationRef.getRootState();
            const lastRoute = rootState ? getLastRoute(rootState, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.REPORT) : undefined;
            if (lastRoute) {
                const {reportID, reportActionID, referrer, backTo} = lastRoute.params as ReportsSplitNavigatorParamList[typeof SCREENS.REPORT];
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID, doesLastReportActionExist ? reportActionID : undefined, referrer, backTo));
                return;
            }
        }

        Navigation.navigate(ROUTES.INBOX);
    };

    const navigateToSettings = () => {
        if (selectedTab === NAVIGATION_TABS.SETTINGS) {
            return;
        }
        interceptAnonymousUser(() => {
            Navigation.navigate(ROUTES.SETTINGS);
        });
    };

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
                        <PressableWithFeedback
                            onPress={navigateToChats}
                            role={CONST.ROLE.TAB}
                            accessibilityLabel={chatTabBrickRoad ? `${translate('common.inbox')}. ${translate('common.yourReviewIsRequired')}` : translate('common.inbox')}
                            accessibilityState={inboxAccessibilityState}
                            style={({hovered}) => [styles.leftNavigationTabBarItem, hovered && styles.navigationTabBarItemHovered]}
                            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.INBOX}
                        >
                            {({hovered}) => (
                                <TabBarItem
                                    icon={expensifyIcons.Inbox}
                                    label={translate('common.inbox')}
                                    isSelected={selectedTab === NAVIGATION_TABS.INBOX}
                                    isHovered={hovered}
                                    statusIndicatorColor={inboxStatusIndicatorColor}
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
                    <TabBarItem
                        icon={expensifyIcons.Home}
                        label={translate('common.home')}
                        isSelected={selectedTab === NAVIGATION_TABS.HOME}
                    />
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
                    <TabBarItem
                        icon={expensifyIcons.Inbox}
                        label={translate('common.inbox')}
                        isSelected={selectedTab === NAVIGATION_TABS.INBOX}
                        statusIndicatorColor={inboxStatusIndicatorColor}
                        numberOfLines={1}
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
