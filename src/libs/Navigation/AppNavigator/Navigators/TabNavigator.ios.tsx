import buildingsSelectedIcon from '@assets/images/native-tab-icons/buildings-selected.png';
import buildingsIcon from '@assets/images/native-tab-icons/buildings.png';
import homeSelectedIcon from '@assets/images/native-tab-icons/home-selected.png';
import homeIcon from '@assets/images/native-tab-icons/home.png';
import inboxSelectedIcon from '@assets/images/native-tab-icons/inbox-selected.png';
import inboxIcon from '@assets/images/native-tab-icons/inbox.png';
import receiptMultipleSelectedIcon from '@assets/images/native-tab-icons/receipt-multiple-selected.png';
import receiptMultipleIcon from '@assets/images/native-tab-icons/receipt-multiple.png';

import FloatingCameraButton from '@components/FloatingCameraButton';
import FloatingGPSButton from '@components/FloatingGPSButton';
import {useFullScreenBlockingViewState} from '@components/FullScreenBlockingViewContextProvider';
import DebugTabView from '@components/Navigation/DebugTabView';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import ROUTE_TO_NAVIGATION_TAB from '@components/Navigation/NavigationTabBar/ROUTE_TO_NAVIGATION_TAB';

import useAccountTabIndicatorStatus from '@hooks/useAccountTabIndicatorStatus';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {useSidebarOrderedReportsState} from '@hooks/useSidebarOrderedReports';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspacesTabIndicatorStatus from '@hooks/useWorkspacesTabIndicatorStatus';

import {getPreservedNavigatorState, setPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import isTabRouteAtRoot from '@libs/Navigation/helpers/isTabRouteAtRoot';
import type {TabNavigatorParamList} from '@libs/Navigation/types';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import cancelTabNavigationSpans, {INBOX_TAB_SPAN_IDS, REPORTS_TAB_SPAN_IDS} from '@libs/telemetry/cancelTabNavigationSpans';
import {getAvatarURL} from '@libs/UserAvatarUtils';

import HomePage from '@pages/home/HomePage';
import NavigationTabBarFloatingActionButton from '@pages/inbox/sidebar/NavigationTabBarFloatingActionButton';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import type {NativeBottomTabIcon, NativeBottomTabNavigatorProps} from '@react-navigation/bottom-tabs/unstable';
import type {NavigationAction, NavigationState, PartialState, Router, TabNavigationState} from '@react-navigation/native';
import type {ImageSourcePropType} from 'react-native';

import {createNativeBottomTabNavigator} from '@react-navigation/bottom-tabs/unstable';
import {findFocusedRoute, useNavigation, useNavigationState, useRoute} from '@react-navigation/native';
import {ClipOp, ImageFormat, Skia} from '@shopify/react-native-skia';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

import ReportsSplitNavigator from './ReportsSplitNavigator';
import SearchFullscreenNavigator from './SearchFullscreenNavigator';
import SettingsSplitNavigator from './SettingsSplitNavigator';
import WorkspaceNavigator from './WorkspaceNavigator';

const Tab = createNativeBottomTabNavigator<TabNavigatorParamList>();

const getNativeTabIcon =
    (source: ImageSourcePropType, selectedSource: ImageSourcePropType) =>
    ({focused}: {focused: boolean}): NativeBottomTabIcon => ({type: 'image', source: focused ? selectedSource : source, tinted: false});

const HOME_TAB_ICON = getNativeTabIcon(homeIcon, homeSelectedIcon);
const INBOX_TAB_ICON = getNativeTabIcon(inboxIcon, inboxSelectedIcon);
const SPEND_TAB_ICON = getNativeTabIcon(receiptMultipleIcon, receiptMultipleSelectedIcon);
const WORKSPACES_TAB_ICON = getNativeTabIcon(buildingsIcon, buildingsSelectedIcon);
const ACCOUNT_TAB_ICON = {type: 'sfSymbol', name: 'person.crop.circle'} as const;

const TAB_ROOT_SCREENS_WITHOUT_GESTURE = new Set<string>([SCREENS.HOME, SCREENS.INBOX, SCREENS.SEARCH.ROOT, SCREENS.INSIGHTS, SCREENS.SETTINGS.ROOT]);

type NativeTabLayoutProps = Parameters<NonNullable<NativeBottomTabNavigatorProps['layout']>>[0];

function isRealizedNavigationState(state: NavigationState | PartialState<NavigationState> | undefined): state is NavigationState {
    return state?.stale === false;
}

async function createCircularAvatarIcon(uri: string): Promise<string | undefined> {
    const response = await fetch(uri);
    const encodedImage = Skia.Data.fromBytes(new Uint8Array(await response.arrayBuffer()));
    const image = Skia.Image.MakeImageFromEncoded(encodedImage);
    const iconSize = variables.iconBottomBar * 3;
    const surface = Skia.Surface.MakeOffscreen(iconSize, iconSize);

    if (!image || !surface) {
        image?.dispose();
        surface?.dispose();
        return undefined;
    }

    const sourceSize = Math.min(image.width(), image.height());
    const sourceX = (image.width() - sourceSize) / 2;
    const sourceY = (image.height() - sourceSize) / 2;
    const circle = Skia.Path.Make();
    circle.addCircle(iconSize / 2, iconSize / 2, iconSize / 2);

    const canvas = surface.getCanvas();
    canvas.clipPath(circle, ClipOp.Intersect, true);
    canvas.drawImageRect(image, Skia.XYWHRect(sourceX, sourceY, sourceSize, sourceSize), Skia.XYWHRect(0, 0, iconSize, iconSize), Skia.Paint());
    surface.flush();

    const snapshot = surface.makeImageSnapshot();
    const base64 = snapshot.encodeToBase64(ImageFormat.PNG, 100);

    circle.dispose();
    image.dispose();
    snapshot.dispose();
    surface.dispose();

    return `data:image/png;base64,${base64}`;
}

function NativeTabLayout({children, state, descriptors}: NativeTabLayoutProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBlockingViewVisible} = useFullScreenBlockingViewState();
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);
    const styles = useThemeStyles();
    const activeRoute = state.routes[state.index];
    const selectedTab = ROUTE_TO_NAVIGATION_TAB[activeRoute?.name ?? SCREENS.HOME] ?? NAVIGATION_TABS.HOME;
    const shouldShowFloatingButtons = shouldUseNarrowLayout && isTabRouteAtRoot(activeRoute) && !isBlockingViewVisible;
    const activeTabNavigation = activeRoute ? descriptors[activeRoute.key]?.navigation : undefined;

    useEffect(() => {
        activeTabNavigation?.setOptions({
            tabBarStyle: {display: shouldShowFloatingButtons ? 'flex' : 'none'},
        });
    }, [activeTabNavigation, shouldShowFloatingButtons]);

    return (
        <View style={styles.flex1}>
            {children}
            {!!isDebugModeEnabled && shouldShowFloatingButtons && <DebugTabView selectedTab={selectedTab} />}
            {shouldShowFloatingButtons && (
                <View
                    style={styles.nativeTabBarFloatingButtons}
                    pointerEvents="box-none"
                >
                    <View style={[styles.navigationTabBarFABItem, styles.ph0, styles.floatingActionButtonPosition]}>
                        <NavigationTabBarFloatingActionButton />
                    </View>
                    <FloatingGPSButton />
                    <FloatingCameraButton />
                </View>
            )}
        </View>
    );
}

