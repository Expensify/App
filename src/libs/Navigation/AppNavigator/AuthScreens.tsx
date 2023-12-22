import React, {memo, useEffect, useRef} from 'react';
import {View} from 'react-native';
import Onyx, {OnyxEntry, withOnyx} from 'react-native-onyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import Navigation from '@libs/Navigation/Navigation';
import NetworkConnection from '@libs/NetworkConnection';
import * as Pusher from '@libs/Pusher/pusher';
import PusherConnectionManager from '@libs/PusherConnectionManager';
import * as SessionUtils from '@libs/SessionUtils';
import type {AuthScreensParamList} from '@navigation/types';
import DemoSetupPage from '@pages/DemoSetupPage';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import DesktopSignInRedirectPage from '@pages/signin/DesktopSignInRedirectPage';
import SearchInputManager from '@pages/workspace/SearchInputManager';
import * as App from '@userActions/App';
import * as Download from '@userActions/Download';
import * as Modal from '@userActions/Modal';
import * as PersonalDetails from '@userActions/PersonalDetails';
import * as PriorityMode from '@userActions/PriorityMode';
import * as Report from '@userActions/Report';
import * as Session from '@userActions/Session';
import Timing from '@userActions/Timing';
import * as User from '@userActions/User';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import * as OnyxTypes from '@src/types/onyx';
import type {SelectedTimezone, Timezone} from '@src/types/onyx/PersonalDetails';
import createCustomStackNavigator from './createCustomStackNavigator';
import defaultScreenOptions from './defaultScreenOptions';
import getRootNavigatorScreenOptions from './getRootNavigatorScreenOptions';
import CentralPaneNavigator from './Navigators/CentralPaneNavigator';
import RightModalNavigator from './Navigators/RightModalNavigator';

type AuthScreensProps = {
    /** Session of currently logged in user */
    session: OnyxEntry<OnyxTypes.Session>;

    /** The report ID of the last opened public room as anonymous user */
    lastOpenedPublicRoomID: OnyxEntry<string>;

    /** Opt-in experimental mode that prevents certain Onyx keys from persisting to disk */
    isUsingMemoryOnlyKeys: OnyxEntry<boolean>;

    /** The last Onyx update ID was applied to the client */
    lastUpdateIDAppliedToClient: OnyxEntry<number>;

    /** Information about any currently running demos */
    demoInfo: OnyxEntry<OnyxTypes.DemoInfo>;
};

const loadReportAttachments = () => require('../../../pages/home/report/ReportAttachments').default as React.ComponentType;
const loadSidebarScreen = () => require('../../../pages/home/sidebar/SidebarScreen').default as React.ComponentType;
const loadValidateLoginPage = () => require('../../../pages/ValidateLoginPage').default as React.ComponentType;
const loadLogOutPreviousUserPage = () => require('../../../pages/LogOutPreviousUserPage').default as React.ComponentType;
const loadConciergePage = () => require('../../../pages/ConciergePage').default as React.ComponentType;

let timezone: Timezone | null;
let currentAccountID = -1;
let isLoadingApp = false;

Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        // When signed out, val hasn't accountID
        if (!(value && 'accountID' in value)) {
            timezone = null;
            return;
        }

        currentAccountID = value.accountID ?? -1;

        if (Navigation.isActiveRoute(ROUTES.SIGN_IN_MODAL)) {
            // This means sign in in RHP was successful, so we can dismiss the modal and subscribe to user events
            Navigation.dismissModal();
            User.subscribeToUserEvents();
        }
    },
});

Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        if (!value || timezone) {
            return;
        }

        timezone = value?.[currentAccountID]?.timezone ?? {};
        const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone as SelectedTimezone;

        // If the current timezone is different than the user's timezone, and their timezone is set to automatic
        // then update their timezone.
        if (timezone?.automatic && timezone?.selected !== currentTimezone) {
            timezone.selected = currentTimezone;
            PersonalDetails.updateAutomaticTimezone({
                automatic: true,
                selected: currentTimezone,
            });
        }
    },
});

Onyx.connect({
    key: ONYXKEYS.IS_LOADING_APP,
    callback: (value) => {
        isLoadingApp = !!value;
    },
});

const RootStack = createCustomStackNavigator<AuthScreensParamList>();
// We want to delay the re-rendering for components(e.g. ReportActionCompose)
// that depends on modal visibility until Modal is completely closed and its focused
// When modal screen is focused, update modal visibility in Onyx
// https://reactnavigation.org/docs/navigation-events/

