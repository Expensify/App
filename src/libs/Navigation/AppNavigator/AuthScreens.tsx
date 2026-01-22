import type {RouteProp} from '@react-navigation/native';
import {useNavigationState} from '@react-navigation/native';
import type {StackCardInterpolationProps} from '@react-navigation/stack';
import React, {memo, useContext, useEffect, useRef, useState} from 'react';
import ComposeProviders from '@components/ComposeProviders';
import OpenConfirmNavigateExpensifyClassicModal from '@components/ConfirmNavigateExpensifyClassicModal';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import DelegateNoAccessModalProvider from '@components/DelegateNoAccessModalProvider';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import {useInitialURLActions, useInitialURLState} from '@components/InitialURLContextProvider';
import LockedAccountModalProvider from '@components/LockedAccountModalProvider';
import OpenAppFailureModal from '@components/OpenAppFailureModal';
import OptionsListContextProvider from '@components/OptionListContextProvider';
import PriorityModeController from '@components/PriorityModeController';
import {SearchContextProvider} from '@components/Search/SearchContext';
import {useSearchRouterActions} from '@components/Search/SearchRouter/SearchRouterContext';
import SearchRouterModal from '@components/Search/SearchRouter/SearchRouterModal';
import SupportalPermissionDeniedModalProvider from '@components/SupportalPermissionDeniedModalProvider';
import {WideRHPContext} from '@components/WideRHPContextProvider';
import useArchivedReportsIdSet from '@hooks/useArchivedReportsIdSet';
import useAutoUpdateTimezone from '@hooks/useAutoUpdateTimezone';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnboardingFlowRouter from '@hooks/useOnboardingFlow';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {SidebarOrderedReportsContextProvider} from '@hooks/useSidebarOrderedReports';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import {connect} from '@libs/actions/Delegate';
import setFullscreenVisibility from '@libs/actions/setFullscreenVisibility';
import {init, isClientTheLeader} from '@libs/ActiveClientManager';
import {READ_COMMANDS} from '@libs/API/types';
import HttpUtils from '@libs/HttpUtils';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import Log from '@libs/Log';
import NavBarManager from '@libs/NavBarManager';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import Navigation, {getDeepestFocusedScreenName, isTwoFactorSetupScreen} from '@libs/Navigation/Navigation';
import Animations, {InternalPlatformAnimations} from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import NetworkConnection from '@libs/NetworkConnection';
import Pusher from '@libs/Pusher';
import PusherConnectionManager from '@libs/PusherConnectionManager';
import {getReportIDFromLink} from '@libs/ReportUtils';
import * as SessionUtils from '@libs/SessionUtils';
import {getSearchParamFromUrl} from '@libs/Url';
import ConnectionCompletePage from '@pages/ConnectionCompletePage';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import RequireTwoFactorAuthenticationPage from '@pages/RequireTwoFactorAuthenticationPage';
import WorkspacesListPage from '@pages/workspace/WorkspacesListPage';
import * as App from '@userActions/App';
import * as Download from '@userActions/Download';
import * as Modal from '@userActions/Modal';
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
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';
import attachmentModalScreenOptions from './attachmentModalScreenOptions';
import createRootStackNavigator from './createRootStackNavigator';
import {screensWithEnteringAnimation, workspaceOrDomainSplitsWithoutEnteringAnimation} from './createRootStackNavigator/GetStateForActionHandlers';
import defaultScreenOptions from './defaultScreenOptions';
import {ShareModalStackNavigator} from './ModalStackNavigators';
import ExplanationModalNavigator from './Navigators/ExplanationModalNavigator';
import FeatureTrainingModalNavigator from './Navigators/FeatureTrainingModalNavigator';
import MigratedUserWelcomeModalNavigator from './Navigators/MigratedUserWelcomeModalNavigator';
import OnboardingModalNavigator from './Navigators/OnboardingModalNavigator';
import RightModalNavigator from './Navigators/RightModalNavigator';
import TestDriveModalNavigator from './Navigators/TestDriveModalNavigator';
import TestToolsModalNavigator from './Navigators/TestToolsModalNavigator';
import TestDriveDemoNavigator from './TestDriveDemoNavigator';
import useModalCardStyleInterpolator from './useModalCardStyleInterpolator';
import useRootNavigatorScreenOptions from './useRootNavigatorScreenOptions';