const renderNativeTabLayout = (props: NativeTabLayoutProps) => <NativeTabLayout {...props} />;

function TabNavigator() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const theme = useTheme();
    const {chatTabBrickRoad} = useSidebarOrderedReportsState();
    const {indicatorColor: workspacesIndicatorColor, status: workspacesIndicatorStatus} = useWorkspacesTabIndicatorStatus();
    const {indicatorColor: accountIndicatorColor, status: accountIndicatorStatus} = useAccountTabIndicatorStatus();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const navigation = useNavigation();
    const parentNavigation = navigation.getParent();
    const focusedRouteName = useNavigationState((state) => findFocusedRoute(state)?.name);
    const route = useRoute();
    const tabState = useNavigationState((parentState) => parentState.routes.find((parentRoute) => parentRoute.key === route.key)?.state);
    const activeTabRouteName = isRealizedNavigationState(tabState) ? tabState.routes[tabState.index]?.name : SCREENS.HOME;
    const selectedTab = ROUTE_TO_NAVIGATION_TAB[activeTabRouteName] ?? NAVIGATION_TABS.HOME;
    const avatarSource = getAvatarURL({
        avatarSource: currentUserPersonalDetails.avatar,
        accountID: currentUserPersonalDetails.accountID,
    });
    const avatarURI = typeof avatarSource === 'string' ? avatarSource : undefined;
    const [circularAvatar, setCircularAvatar] = useState<{source: string; uri: string}>();
    const circularAvatarURI = circularAvatar && circularAvatar.source === avatarURI ? circularAvatar.uri : undefined;
    const accountTabIcon: NativeBottomTabIcon = circularAvatarURI
        ? {type: 'image', source: {uri: circularAvatarURI, width: variables.iconBottomBar, height: variables.iconBottomBar, scale: 3}, tinted: false}
        : ACCOUNT_TAB_ICON;

    useEffect(() => {
        let isActive = true;
        if (!avatarURI) {
            return () => {
                isActive = false;
            };
        }

        createCircularAvatarIcon(avatarURI)
            .then((result) => {
                if (!isActive || !result) {
                    return;
                }
                setCircularAvatar({source: avatarURI, uri: result});
            })
            .catch(() => {});

        return () => {
            isActive = false;
        };
    }, [avatarURI]);

    useEffect(() => {
        if (!shouldUseNarrowLayout || !parentNavigation) {
            return;
        }
        const isRootScreen = TAB_ROOT_SCREENS_WITHOUT_GESTURE.has(focusedRouteName ?? '');
        parentNavigation.setOptions({gestureEnabled: !isRootScreen});
    }, [focusedRouteName, shouldUseNarrowLayout, parentNavigation]);

    useEffect(() => {
        if (!isRealizedNavigationState(tabState)) {
            return;
        }
        setPreservedNavigatorState(route.key, tabState);
    }, [tabState, route.key]);

    useEffect(() => {
        let spans;
        if (selectedTab === NAVIGATION_TABS.INBOX) {
            spans = INBOX_TAB_SPAN_IDS;
        } else if (selectedTab === NAVIGATION_TABS.SEARCH) {
            spans = REPORTS_TAB_SPAN_IDS;
        }
        cancelTabNavigationSpans(spans);
    }, [selectedTab]);

    const tabRouterOverride = <Action extends NavigationAction>(
        originalRouter: Router<TabNavigationState<TabNavigatorParamList>, Action>,
    ): Partial<Router<TabNavigationState<TabNavigatorParamList>, Action>> => ({
        getInitialState: (configOptions) => {
            const preserved = getPreservedNavigatorState<TabNavigationState<TabNavigatorParamList>>(route.key);
            return preserved ? originalRouter.getRehydratedState(preserved, configOptions) : originalRouter.getInitialState(configOptions);
        },
    });

    const screenOptions = {
        headerShown: false,
        lazy: true,
        tabBarActiveTintColor: theme.iconMenu,
        tabBarInactiveTintColor: theme.icon,
        tabBarControllerMode: 'tabBar' as const,
        tabBarMinimizeBehavior: 'none' as const,
    };

    return (
        <Tab.Navigator
            backBehavior="fullHistory"
            layout={renderNativeTabLayout}
            screenOptions={screenOptions}
            UNSTABLE_router={tabRouterOverride}
        >
            <Tab.Screen
                name={SCREENS.HOME}
                component={HomePage}
                options={{tabBarLabel: '', tabBarIcon: HOME_TAB_ICON}}
            />
            <Tab.Screen
                name={NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}
                component={ReportsSplitNavigator}
                options={{
                    tabBarLabel: '',
                    tabBarIcon: INBOX_TAB_ICON,
                    tabBarBadge: chatTabBrickRoad ? ' ' : undefined,
                    tabBarBadgeStyle: {backgroundColor: chatTabBrickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO ? theme.iconSuccessFill : theme.danger},
                }}
            />
            <Tab.Screen
                name={NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}
                component={SearchFullscreenNavigator}
                initialParams={{
                    screen: SCREENS.SEARCH.ROOT,
                    params: {q: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE})},
                }}
                options={{tabBarLabel: '', tabBarIcon: SPEND_TAB_ICON}}
            />
            <Tab.Screen
                name={NAVIGATORS.WORKSPACE_NAVIGATOR}
                component={WorkspaceNavigator}
                options={{
                    tabBarLabel: '',
                    tabBarIcon: WORKSPACES_TAB_ICON,
                    tabBarBadge: workspacesIndicatorStatus ? ' ' : undefined,
                    tabBarBadgeStyle: {backgroundColor: workspacesIndicatorColor},
                }}
            />
            <Tab.Screen
                name={NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}
                component={SettingsSplitNavigator}
                options={{
                    tabBarLabel: '',
                    tabBarIcon: accountTabIcon,
                    tabBarBadge: accountIndicatorStatus ? ' ' : undefined,
                    tabBarBadgeStyle: {backgroundColor: accountIndicatorColor},
                }}
            />
        </Tab.Navigator>
    );
}

export default TabNavigator;
