import {findFocusedRoute} from '@react-navigation/native';
import React, {memo, useEffect, useRef, useState} from 'react';
import {NativeModules, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Onyx, {withOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ActiveGuidesEventListener from '@components/ActiveGuidesEventListener';
import ComposeProviders from '@components/ComposeProviders';
import OptionsListContextProvider from '@components/OptionListContextProvider';
import {SearchContextProvider} from '@components/Search/SearchContext';
import {useSearchRouterContext} from '@components/Search/SearchRouter/SearchRouterContext';
import SearchRouterModal from '@components/Search/SearchRouter/SearchRouterModal';
import TestToolsModal from '@components/TestToolsModal';
import * as TooltipManager from '@components/Tooltip/EducationalTooltip/TooltipManager';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useOnboardingFlowRouter from '@hooks/useOnboardingFlow';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {READ_COMMANDS} from '@libs/API/types';
import HttpUtils from '@libs/HttpUtils';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import Log from '@libs/Log';
import NavBarManager from '@libs/NavBarManager';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import Presentation from '@libs/Navigation/PlatformStackNavigation/navigationOptions/presentation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';
import shouldOpenOnAdminRoom from '@libs/Navigation/shouldOpenOnAdminRoom';
import type {AuthScreensParamList, CentralPaneName, CentralPaneScreensParamList} from '@libs/Navigation/types';
import {isOnboardingFlowName} from '@libs/NavigationUtils';
import NetworkConnection from '@libs/NetworkConnection';
import onyxSubscribe from '@libs/onyxSubscribe';
import * as Pusher from '@libs/Pusher/pusher';
import PusherConnectionManager from '@libs/PusherConnectionManager';
import * as ReportUtils from '@libs/ReportUtils';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import * as SessionUtils from '@libs/SessionUtils';
import ConnectionCompletePage from '@pages/ConnectionCompletePage';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import DesktopSignInRedirectPage from '@pages/signin/DesktopSignInRedirectPage';
import * as App from '@userActions/App';
import * as Download from '@userActions/Download';
import * as Modal from '@userActions/Modal';
import * as PersonalDetails from '@userActions/PersonalDetails';
import * as PriorityMode from '@userActions/PriorityMode';
import * as Report from '@userActions/Report';
import * as Session from '@userActions/Session';
import toggleTestToolsModal from '@userActions/TestTool';
import * as User from '@userActions/User';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {SelectedTimezone, Timezone} from '@src/types/onyx/PersonalDetails';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';
import beforeRemoveReportOpenedFromSearchRHP from './beforeRemoveReportOpenedFromSearchRHP';
import CENTRAL_PANE_SCREENS from './CENTRAL_PANE_SCREENS';
import createResponsiveStackNavigator from './createResponsiveStackNavigator';
import defaultScreenOptions from './defaultScreenOptions';
import hideKeyboardOnSwipe from './hideKeyboardOnSwipe';
import BottomTabNavigator from './Navigators/BottomTabNavigator';
import ExplanationModalNavigator from './Navigators/ExplanationModalNavigator';
import FeatureTrainingModalNavigator from './Navigators/FeatureTrainingModalNavigator';
import FullScreenNavigator from './Navigators/FullScreenNavigator';
import LeftModalNavigator from './Navigators/LeftModalNavigator';
import MigratedUserWelcomeModalNavigator from './Navigators/MigratedUserWelcomeModalNavigator';
import OnboardingModalNavigator from './Navigators/OnboardingModalNavigator';
import RightModalNavigator from './Navigators/RightModalNavigator';
import WelcomeVideoModalNavigator from './Navigators/WelcomeVideoModalNavigator';
import useRootNavigatorOptions from './useRootNavigatorOptions';

type AuthScreensProps = {
    /** Session of currently logged in user */
    session: OnyxEntry<OnyxTypes.Session>;

    /** The report ID of the last opened public room as anonymous user */
    lastOpenedPublicRoomID: OnyxEntry<string>;

    /** The last Onyx update ID was applied to the client */
    initialLastUpdateIDAppliedToClient: OnyxEntry<number>;
};

const loadReportAttachments = () => require<ReactComponentModule>('../../../pages/home/report/ReportAttachments').default;
const loadValidateLoginPage = () => require<ReactComponentModule>('../../../pages/ValidateLoginPage').default;
const loadLogOutPreviousUserPage = () => require<ReactComponentModule>('../../../pages/LogOutPreviousUserPage').default;
const loadConciergePage = () => require<ReactComponentModule>('../../../pages/ConciergePage').default;
const loadTrackExpensePage = () => require<ReactComponentModule>('../../../pages/TrackExpensePage').default;
const loadSubmitExpensePage = () => require<ReactComponentModule>('../../../pages/SubmitExpensePage').default;
const loadProfileAvatar = () => require<ReactComponentModule>('../../../pages/settings/Profile/ProfileAvatar').default;
const loadWorkspaceAvatar = () => require<ReactComponentModule>('../../../pages/workspace/WorkspaceAvatar').default;
const loadReportAvatar = () => require<ReactComponentModule>('../../../pages/ReportAvatar').default;
const loadReceiptView = () => require<ReactComponentModule>('../../../pages/TransactionReceiptPage').default;
const loadWorkspaceJoinUser = () => require<ReactComponentModule>('@pages/workspace/WorkspaceJoinUserPage').default;

function getCentralPaneScreenInitialParams(screenName: CentralPaneName, initialReportID?: string): Partial<ValueOf<CentralPaneScreensParamList>> {
    if (screenName === SCREENS.SEARCH.CENTRAL_PANE) {
        // Generate default query string with buildSearchQueryString without argument.
        return {q: SearchQueryUtils.buildSearchQueryString()};
    }

    if (screenName === SCREENS.REPORT) {
        return {
            openOnAdminRoom: shouldOpenOnAdminRoom() ? true : undefined,
            reportID: initialReportID,
        };
    }

    return undefined;
}

function getCentralPaneScreenListeners(screenName: CentralPaneName) {
    if (screenName === SCREENS.REPORT) {
        return {beforeRemove: beforeRemoveReportOpenedFromSearchRHP};
    }

    return {};
}

function initializePusher() {
    return Pusher.init({
        appKey: CONFIG.PUSHER.APP_KEY,
        cluster: CONFIG.PUSHER.CLUSTER,
        authEndpoint: `${CONFIG.EXPENSIFY.DEFAULT_API_ROOT}api/AuthenticatePusher?`,
    }).then(() => {
        User.subscribeToUserEvents();
    });
}

let timezone: Timezone | null;
let currentAccountID = -1;
let isLoadingApp = false;
let lastUpdateIDAppliedToClient: OnyxEntry<number>;

Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        // When signed out, val hasn't accountID
        if (!(value && 'accountID' in value)) {
            currentAccountID = -1;
            timezone = null;
            return;
        }

        currentAccountID = value.accountID ?? -1;

        if (Navigation.isActiveRoute(ROUTES.SIGN_IN_MODAL)) {
            // This means sign in in RHP was successful, so we can subscribe to user events
            initializePusher();
        }
    },
});

Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        if (!value || !isEmptyObject(timezone)) {
            return;
        }

        timezone = value?.[currentAccountID]?.timezone ?? {};
        const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone as SelectedTimezone;

        // If the current timezone is different than the user's timezone, and their timezone is set to automatic
        // then update their timezone.
        if (!isEmptyObject(currentTimezone) && timezone?.automatic && timezone?.selected !== currentTimezone) {
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

Onyx.connect({
    key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    callback: (value) => {
        lastUpdateIDAppliedToClient = value;
    },
});

function handleNetworkReconnect() {
    if (isLoadingApp) {
        App.openApp();
    } else {
        Log.info('[handleNetworkReconnect] Sending ReconnectApp');
        App.reconnectApp(lastUpdateIDAppliedToClient);
    }
}

const RootStack = createResponsiveStackNavigator<AuthScreensParamList>();
// We want to delay the re-rendering for components(e.g. ReportActionCompose)
// that depends on modal visibility until Modal is completely closed and its focused
// When modal screen is focused, update modal visibility in Onyx
// https://reactnavigation.org/docs/navigation-events/

const modalScreenListeners = {
    focus: () => {
        // Since we don't cancel the tooltip in setModalVisibility, we need to do it here so it will be cancelled when a modal screen is shown.
        TooltipManager.cancelPendingAndActiveTooltips();
        Modal.setModalVisibility(true);
    },
    blur: () => {
        Modal.setModalVisibility(false);
    },
    beforeRemove: () => {
        Modal.setModalVisibility(false);
        Modal.willAlertModalBecomeVisible(false);
    },
};

// Extended modal screen listeners with additional cancellation of pending requests
const modalScreenListenersWithCancelSearch = {
    ...modalScreenListeners,
    beforeRemove: () => {
        modalScreenListeners.beforeRemove();
        HttpUtils.cancelPendingRequests(READ_COMMANDS.SEARCH_FOR_REPORTS);
    },
};

function AuthScreens({session, lastOpenedPublicRoomID, initialLastUpdateIDAppliedToClient}: AuthScreensProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const rootNavigatorOptions = useRootNavigatorOptions();
    const {canUseDefaultRooms} = usePermissions();
    const {activeWorkspaceID} = useActiveWorkspace();
    const {toggleSearch} = useSearchRouterContext();

    const modal = useRef<OnyxTypes.Modal>({});
    const {isOnboardingCompleted} = useOnboardingFlowRouter();
    const [initialReportID] = useState(() => {
        const currentURL = getCurrentUrl();
        const reportIdFromPath = currentURL && new URL(currentURL).pathname.match(CONST.REGEX.REPORT_ID_FROM_PATH)?.at(1);
        if (reportIdFromPath) {
            return reportIdFromPath;
        }

        const initialReport = ReportUtils.findLastAccessedReport(!canUseDefaultRooms, shouldOpenOnAdminRoom(), activeWorkspaceID);
        return initialReport?.reportID ?? '';
    });

    useEffect(() => {
        NavBarManager.setButtonStyle(theme.navigationBarButtonsStyle);

        return () => {
            NavBarManager.setButtonStyle(CONST.NAVIGATION_BAR_BUTTONS_STYLE.LIGHT);
        };
    }, [theme]);

    useEffect(() => {
        const shortcutsOverviewShortcutConfig = CONST.KEYBOARD_SHORTCUTS.SHORTCUTS;
        const searchShortcutConfig = CONST.KEYBOARD_SHORTCUTS.SEARCH;
        const chatShortcutConfig = CONST.KEYBOARD_SHORTCUTS.NEW_CHAT;
        const debugShortcutConfig = CONST.KEYBOARD_SHORTCUTS.DEBUG;
        const currentUrl = getCurrentUrl();
        const isLoggingInAsNewUser = !!session?.email && SessionUtils.isLoggingInAsNewUser(currentUrl, session.email);
        // Sign out the current user if we're transitioning with a different user
        const isTransitioning = currentUrl.includes(ROUTES.TRANSITION_BETWEEN_APPS);
        const isSupportalTransition = currentUrl.includes('authTokenType=support');
        if (isLoggingInAsNewUser && isTransitioning) {
            Session.signOutAndRedirectToSignIn(false, isSupportalTransition);
            return;
        }

        NetworkConnection.listenForReconnect();
        NetworkConnection.onReconnect(handleNetworkReconnect);
        PusherConnectionManager.init();
        initializePusher();

        // In Hybrid App we decide to call one of those method when booting ND and we don't want to duplicate calls
        if (!NativeModules.HybridAppModule) {
            // If we are on this screen then we are "logged in", but the user might not have "just logged in". They could be reopening the app
            // or returning from background. If so, we'll assume they have some app data already and we can call reconnectApp() instead of openApp().
            if (SessionUtils.didUserLogInDuringSession()) {
                App.openApp();
            } else {
                Log.info('[AuthScreens] Sending ReconnectApp');
                App.reconnectApp(initialLastUpdateIDAppliedToClient);
            }
        }

        PriorityMode.autoSwitchToFocusMode();

        App.setUpPoliciesAndNavigate(session);

        App.redirectThirdPartyDesktopSignIn();

        if (lastOpenedPublicRoomID) {
            // Re-open the last opened public room if the user logged in from a public room link
            Report.openLastOpenedPublicRoom(lastOpenedPublicRoomID);
        }
        Download.clearDownloads();

        const unsubscribeOnyxModal = onyxSubscribe({
            key: ONYXKEYS.MODAL,
            callback: (modalArg) => {
                if (modalArg === null || typeof modalArg !== 'object') {
                    return;
                }
                modal.current = modalArg;
            },
        });

        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.ESCAPE;
        const unsubscribeEscapeKey = KeyboardShortcut.subscribe(
            shortcutConfig.shortcutKey,
            () => {
                if (modal.current.willAlertModalBecomeVisible) {
                    return;
                }

                if (modal.current.disableDismissOnEscape) {
                    return;
                }

                Navigation.dismissModal();
            },
            shortcutConfig.descriptionKey,
            shortcutConfig.modifiers,
            true,
            true,
        );

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
        // Search Router, or new group chat
        // based on the key modifiers pressed and the operating system
        const unsubscribeSearchShortcut = KeyboardShortcut.subscribe(
            searchShortcutConfig.shortcutKey,
            () => {
                Session.checkIfActionIsAllowed(() => {
                    const state = navigationRef.getRootState();
                    const currentFocusedRoute = findFocusedRoute(state);
                    if (isOnboardingFlowName(currentFocusedRoute?.name)) {
                        return;
                    }
                    toggleSearch();
                })();
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

        const unsubscribeDebugShortcut = KeyboardShortcut.subscribe(
            debugShortcutConfig.shortcutKey,
            () => toggleTestToolsModal(),
            debugShortcutConfig.descriptionKey,
            debugShortcutConfig.modifiers,
            true,
        );

        return () => {
            unsubscribeEscapeKey();
            unsubscribeOnyxModal();
            unsubscribeShortcutsOverviewShortcut();
            unsubscribeSearchShortcut();
            unsubscribeChatShortcut();
            unsubscribeDebugShortcut();
            Session.cleanupSession();
        };

        // Rule disabled because this effect is only for component did mount & will component unmount lifecycle event
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const CentralPaneScreenOptions: PlatformStackNavigationOptions = {
        ...hideKeyboardOnSwipe,
        headerShown: false,
        title: 'New Expensify',
        web: {
            // Prevent unnecessary scrolling
            cardStyle: styles.cardStyleNavigator,
        },
    };

    return (
        <ComposeProviders components={[OptionsListContextProvider, SearchContextProvider]}>
            <View style={styles.rootNavigatorContainerStyles(shouldUseNarrowLayout)}>
                <RootStack.Navigator screenOptions={rootNavigatorOptions.centralPaneNavigator}>
                    <RootStack.Screen
                        name={NAVIGATORS.BOTTOM_TAB_NAVIGATOR}
                        options={rootNavigatorOptions.bottomTab}
                        component={BottomTabNavigator}
                    />
                    <RootStack.Screen
                        name={SCREENS.VALIDATE_LOGIN}
                        options={{
                            ...rootNavigatorOptions.fullScreen,
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
                        name={SCREENS.TRACK_EXPENSE}
                        options={defaultScreenOptions}
                        getComponent={loadTrackExpensePage}
                    />
                    <RootStack.Screen
                        name={SCREENS.SUBMIT_EXPENSE}
                        options={defaultScreenOptions}
                        getComponent={loadSubmitExpensePage}
                    />
                    <RootStack.Screen
                        name={SCREENS.ATTACHMENTS}
                        options={{
                            headerShown: false,
                            presentation: Presentation.TRANSPARENT_MODAL,
                        }}
                        getComponent={loadReportAttachments}
                        listeners={modalScreenListeners}
                    />
                    <RootStack.Screen
                        name={SCREENS.PROFILE_AVATAR}
                        options={{
                            headerShown: false,
                            presentation: Presentation.TRANSPARENT_MODAL,
                            animation: 'none',
                        }}
                        getComponent={loadProfileAvatar}
                        listeners={modalScreenListeners}
                    />
                    <RootStack.Screen
                        name={SCREENS.WORKSPACE_AVATAR}
                        options={{
                            headerShown: false,
                            presentation: Presentation.TRANSPARENT_MODAL,
                        }}
                        getComponent={loadWorkspaceAvatar}
                        listeners={modalScreenListeners}
                    />
                    <RootStack.Screen
                        name={SCREENS.REPORT_AVATAR}
                        options={{
                            headerShown: false,
                            presentation: Presentation.TRANSPARENT_MODAL,
                        }}
                        getComponent={loadReportAvatar}
                        listeners={modalScreenListeners}
                    />
                    <RootStack.Screen
                        name={SCREENS.NOT_FOUND}
                        options={rootNavigatorOptions.fullScreen}
                        component={NotFoundPage}
                    />
                    <RootStack.Screen
                        name={NAVIGATORS.RIGHT_MODAL_NAVIGATOR}
                        options={rootNavigatorOptions.rightModalNavigator}
                        component={RightModalNavigator}
                        listeners={modalScreenListenersWithCancelSearch}
                    />
                    <RootStack.Screen
                        name={NAVIGATORS.FULL_SCREEN_NAVIGATOR}
                        options={rootNavigatorOptions.fullScreen}
                        component={FullScreenNavigator}
                    />
                    <RootStack.Screen
                        name={NAVIGATORS.LEFT_MODAL_NAVIGATOR}
                        options={rootNavigatorOptions.leftModalNavigator}
                        component={LeftModalNavigator}
                        listeners={modalScreenListeners}
                    />
                    <RootStack.Screen
                        name={SCREENS.DESKTOP_SIGN_IN_REDIRECT}
                        options={rootNavigatorOptions.fullScreen}
                        component={DesktopSignInRedirectPage}
                    />
                    <RootStack.Screen
                        name={NAVIGATORS.EXPLANATION_MODAL_NAVIGATOR}
                        options={rootNavigatorOptions.basicModalNavigator}
                        component={ExplanationModalNavigator}
                    />
                    <RootStack.Screen
                        name={NAVIGATORS.MIGRATED_USER_MODAL_NAVIGATOR}
                        options={rootNavigatorOptions.basicModalNavigator}
                        component={MigratedUserWelcomeModalNavigator}
                    />
                    <RootStack.Screen
                        name={NAVIGATORS.FEATURE_TRANING_MODAL_NAVIGATOR}
                        options={rootNavigatorOptions.basicModalNavigator}
                        component={FeatureTrainingModalNavigator}
                        listeners={modalScreenListeners}
                    />
                    <RootStack.Screen
                        name={NAVIGATORS.WELCOME_VIDEO_MODAL_NAVIGATOR}
                        options={rootNavigatorOptions.basicModalNavigator}
                        component={WelcomeVideoModalNavigator}
                    />
                    {isOnboardingCompleted === false && (
                        <RootStack.Screen
                            name={NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR}
                            options={{...rootNavigatorOptions.basicModalNavigator, gestureEnabled: false}}
                            component={OnboardingModalNavigator}
                            listeners={{
                                focus: () => {
                                    Modal.setDisableDismissOnEscape(true);
                                },
                                beforeRemove: () => Modal.setDisableDismissOnEscape(false),
                            }}
                        />
                    )}
                    <RootStack.Screen
                        name={SCREENS.WORKSPACE_JOIN_USER}
                        options={{
                            headerShown: false,
                        }}
                        listeners={modalScreenListeners}
                        getComponent={loadWorkspaceJoinUser}
                    />
                    <RootStack.Screen
                        name={SCREENS.TRANSACTION_RECEIPT}
                        options={{
                            headerShown: false,
                            presentation: Presentation.TRANSPARENT_MODAL,
                        }}
                        getComponent={loadReceiptView}
                        listeners={modalScreenListeners}
                    />
                    <RootStack.Screen
                        name={SCREENS.CONNECTION_COMPLETE}
                        options={defaultScreenOptions}
                        component={ConnectionCompletePage}
                    />
                    {Object.entries(CENTRAL_PANE_SCREENS).map(([screenName, componentGetter]) => {
                        const centralPaneName = screenName as CentralPaneName;
                        return (
                            <RootStack.Screen
                                key={centralPaneName}
                                name={centralPaneName}
                                initialParams={getCentralPaneScreenInitialParams(centralPaneName, initialReportID)}
                                getComponent={componentGetter}
                                options={CentralPaneScreenOptions}
                                listeners={getCentralPaneScreenListeners(centralPaneName)}
                            />
                        );
                    })}
                </RootStack.Navigator>
                <TestToolsModal />
                <SearchRouterModal />
            </View>
            <ActiveGuidesEventListener />
        </ComposeProviders>
    );
}

AuthScreens.displayName = 'AuthScreens';

const AuthScreensMemoized = memo(AuthScreens, () => true);

// Migration to useOnyx cause re-login if logout from deeplinked report in desktop app
// Further analysis required and more details can be seen here:
// https://github.com/Expensify/App/issues/50560
// eslint-disable-next-line
export default withOnyx<AuthScreensProps, AuthScreensProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
    lastOpenedPublicRoomID: {
        key: ONYXKEYS.LAST_OPENED_PUBLIC_ROOM_ID,
    },
    initialLastUpdateIDAppliedToClient: {
        key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    },
})(AuthScreensMemoized);