const loadAttachmentModalScreen = () => require<ReactComponentModule>('../../../pages/media/AttachmentModalScreen').default;
const loadValidateLoginPage = () => require<ReactComponentModule>('../../../pages/ValidateLoginPage').default;
const loadLogOutPreviousUserPage = () => require<ReactComponentModule>('../../../pages/LogOutPreviousUserPage').default;
const loadConciergePage = () => require<ReactComponentModule>('../../../pages/ConciergePage').default;
const loadTrackExpensePage = () => require<ReactComponentModule>('../../../pages/TrackExpensePage').default;
const loadSubmitExpensePage = () => require<ReactComponentModule>('../../../pages/SubmitExpensePage').default;
const loadWorkspaceJoinUser = () => require<ReactComponentModule>('@pages/workspace/WorkspaceJoinUserPage').default;

const loadReportSplitNavigator = () => require<ReactComponentModule>('./Navigators/ReportsSplitNavigator').default;
const loadSettingsSplitNavigator = () => require<ReactComponentModule>('./Navigators/SettingsSplitNavigator').default;
const loadWorkspaceSplitNavigator = () => require<ReactComponentModule>('./Navigators/WorkspaceSplitNavigator').default;
const loadDomainSplitNavigator = () => require<ReactComponentModule>('./Navigators/DomainSplitNavigator').default;
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

