import type {RouteProp} from '@react-navigation/native';
import {findFocusedRoute, useNavigation} from '@react-navigation/native';
import React, {memo, useEffect, useMemo, useRef, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import Onyx, {useOnyx, withOnyx} from 'react-native-onyx';
import ActiveWorkspaceContextProvider from '@components/ActiveWorkspaceProvider';
import ComposeProviders from '@components/ComposeProviders';
import OptionsListContextProvider from '@components/OptionListContextProvider';
import {SearchContextProvider} from '@components/Search/SearchContext';
import {useSearchRouterContext} from '@components/Search/SearchRouter/SearchRouterContext';
import SearchRouterModal from '@components/Search/SearchRouter/SearchRouterModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnboardingFlowRouter from '@hooks/useOnboardingFlow';
import {ReportIDsContextProvider} from '@hooks/useReportIDs';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import setFullscreenVisibility from '@libs/actions/setFullscreenVisibility';
import {READ_COMMANDS} from '@libs/API/types';
import HttpUtils from '@libs/HttpUtils';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import Log from '@libs/Log';
import NavBarManager from '@libs/NavBarManager';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import {isOnboardingFlowName} from '@libs/Navigation/helpers/isNavigatorName';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import Presentation from '@libs/Navigation/PlatformStackNavigation/navigationOptions/presentation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import NetworkConnection from '@libs/NetworkConnection';
import onyxSubscribe from '@libs/onyxSubscribe';
import Pusher from '@libs/Pusher';
import PusherConnectionManager from '@libs/PusherConnectionManager';
import * as SessionUtils from '@libs/SessionUtils';
import ConnectionCompletePage from '@pages/ConnectionCompletePage';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import RequireTwoFactorAuthenticationPage from '@pages/RequireTwoFactorAuthenticationPage';
import DesktopSignInRedirectPage from '@pages/signin/DesktopSignInRedirectPage';
import * as App from '@userActions/App';
import * as Download from '@userActions/Download';
import * as Modal from '@userActions/Modal';
import * as PersonalDetails from '@userActions/PersonalDetails';
import * as PriorityMode from '@userActions/PriorityMode';
import * as Report from '@userActions/Report';
import * as Session from '@userActions/Session';
import * as User from '@userActions/User';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import '@src/libs/subscribeToFullReconnect';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {SelectedTimezone, Timezone} from '@src/types/onyx/PersonalDetails';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';
import createRootStackNavigator from './createRootStackNavigator';
import {reportsSplitsWithEnteringAnimation, workspaceSplitsWithoutEnteringAnimation} from './createRootStackNavigator/GetStateForActionHandlers';
import defaultScreenOptions from './defaultScreenOptions';
import {ShareModalStackNavigator} from './ModalStackNavigators';
import ExplanationModalNavigator from './Navigators/ExplanationModalNavigator';
import FeatureTrainingModalNavigator from './Navigators/FeatureTrainingModalNavigator';
import LeftModalNavigator from './Navigators/LeftModalNavigator';
import MigratedUserWelcomeModalNavigator from './Navigators/MigratedUserWelcomeModalNavigator';
import OnboardingModalNavigator from './Navigators/OnboardingModalNavigator';
import RightModalNavigator from './Navigators/RightModalNavigator';
import WelcomeVideoModalNavigator from './Navigators/WelcomeVideoModalNavigator';
import useRootNavigatorScreenOptions from './useRootNavigatorScreenOptions';

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

const loadReportSplitNavigator = () => require<ReactComponentModule>('./Navigators/ReportsSplitNavigator').default;
const loadSettingsSplitNavigator = () => require<ReactComponentModule>('./Navigators/SettingsSplitNavigator').default;
const loadWorkspaceSplitNavigator = () => require<ReactComponentModule>('./Navigators/WorkspaceSplitNavigator').default;
const loadSearchNavigator = () => require<ReactComponentModule>('./Navigators/SearchFullscreenNavigator').default;

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

        currentAccountID = value.accountID ?? CONST.DEFAULT_NUMBER_ID;

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

const RootStack = createRootStackNavigator<AuthScreensParamList>();
// We want to delay the re-rendering for components(e.g. ReportActionCompose)
// that depends on modal visibility until Modal is completely closed and its focused
// When modal screen is focused, update modal visibility in Onyx
// https://reactnavigation.org/docs/navigation-events/

const modalScreenListeners = {
    focus: () => {
        Modal.setModalVisibility(true, CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED);
    },
    blur: () => {
        Modal.setModalVisibility(false);
    },
    beforeRemove: () => {
        Modal.setModalVisibility(false);
        Modal.willAlertModalBecomeVisible(false);
    },
};

const fullScreenListeners = {
    focus: () => {
        setFullscreenVisibility(true);
    },
    beforeRemove: () => {
        setFullscreenVisibility(false);
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
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const rootNavigatorScreenOptions = useRootNavigatorScreenOptions();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {toggleSearch} = useSearchRouterContext();

    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const modal = useRef<OnyxTypes.Modal>({});
    const {isOnboardingCompleted} = useOnboardingFlowRouter();
    const [shouldShowRequire2FAPage, setShouldShowRequire2FAPage] = useState(!!account?.needsTwoFactorAuthSetup && !account.requiresTwoFactorAuth);
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = navigation.addListener('state', () => {
            PriorityMode.autoSwitchToFocusMode();
        });
        return () => unsubscribe();
    }, [navigation]);

    // On HybridApp we need to prevent flickering during transition to OldDot
    const shouldRenderOnboardingExclusivelyOnHybridApp = useMemo(() => {
        return CONFIG.IS_HYBRID_APP && Navigation.getActiveRoute().includes(ROUTES.ONBOARDING_EMPLOYEES.route) && isOnboardingCompleted === true;
    }, [isOnboardingCompleted]);

    useEffect(() => {
        NavBarManager.setButtonStyle(theme.navigationBarButtonsStyle);

        return () => {
            NavBarManager.setButtonStyle(CONST.NAVIGATION_BAR_BUTTONS_STYLE.LIGHT);
        };
    }, [theme]);

    useEffect(() => {
        if (!account?.needsTwoFactorAuthSetup || !!account.requiresTwoFactorAuth || shouldShowRequire2FAPage) {
            return;
        }
        setShouldShowRequire2FAPage(true);
    }, [account?.needsTwoFactorAuthSetup, account?.requiresTwoFactorAuth, shouldShowRequire2FAPage]);

    useEffect(() => {
        if (!shouldShowRequire2FAPage) {
            return;
        }
        Navigation.navigate(ROUTES.REQUIRE_TWO_FACTOR_AUTH);
    }, [shouldShowRequire2FAPage]);

    useEffect(() => {
        const shortcutsOverviewShortcutConfig = CONST.KEYBOARD_SHORTCUTS.SHORTCUTS;
        const searchShortcutConfig = CONST.KEYBOARD_SHORTCUTS.SEARCH;
        const chatShortcutConfig = CONST.KEYBOARD_SHORTCUTS.NEW_CHAT;
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
        if (!CONFIG.IS_HYBRID_APP) {
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
                Session.callFunctionIfActionIsAllowed(() => {
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
                Modal.close(Session.callFunctionIfActionIsAllowed(() => Navigation.navigate(ROUTES.NEW)));
            },
            chatShortcutConfig.descriptionKey,
            chatShortcutConfig.modifiers,
            true,
        );

        return () => {
            unsubscribeEscapeKey();
            unsubscribeOnyxModal();
            unsubscribeShortcutsOverviewShortcut();
            unsubscribeSearchShortcut();
            unsubscribeChatShortcut();
            Session.cleanupSession();
        };

        // Rule disabled because this effect is only for component did mount & will component unmount lifecycle event
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    // Animation is disabled when navigating to the sidebar screen
    const getWorkspaceSplitNavigatorOptions = ({route}: {route: RouteProp<AuthScreensParamList>}) => {
        // We don't need to do anything special for the wide screen.
        if (!shouldUseNarrowLayout) {
            return rootNavigatorScreenOptions.splitNavigator;
        }

        // On the narrow screen, we want to animate this navigator if it is opened from the settings split.
        // If it is opened from other tab, we don't want to animate it on the entry.
        // There is a hook inside the workspace navigator that changes animation to SLIDE_FROM_RIGHT after entering.
        // This way it can be animated properly when going back to the settings split.
        const animationEnabled = !workspaceSplitsWithoutEnteringAnimation.has(route.key);

        return {
            ...rootNavigatorScreenOptions.splitNavigator,

            // Allow swipe to go back from this split navigator to the settings navigator.
            gestureEnabled: true,
            animation: animationEnabled ? Animations.SLIDE_FROM_RIGHT : Animations.NONE,
        };
    };

    // Animation is enabled when navigating to the report screen
    const getReportsSplitNavigatorOptions = ({route}: {route: RouteProp<AuthScreensParamList>}) => {
        // We don't need to do anything special for the wide screen.
        if (!shouldUseNarrowLayout) {
            return rootNavigatorScreenOptions.splitNavigator;
        }

        // On the narrow screen, we want to animate this navigator if pushed ReportsSplitNavigator includes ReportScreen
        const animationEnabled = reportsSplitsWithEnteringAnimation.has(route.key);

        return {
            ...rootNavigatorScreenOptions.splitNavigator,
            animation: animationEnabled ? Animations.SLIDE_FROM_RIGHT : Animations.NONE,
        };
    };

    const clearStatus = () => {
        User.clearCustomStatus();
        User.clearDraftCustomStatus();
    };

    useEffect(() => {
        if (!currentUserPersonalDetails.status?.clearAfter) {
            return;
        }
        const currentTime = new Date();
        const clearAfterTime = new Date(currentUserPersonalDetails.status.clearAfter);
        if (Number.isNaN(clearAfterTime.getTime())) {
            return;
        }
        const subMilisecondsTime = clearAfterTime.getTime() - currentTime.getTime();
        if (subMilisecondsTime > 0) {
            const timeoutID = setTimeout(() => {
                clearStatus();
            }, subMilisecondsTime);
            return () => {
                clearTimeout(timeoutID);
            };
        }

        clearStatus();
    }, [currentUserPersonalDetails.status?.clearAfter]);

    return (
        <ComposeProviders components={[OptionsListContextProvider, ActiveWorkspaceContextProvider, ReportIDsContextProvider, SearchContextProvider]}>
            <RootStack.Navigator persistentScreens={[NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, SCREENS.SEARCH.ROOT]}>
                {/* This has to be the first navigator in auth screens. */}
                <RootStack.Screen
                    name={NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}
                    options={getReportsSplitNavigatorOptions}
                    getComponent={loadReportSplitNavigator}
                />
                <RootStack.Screen
                    name={NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}
                    options={rootNavigatorScreenOptions.splitNavigator}
                    getComponent={loadSettingsSplitNavigator}
                />
                <RootStack.Screen
                    name={NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}
                    options={rootNavigatorScreenOptions.fullScreen}
                    getComponent={loadSearchNavigator}
                />
                <RootStack.Screen
                    name={NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR}
                    options={getWorkspaceSplitNavigatorOptions}
                    getComponent={loadWorkspaceSplitNavigator}
                />
                <RootStack.Screen
                    name={SCREENS.VALIDATE_LOGIN}
                    options={{
                        ...rootNavigatorScreenOptions.fullScreen,
                        headerShown: false,
                        title: 'New Expensify',
                    }}
                    listeners={fullScreenListeners}
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
                        animation: Animations.NONE,
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
                    options={rootNavigatorScreenOptions.fullScreen}
                    component={NotFoundPage}
                />
                <RootStack.Screen
                    name={NAVIGATORS.RIGHT_MODAL_NAVIGATOR}
                    options={rootNavigatorScreenOptions.rightModalNavigator}
                    component={RightModalNavigator}
                    listeners={{
                        ...modalScreenListenersWithCancelSearch,
                        beforeRemove: () => {
                            modalScreenListenersWithCancelSearch.beforeRemove();

                            // When a 2FA RHP page is closed, if the 2FA require page is visible and the user has now enabled the 2FA, then remove the 2FA require page from the navigator.
                            const routeParams = navigation.getState()?.routes?.at(-1)?.params;
                            const screen = routeParams && 'screen' in routeParams ? routeParams.screen : '';
                            if (!shouldShowRequire2FAPage || !account?.requiresTwoFactorAuth || screen !== SCREENS.RIGHT_MODAL.TWO_FACTOR_AUTH) {
                                return;
                            }
                            setShouldShowRequire2FAPage(false);
                        },
                    }}
                />
                <RootStack.Screen
                    name={NAVIGATORS.LEFT_MODAL_NAVIGATOR}
                    options={rootNavigatorScreenOptions.leftModalNavigator}
                    component={LeftModalNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name={SCREENS.DESKTOP_SIGN_IN_REDIRECT}
                    options={rootNavigatorScreenOptions.fullScreen}
                    component={DesktopSignInRedirectPage}
                />
                <RootStack.Screen
                    name={NAVIGATORS.SHARE_MODAL_NAVIGATOR}
                    options={rootNavigatorScreenOptions.fullScreen}
                    component={ShareModalStackNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name={NAVIGATORS.EXPLANATION_MODAL_NAVIGATOR}
                    options={rootNavigatorScreenOptions.basicModalNavigator}
                    component={ExplanationModalNavigator}
                />
                <RootStack.Screen
                    name={NAVIGATORS.MIGRATED_USER_MODAL_NAVIGATOR}
                    options={rootNavigatorScreenOptions.basicModalNavigator}
                    component={MigratedUserWelcomeModalNavigator}
                />
                <RootStack.Screen
                    name={NAVIGATORS.FEATURE_TRANING_MODAL_NAVIGATOR}
                    options={rootNavigatorScreenOptions.basicModalNavigator}
                    component={FeatureTrainingModalNavigator}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name={NAVIGATORS.WELCOME_VIDEO_MODAL_NAVIGATOR}
                    options={rootNavigatorScreenOptions.basicModalNavigator}
                    component={WelcomeVideoModalNavigator}
                />
                {(isOnboardingCompleted === false || shouldRenderOnboardingExclusivelyOnHybridApp) && (
                    <RootStack.Screen
                        name={NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR}
                        options={{...rootNavigatorScreenOptions.basicModalNavigator, gestureEnabled: false}}
                        component={OnboardingModalNavigator}
                        listeners={{
                            focus: () => {
                                Modal.setDisableDismissOnEscape(true);
                            },
                            beforeRemove: () => Modal.setDisableDismissOnEscape(false),
                        }}
                    />
                )}
                {shouldShowRequire2FAPage && (
                    <RootStack.Screen
                        name={SCREENS.REQUIRE_TWO_FACTOR_AUTH}
                        options={{...rootNavigatorScreenOptions.fullScreen, gestureEnabled: false}}
                        component={RequireTwoFactorAuthenticationPage}
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
                    options={rootNavigatorScreenOptions.fullScreen}
                    component={ConnectionCompletePage}
                />
                <RootStack.Screen
                    name={SCREENS.BANK_CONNECTION_COMPLETE}
                    options={rootNavigatorScreenOptions.fullScreen}
                    component={ConnectionCompletePage}
                />
            </RootStack.Navigator>
            <SearchRouterModal />
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