const modalScreenListeners = {
    focus: () => {
        Modal.setModalVisibility(true);
    },
    beforeRemove: () => {
        // Clear search input (WorkspaceInvitePage) when modal is closed
        SearchInputManager.searchInput = '';
        Modal.setModalVisibility(false);
    },
};

function AuthScreens({lastUpdateIDAppliedToClient, session, lastOpenedPublicRoomID, demoInfo, isUsingMemoryOnlyKeys = false}: AuthScreensProps) {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();
    const screenOptions = getRootNavigatorScreenOptions(isSmallScreenWidth, styles);
    const isInitialRender = useRef(true);

    if (isInitialRender.current) {
        Timing.start(CONST.TIMING.HOMEPAGE_INITIAL_RENDER);
        isInitialRender.current = false;
    }

    useEffect(() => {
        const shortcutsOverviewShortcutConfig = CONST.KEYBOARD_SHORTCUTS.SHORTCUTS;
        const searchShortcutConfig = CONST.KEYBOARD_SHORTCUTS.SEARCH;
        const chatShortcutConfig = CONST.KEYBOARD_SHORTCUTS.NEW_CHAT;
        const currentUrl = getCurrentUrl();
        const isLoggingInAsNewUser = !!session?.email && SessionUtils.isLoggingInAsNewUser(currentUrl, session.email);
        const shouldGetAllData = !!isUsingMemoryOnlyKeys || SessionUtils.didUserLogInDuringSession();
        // Sign out the current user if we're transitioning with a different user
        const isTransitioning = currentUrl.includes(ROUTES.TRANSITION_BETWEEN_APPS);
        if (isLoggingInAsNewUser && isTransitioning) {
            Session.signOutAndRedirectToSignIn();
            return;
        }

        NetworkConnection.listenForReconnect();
        NetworkConnection.onReconnect(() => {
            if (isLoadingApp) {
                App.openApp();
            } else {
                App.reconnectApp(lastUpdateIDAppliedToClient);
            }
        });
        PusherConnectionManager.init();
        Pusher.init({
            appKey: CONFIG.PUSHER.APP_KEY,
            cluster: CONFIG.PUSHER.CLUSTER,
            authEndpoint: `${CONFIG.EXPENSIFY.DEFAULT_API_ROOT}api?command=AuthenticatePusher`,
        }).then(() => {
            User.subscribeToUserEvents();
        });

        // If we are on this screen then we are "logged in", but the user might not have "just logged in". They could be reopening the app
        // or returning from background. If so, we'll assume they have some app data already and we can call reconnectApp() instead of openApp().
        // Note: If a Guide has enabled the memory only key mode then we do want to run OpenApp as their app will not be rehydrated with
        // the correct state on refresh. They are explicitly opting out of storing data they would need (i.e. reports_) to take advantage of
        // the optimizations performed during ReconnectApp.
        if (shouldGetAllData) {
            App.openApp();
        } else {
            App.reconnectApp(lastUpdateIDAppliedToClient);
        }

        PriorityMode.autoSwitchToFocusMode();

        App.setUpPoliciesAndNavigate(session);

        App.redirectThirdPartyDesktopSignIn();

        // Check if we should be running any demos immediately after signing in.
        if (demoInfo?.money2020?.isBeginningDemo) {
            Navigation.navigate(ROUTES.MONEY2020, CONST.NAVIGATION.TYPE.FORCED_UP);
        }
        if (lastOpenedPublicRoomID) {
            // Re-open the last opened public room if the user logged in from a public room link
            Report.openLastOpenedPublicRoom(lastOpenedPublicRoomID);
        }
        Download.clearDownloads();

        Timing.end(CONST.TIMING.HOMEPAGE_INITIAL_RENDER);

        // Listen to keyboard shortcuts for opening certain pages
        const unsubscribeShortcutsOverviewShortcut = KeyboardShortcut.subscribe(
            shortcutsOverviewShortcutConfig.shortcutKey,
            () => {
                Modal.close(() => {
                    if (Navigation.isActiveRoute(ROUTES.KEYBOARD_SHORTCUTS)) {
                        return;
                    }
                    return Navigation.navigate(ROUTES.KEYBOARD_SHORTCUTS);
                });
            },
            shortcutsOverviewShortcutConfig.descriptionKey,
            shortcutsOverviewShortcutConfig.modifiers,
            true,
        );

        // Listen for the key K being pressed so that focus can be given to
        // the chat switcher, or new group chat
        // based on the key modifiers pressed and the operating system
        const unsubscribeSearchShortcut = KeyboardShortcut.subscribe(
            searchShortcutConfig.shortcutKey,
            () => {
                Modal.close(Session.checkIfActionIsAllowed(() => Navigation.navigate(ROUTES.SEARCH)));
            },
            shortcutsOverviewShortcutConfig.descriptionKey,
            shortcutsOverviewShortcutConfig.modifiers,
            true,
        );

        const unsubscribeChatShortcut = KeyboardShortcut.subscribe(
            chatShortcutConfig.shortcutKey,
            () => {
                Modal.close(Session.checkIfActionIsAllowed(() => Navigation.navigate(ROUTES.NEW)));
            },
            chatShortcutConfig.descriptionKey,
            chatShortcutConfig.modifiers,
            true,
        );

        return () => {
            unsubscribeShortcutsOverviewShortcut();
            unsubscribeSearchShortcut();
            unsubscribeChatShortcut();
            Session.cleanupSession();
        };

        // Rule disabled because this effect is only for component did mount & will component unmount lifecycle event
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <View style={styles.rootNavigatorContainerStyles(isSmallScreenWidth)}>
            <RootStack.Navigator isSmallScreenWidth={isSmallScreenWidth}>
                <RootStack.Screen
                    name={SCREENS.HOME}
                    options={screenOptions.homeScreen}
                    getComponent={loadSidebarScreen}
                />
                <RootStack.Screen
                    name={NAVIGATORS.CENTRAL_PANE_NAVIGATOR}
                    options={screenOptions.centralPaneNavigator}
                    component={CentralPaneNavigator}
                />
                <RootStack.Screen
                    name={SCREENS.VALIDATE_LOGIN}
                    options={{
                        ...screenOptions.fullScreen,
                        headerShown: false,
                        title: 'New Expensify',
                    }}
                    getComponent={loadValidateLoginPage}
                />
                <RootStack.Screen
                    name={SCREENS.TRANSITION_BETWEEN_APPS}
                    options={defaultScreenOptions}
                    getComponent={loadLogOutPreviousUserPage}
                />
                <RootStack.Screen
                    name={SCREENS.CONCIERGE}
                    options={defaultScreenOptions}
                    getComponent={loadConciergePage}
                />
                <RootStack.Screen
                    name={CONST.DEMO_PAGES.SAASTR}
                    options={defaultScreenOptions}
                    component={DemoSetupPage}
                />
                <RootStack.Screen
                    name={CONST.DEMO_PAGES.SBE}
                    options={defaultScreenOptions}
                    component={DemoSetupPage}
                />
                <RootStack.Screen
                    name={CONST.DEMO_PAGES.MONEY2020}
                    options={defaultScreenOptions}
                    component={DemoSetupPage}
                />
                <RootStack.Screen
                    name={SCREENS.REPORT_ATTACHMENTS}
                    options={{
                        headerShown: false,
                        presentation: 'transparentModal',
                    }}
                    getComponent={loadReportAttachments}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name={SCREENS.NOT_FOUND}
                    options={screenOptions.fullScreen}
                    component={NotFoundPage}
                />
                <RootStack.Screen
                    name={NAVIGATORS.RIGHT_MODAL_NAVIGATOR}
                    options={screenOptions.rightModalNavigator}
                    component={RightModalNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name={SCREENS.DESKTOP_SIGN_IN_REDIRECT}
                    options={screenOptions.fullScreen}
                    component={DesktopSignInRedirectPage}
                />
            </RootStack.Navigator>
        </View>
    );
}

AuthScreens.displayName = 'AuthScreens';

const AuthScreensMemoized = memo(AuthScreens, () => true);

export default withOnyx<AuthScreensProps, AuthScreensProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
    lastOpenedPublicRoomID: {
        key: ONYXKEYS.LAST_OPENED_PUBLIC_ROOM_ID,
    },
    isUsingMemoryOnlyKeys: {
        key: ONYXKEYS.IS_USING_MEMORY_ONLY_KEYS,
    },
    lastUpdateIDAppliedToClient: {
        key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    },
    demoInfo: {
        key: ONYXKEYS.DEMO_INFO,
    },
})(AuthScreensMemoized);