function AuthScreens() {
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const rootNavigatorScreenOptions = useRootNavigatorScreenOptions();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {toggleSearch} = useSearchRouterActions();
    const currentUrl = getCurrentUrl();
    const delegatorEmail = getSearchParamFromUrl(currentUrl, 'delegatorEmail');
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS, {canBeMissing: true});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {
        canBeMissing: true,
    });
    const {isOnboardingCompleted, shouldShowRequire2FAPage} = useOnboardingFlowRouter();
    const {initialURL, isAuthenticatedAtStartup} = useInitialURLState();
    const {setIsAuthenticatedAtStartup} = useInitialURLActions();
    const modalCardStyleInterpolator = useModalCardStyleInterpolator();
    const archivedReportsIdSet = useArchivedReportsIdSet();
    const {shouldRenderSecondaryOverlayForWideRHP, shouldRenderSecondaryOverlayForRHPOnWideRHP, shouldRenderSecondaryOverlayForRHPOnSuperWideRHP, shouldRenderTertiaryOverlay} =
        useContext(WideRHPContext);

    // Check if the user is currently on a 2FA setup screen
    // We can't rely on useRoute in this component because we're not a child of a Navigator, so we must sift through nav state by hand
    const isIn2FASetupFlow = useNavigationState((state) => {
        const focusedScreenName = getDeepestFocusedScreenName(state);
        return isTwoFactorSetupScreen(focusedScreenName);
    });

    // State to track whether the delegator's authentication is completed before displaying data
    const [isDelegatorFromOldDotIsReady, setIsDelegatorFromOldDotIsReady] = useState(false);

    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [initialLastUpdateIDAppliedToClient] = useOnyx(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, {canBeMissing: true});
    const [modal] = useOnyx(ONYXKEYS.MODAL, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});

    const [lastUpdateIDAppliedToClient] = useOnyx(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, {canBeMissing: true});
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const lastUpdateIDAppliedToClientRef = useRef(lastUpdateIDAppliedToClient);
    const isLoadingAppRef = useRef(isLoadingApp);
    lastUpdateIDAppliedToClientRef.current = lastUpdateIDAppliedToClient;
    isLoadingAppRef.current = isLoadingApp;

    const handleNetworkReconnect = () => {
        if (isLoadingAppRef.current) {
            App.openApp();
        } else {
            Log.info('[handleNetworkReconnect] Sending ReconnectApp');
            App.reconnectApp(lastUpdateIDAppliedToClientRef.current);
        }
    };

    useEffect(() => {
        if (!Navigation.isActiveRoute(ROUTES.SIGN_IN_MODAL)) {
            return;
        }
        // This means sign in in RHP was successful, so we can subscribe to user events
        initializePusher();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

    useAutoUpdateTimezone();

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
        const markAllMessagesAsReadShortcutConfig = CONST.KEYBOARD_SHORTCUTS.MARK_ALL_MESSAGES_AS_READ;
        const isLoggingInAsNewUser = !!session?.email && SessionUtils.isLoggingInAsNewUser(currentUrl, session.email);
        // Sign out the current user if we're transitioning with a different user
        const isTransitioning = currentUrl.includes(ROUTES.TRANSITION_BETWEEN_APPS);
        const isSupportalTransition = currentUrl.includes('authTokenType=support');
        if (isLoggingInAsNewUser && isTransitioning) {
            Session.signOutAndRedirectToSignIn(false, isSupportalTransition);
            return;
        }

        NetworkConnection.listenForReconnect();
        NetworkConnection.onReconnect(() => handleNetworkReconnect());
        PusherConnectionManager.init();
        initializePusher();
        // Sometimes when we transition from old dot to new dot, the client is not the leader
        // so we need to initialize the client again
        if (!isClientTheLeader() && isTransitioning) {
            init();
        }

        // If we are on this screen then we are "logged in", but the user might not have "just logged in". They could be reopening the app
        // or returning from background. If so, we'll assume they have some app data already and we can call reconnectApp() instead of openApp() and connect() for delegator from OldDot.
        if (SessionUtils.didUserLogInDuringSession() || delegatorEmail) {
            if (delegatorEmail) {
                connect({
                    email: delegatorEmail,
                    delegatedAccess: account?.delegatedAccess,
                    credentials,
                    session,
                    activePolicyID,
                    isFromOldDot: true,
                })
                    ?.then((success) => {
                        App.setAppLoading(!!success);
                    })
                    .finally(() => {
                        setIsDelegatorFromOldDotIsReady(true);
                    });
            } else {
                const reportID = getReportIDFromLink(initialURL ?? null);
                if (reportID && !isAuthenticatedAtStartup) {
                    Report.openReport(reportID);
                    // Don't want to call `openReport` again when logging out and then logging in
                    setIsAuthenticatedAtStartup(true);
                }
                App.openApp();
            }
        } else {
            Log.info('[AuthScreens] Sending ReconnectApp');
            App.reconnectApp(initialLastUpdateIDAppliedToClient);
        }

        App.setUpPoliciesAndNavigate(session, introSelected, activePolicyID);

        Download.clearDownloads();

        // Listen to keyboard shortcuts for opening certain pages
        const unsubscribeShortcutsOverviewShortcut = KeyboardShortcut.subscribe(
            shortcutsOverviewShortcutConfig.shortcutKey,
            () => {
                Modal.close(() => {
                    if (Navigation.isOnboardingFlow() || shouldShowRequire2FAPage) {
                        return;
                    }

                    if (Navigation.isActiveRoute(ROUTES.KEYBOARD_SHORTCUTS.getRoute(Navigation.getActiveRoute()))) {
                        return;
                    }
                    return Navigation.navigate(ROUTES.KEYBOARD_SHORTCUTS.getRoute(Navigation.getActiveRoute()));
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
                    if (Navigation.isOnboardingFlow() || shouldShowRequire2FAPage) {
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
                if (Navigation.isOnboardingFlow() || shouldShowRequire2FAPage) {
                    return;
                }
                Session.callFunctionIfActionIsAllowed(() => Modal.close(() => Navigation.navigate(ROUTES.NEW)))();
            },
            chatShortcutConfig.descriptionKey,
            chatShortcutConfig.modifiers,
            true,
        );

        const unsubscribeMarkAllMessagesAsReadShortcut = KeyboardShortcut.subscribe(
            markAllMessagesAsReadShortcutConfig.shortcutKey,
            () => Report.markAllMessagesAsRead(archivedReportsIdSet),
            markAllMessagesAsReadShortcutConfig.descriptionKey,
            markAllMessagesAsReadShortcutConfig.modifiers,
            true,
        );

        return () => {
            unsubscribeShortcutsOverviewShortcut();
            unsubscribeSearchShortcut();
            unsubscribeChatShortcut();
            unsubscribeMarkAllMessagesAsReadShortcut();
            Session.cleanupSession();
        };

        // Rule disabled because this effect is only for component did mount & will component unmount lifecycle event
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const shortcutConfig = CONST.KEYBOARD_SHORTCUTS.ESCAPE;
        const unsubscribeEscapeKey = KeyboardShortcut.subscribe(
            shortcutConfig.shortcutKey,
            () => {
                if (modal?.willAlertModalBecomeVisible) {
                    return;
                }

                if (modal?.disableDismissOnEscape) {
                    return;
                }

                if (shouldRenderSecondaryOverlayForWideRHP) {
                    Navigation.closeRHPFlow();
                    return;
                }

                if (shouldRenderSecondaryOverlayForRHPOnSuperWideRHP) {
                    Navigation.dismissToSuperWideRHP();
                    return;
                }

                if (shouldRenderSecondaryOverlayForRHPOnWideRHP || shouldRenderTertiaryOverlay) {
                    Navigation.dismissToPreviousRHP();
                    return;
                }

                Navigation.dismissModal();
            },
            shortcutConfig.descriptionKey,
            shortcutConfig.modifiers,
            true,
            true,
        );
        return () => unsubscribeEscapeKey();
    }, [
        modal?.disableDismissOnEscape,
        modal?.willAlertModalBecomeVisible,
        shouldRenderSecondaryOverlayForWideRHP,
        shouldRenderSecondaryOverlayForRHPOnWideRHP,
        shouldRenderSecondaryOverlayForRHPOnSuperWideRHP,
        shouldRenderTertiaryOverlay,
    ]);

    // Animation is disabled when navigating to the sidebar screen
    const getWorkspaceOrDomainSplitNavigatorOptions = ({route}: {route: RouteProp<AuthScreensParamList>}) => {
        // We don't need to do anything special for the wide screen.
        if (!shouldUseNarrowLayout) {
            return rootNavigatorScreenOptions.splitNavigator;
        }

        // On the narrow screen, we want to animate this navigator if it is opened from the settings split.
        // If it is opened from other tab, we don't want to animate it on the entry.
        // There is a hook inside the workspace navigator that changes animation to SLIDE_FROM_RIGHT after entering.
        // This way it can be animated properly when going back to the settings split.
        const animationEnabled = !workspaceOrDomainSplitsWithoutEnteringAnimation.has(route.key);

        return {
            ...rootNavigatorScreenOptions.splitNavigator,
            animation: animationEnabled ? Animations.SLIDE_FROM_RIGHT : Animations.NONE,
            gestureEnabled: true,
            web: {
                ...rootNavigatorScreenOptions.splitNavigator.web,
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props, isFullScreenModal: true, animationEnabled}),
            },
        };
    };

    // Animation is enabled when navigating to any screen different than split sidebar screen
    const getFullscreenNavigatorOptions = ({route}: {route: RouteProp<AuthScreensParamList>}) => {
        // We don't need to do anything special for the wide screen.
        if (!shouldUseNarrowLayout) {
            return rootNavigatorScreenOptions.splitNavigator;
        }

        // On the narrow screen, we want to animate this navigator if pushed SplitNavigator includes desired screen
        const animationEnabled = screensWithEnteringAnimation.has(route.key);
        return {
            ...rootNavigatorScreenOptions.splitNavigator,
            animation: animationEnabled ? Animations.SLIDE_FROM_RIGHT : Animations.NONE,
            web: {
                ...rootNavigatorScreenOptions.splitNavigator.web,
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props, isFullScreenModal: true, animationEnabled}),
            },
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
        const subMillisecondsTime = clearAfterTime.getTime() - currentTime.getTime();
        if (subMillisecondsTime > 0) {
            let intervalId: NodeJS.Timeout | null = null;
            let timeoutId: NodeJS.Timeout | null = null;

            if (subMillisecondsTime > CONST.LIMIT_TIMEOUT) {
                intervalId = setInterval(() => {
                    const now = new Date();
                    const remainingTime = clearAfterTime.getTime() - now.getTime();

                    if (remainingTime <= 0) {
                        clearStatus();
                        if (intervalId) {
                            clearInterval(intervalId);
                        }
                    } else if (remainingTime <= CONST.LIMIT_TIMEOUT) {
                        if (intervalId) {
                            clearInterval(intervalId);
                        }
                        timeoutId = setTimeout(() => {
                            clearStatus();
                        }, remainingTime);
                    }
                }, CONST.LIMIT_TIMEOUT);
            } else {
                timeoutId = setTimeout(() => {
                    clearStatus();
                }, subMillisecondsTime);
            }

            return () => {
                if (intervalId) {
                    clearInterval(intervalId);
                }
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            };
        }

        clearStatus();
    }, [currentUserPersonalDetails.status?.clearAfter]);

    if (delegatorEmail && !isDelegatorFromOldDotIsReady) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ComposeProviders
            components={[
                CurrencyListContextProvider,
                OptionsListContextProvider,
                SidebarOrderedReportsContextProvider,
                SearchContextProvider,
                LockedAccountModalProvider,
                DelegateNoAccessModalProvider,
                SupportalPermissionDeniedModalProvider,
            ]}
        >
            <RootStack.Navigator
                persistentScreens={[
                    NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                    NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
                    NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                    NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR,
                    NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
                    NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
                    SCREENS.WORKSPACES_LIST,
                    SCREENS.SEARCH.ROOT,
                ]}
            >
                {/* This has to be the first navigator in auth screens. */}
                <RootStack.Screen
                    name={NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}
                    options={getFullscreenNavigatorOptions}
                    getComponent={loadReportSplitNavigator}
                />
                <RootStack.Screen
                    name={NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR}
                    options={getFullscreenNavigatorOptions}
                    getComponent={loadSettingsSplitNavigator}
                />
                <RootStack.Screen
                    name={NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}
                    options={getFullscreenNavigatorOptions}
                    getComponent={loadSearchNavigator}
                />
                <RootStack.Screen
                    name={NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR}
                    options={getWorkspaceOrDomainSplitNavigatorOptions}
                    getComponent={loadWorkspaceSplitNavigator}
                />
                <RootStack.Screen
                    name={NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR}
                    options={getWorkspaceOrDomainSplitNavigatorOptions}
                    getComponent={loadDomainSplitNavigator}
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
                    name={SCREENS.WORKSPACES_LIST}
                    options={rootNavigatorScreenOptions.workspacesListPage}
                    component={WorkspacesListPage}
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
                    name={SCREENS.REPORT_ATTACHMENTS}
                    options={attachmentModalScreenOptions}
                    getComponent={loadAttachmentModalScreen}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name={SCREENS.REPORT_ADD_ATTACHMENT}
                    options={attachmentModalScreenOptions}
                    getComponent={loadAttachmentModalScreen}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name={SCREENS.REPORT_AVATAR}
                    options={attachmentModalScreenOptions}
                    getComponent={loadAttachmentModalScreen}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name={SCREENS.PROFILE_AVATAR}
                    options={attachmentModalScreenOptions}
                    getComponent={loadAttachmentModalScreen}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name={SCREENS.WORKSPACE_AVATAR}
                    options={attachmentModalScreenOptions}
                    getComponent={loadAttachmentModalScreen}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name={SCREENS.TRANSACTION_RECEIPT}
                    options={attachmentModalScreenOptions}
                    getComponent={loadAttachmentModalScreen}
                    listeners={modalScreenListeners}
                />
                <RootStack.Screen
                    name={SCREENS.MONEY_REQUEST.RECEIPT_PREVIEW}
                    options={attachmentModalScreenOptions}
                    getComponent={loadAttachmentModalScreen}
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
                    listeners={modalScreenListenersWithCancelSearch}
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
                    name={NAVIGATORS.TEST_DRIVE_MODAL_NAVIGATOR}
                    options={rootNavigatorScreenOptions.basicModalNavigator}
                    component={TestDriveModalNavigator}
                />
                <RootStack.Screen
                    name={NAVIGATORS.TEST_DRIVE_DEMO_NAVIGATOR}
                    options={rootNavigatorScreenOptions.basicModalNavigator}
                    component={TestDriveDemoNavigator}
                />
                <RootStack.Screen
                    name={NAVIGATORS.FEATURE_TRAINING_MODAL_NAVIGATOR}
                    options={rootNavigatorScreenOptions.basicModalNavigator}
                    component={FeatureTrainingModalNavigator}
                    listeners={modalScreenListeners}
                />
                {isOnboardingCompleted === false && !Navigation.isValidateLoginFlow() && (
                    <RootStack.Screen
                        name={NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR}
                        options={{...rootNavigatorScreenOptions.basicModalNavigator, gestureEnabled: false}}
                        component={OnboardingModalNavigator}
                        listeners={{
                            focus: () => {
                                Modal.setDisableDismissOnEscape(true);
                            },
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
                    name={SCREENS.CONNECTION_COMPLETE}
                    options={rootNavigatorScreenOptions.fullScreen}
                    component={ConnectionCompletePage}
                />
                <RootStack.Screen
                    name={SCREENS.BANK_CONNECTION_COMPLETE}
                    options={rootNavigatorScreenOptions.fullScreen}
                    component={ConnectionCompletePage}
                />
                <RootStack.Screen
                    name={NAVIGATORS.TEST_TOOLS_MODAL_NAVIGATOR}
                    options={{
                        ...rootNavigatorScreenOptions.basicModalNavigator,
                        native: {
                            contentStyle: {
                                ...StyleUtils.getBackgroundColorWithOpacityStyle(theme.overlay, 0.72),
                            },
                            animation: InternalPlatformAnimations.FADE,
                        },
                        web: {
                            cardStyle: {
                                ...StyleUtils.getBackgroundColorWithOpacityStyle(theme.overlay, 0.72),
                            },
                            animation: InternalPlatformAnimations.FADE,
                        },
                    }}
                    component={TestToolsModalNavigator}
                    listeners={modalScreenListeners}
                />
            </RootStack.Navigator>
            {/* Full-screen 2FA enforcement overlay - blocks all interaction until 2FA is set up */}
            {shouldShowRequire2FAPage && !isIn2FASetupFlow && <RequireTwoFactorAuthenticationPage />}
            <SearchRouterModal />
            <OpenAppFailureModal />
            <PriorityModeController />
            <OpenConfirmNavigateExpensifyClassicModal />
        </ComposeProviders>
    );
}

const AuthScreensMemoized = memo(AuthScreens, () => true);

export default AuthScreensMemoized;
