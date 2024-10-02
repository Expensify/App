import React, {memo, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Onyx, {withOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ActiveGuidesEventListener from '@components/ActiveGuidesEventListener';
import ComposeProviders from '@components/ComposeProviders';
import OptionsListContextProvider from '@components/OptionListContextProvider';
import {SearchContextProvider} from '@components/Search/SearchContext';
import SearchRouterModal from '@components/Search/SearchRouter/SearchRouterModal';
import {useSearchRouterContext} from '@components/Search/SearchRouter/SearchRouterContext';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useOnboardingFlowRouter from '@hooks/useOnboardingFlow';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Welcome from '@libs/actions/Welcome';
import {READ_COMMANDS} from '@libs/API/types';
import HttpUtils from '@libs/HttpUtils';
import KeyboardShortcut from '@libs/KeyboardShortcut';
import Log from '@libs/Log';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import getOnboardingModalScreenOptions from '@libs/Navigation/getOnboardingModalScreenOptions';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList, CentralPaneName, CentralPaneScreensParamList} from '@libs/Navigation/types';
import NetworkConnection from '@libs/NetworkConnection';
import onyxSubscribe from '@libs/onyxSubscribe';
import * as Pusher from '@libs/Pusher/pusher';
import PusherConnectionManager from '@libs/PusherConnectionManager';
import * as ReportUtils from '@libs/ReportUtils';
import {buildSearchQueryString} from '@libs/SearchUtils';
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
import Timing from '@userActions/Timing';
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
import createCustomStackNavigator from './createCustomStackNavigator';
import defaultScreenOptions from './defaultScreenOptions';
import getRootNavigatorScreenOptions from './getRootNavigatorScreenOptions';
import BottomTabNavigator from './Navigators/BottomTabNavigator';
import ExplanationModalNavigator from './Navigators/ExplanationModalNavigator';
import FeatureTrainingModalNavigator from './Navigators/FeatureTrainingModalNavigator';
import FullScreenNavigator from './Navigators/FullScreenNavigator';
import LeftModalNavigator from './Navigators/LeftModalNavigator';
import OnboardingModalNavigator from './Navigators/OnboardingModalNavigator';
import RightModalNavigator from './Navigators/RightModalNavigator';
import WelcomeVideoModalNavigator from './Navigators/WelcomeVideoModalNavigator';

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

function shouldOpenOnAdminRoom() {
    const url = getCurrentUrl();
    return url ? new URL(url).searchParams.get('openOnAdminRoom') === 'true' : false;
}

function getCentralPaneScreenInitialParams(screenName: CentralPaneName, initialReportID?: string): Partial<ValueOf<CentralPaneScreensParamList>> {
    if (screenName === SCREENS.SEARCH.CENTRAL_PANE) {
        // Generate default query string with buildSearchQueryString without argument.
        return {q: buildSearchQueryString()};
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
        if (!value || timezone) {
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

const RootStack = createCustomStackNavigator<AuthScreensParamList>();
// We want to delay the re-rendering for components(e.g. ReportActionCompose)
// that depends on modal visibility until Modal is completely closed and its focused
// When modal screen is focused, update modal visibility in Onyx
// https://reactnavigation.org/docs/navigation-events/

const modalScreenListeners = {
    focus: () => {
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
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout, onboardingIsMediumOrLargerScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const screenOptions = getRootNavigatorScreenOptions(shouldUseNarrowLayout, styles, StyleUtils);
    const {canUseDefaultRooms} = usePermissions();
    const {activeWorkspaceID} = useActiveWorkspace();
    const {openSearchRouter} = useSearchRouterContext();

    const onboardingModalScreenOptions = useMemo(() => screenOptions.onboardingModalNavigator(onboardingIsMediumOrLargerScreenWidth), [screenOptions, onboardingIsMediumOrLargerScreenWidth]);
    const onboardingScreenOptions = useMemo(
        () => getOnboardingModalScreenOptions(shouldUseNarrowLayout, styles, StyleUtils, onboardingIsMediumOrLargerScreenWidth),
        [StyleUtils, shouldUseNarrowLayout, onboardingIsMediumOrLargerScreenWidth, styles],
    );
    const modal = useRef<OnyxTypes.Modal>({});
    const [didPusherInit, setDidPusherInit] = useState(false);
    const {isOnboardingCompleted} = useOnboardingFlowRouter();

    let initialReportID: string | undefined;
    const isInitialRender = useRef(true);
    if (isInitialRender.current) {
        Timing.start(CONST.TIMING.HOMEPAGE_INITIAL_RENDER);

        const currentURL = getCurrentUrl();
        if (currentURL) {
            initialReportID = new URL(currentURL).pathname.match(CONST.REGEX.REPORT_ID_FROM_PATH)?.at(1);
        }

        if (!initialReportID) {
            const initialReport = ReportUtils.findLastAccessedReport(!canUseDefaultRooms, shouldOpenOnAdminRoom(), activeWorkspaceID);
            initialReportID = initialReport?.reportID ?? '';
        }

        isInitialRender.current = false;
    }

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

        let signupQualifier;
        if (currentUrl.includes(CONST.QUALIFIER_PARAM)) {
            signupQualifier = new URL(currentUrl).searchParams.get(CONST.QUALIFIER_PARAM);

            if (signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.INDIVIDUAL) {
                Welcome.setOnboardingCustomChoices([CONST.ONBOARDING_CHOICES.PERSONAL_SPEND, CONST.ONBOARDING_CHOICES.EMPLOYER, CONST.ONBOARDING_CHOICES.CHAT_SPLIT]);
            }
            if (signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB) {
                Welcome.setOnboardingPurposeSelected(CONST.ONBOARDING_CHOICES.MANAGE_TEAM);
            }
        }

        NetworkConnection.listenForReconnect();
        NetworkConnection.onReconnect(handleNetworkReconnect);
        PusherConnectionManager.init();
        initializePusher().then(() => {
            setDidPusherInit(true);
        });

        // If we are on this screen then we are "logged in", but the user might not have "just logged in". They could be reopening the app
        // or returning from background. If so, we'll assume they have some app data already and we can call reconnectApp() instead of openApp().
        if (SessionUtils.didUserLogInDuringSession()) {
            App.openApp();
        } else {
            Log.info('[AuthScreens] Sending ReconnectApp');
            App.reconnectApp(initialLastUpdateIDAppliedToClient);
        }

        PriorityMode.autoSwitchToFocusMode();

        App.setUpPoliciesAndNavigate(session);

        App.redirectThirdPartyDesktopSignIn();

        if (lastOpenedPublicRoomID) {
            // Re-open the last opened public room if the user logged in from a public room link
            Report.openLastOpenedPublicRoom(lastOpenedPublicRoomID);
        }
        Download.clearDownloads();

        Timing.end(CONST.TIMING.HOMEPAGE_INITIAL_RENDER);

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
                Modal.close(
                    Session.checkIfActionIsAllowed(() => {
                        openSearchRouter();
                    }),
                    true,
                    true,
                );
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
            () => {
                toggleTestToolsModal();
            },
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

    const CentralPaneScreenOptions = {
        headerShown: false,
        title: 'New Expensify',

        // Prevent unnecessary scrolling
        cardStyle: styles.cardStyleNavigator,
    };

    return (
        <ComposeProviders components={[OptionsListContextProvider, SearchContextProvider]}>
            <View style={styles.rootNavigatorContainerStyles(shouldUseNarrowLayout)}>
                <RootStack.Navigator
                    screenOptions={screenOptions.centralPaneNavigator}
                    isSmallScreenWidth={isSmallScreenWidth}
                >
                    <RootStack.Screen
                        name={NAVIGATORS.BOTTOM_TAB_NAVIGATOR}
                        options={screenOptions.bottomTab}
                        component={BottomTabNavigator}
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
                            presentation: 'transparentModal',
                        }}
                        getComponent={loadReportAttachments}
                        listeners={modalScreenListeners}
                    />
                    <RootStack.Screen
                        name={SCREENS.PROFILE_AVATAR}
                        options={{
                            headerShown: false,
                            presentation: 'transparentModal',
                        }}
                        getComponent={loadProfileAvatar}
                        listeners={modalScreenListeners}
                    />
                    <RootStack.Screen
                        name={SCREENS.WORKSPACE_AVATAR}
                        options={{
                            headerShown: false,
                            presentation: 'transparentModal',
                        }}
                        getComponent={loadWorkspaceAvatar}
                        listeners={modalScreenListeners}
                    />
                    <RootStack.Screen
                        name={SCREENS.REPORT_AVATAR}
                        options={{
                            headerShown: false,
                            presentation: 'transparentModal',
                        }}
                        getComponent={loadReportAvatar}
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
                        listeners={modalScreenListenersWithCancelSearch}
                    />
                    <RootStack.Screen
                        name={NAVIGATORS.FULL_SCREEN_NAVIGATOR}
                        options={screenOptions.fullScreen}
                        component={FullScreenNavigator}
                    />
                    <RootStack.Screen
                        name={NAVIGATORS.LEFT_MODAL_NAVIGATOR}
                        options={screenOptions.leftModalNavigator}
                        component={LeftModalNavigator}
                        listeners={modalScreenListeners}
                    />
                    <RootStack.Screen
                        name={SCREENS.DESKTOP_SIGN_IN_REDIRECT}
                        options={screenOptions.fullScreen}
                        component={DesktopSignInRedirectPage}
                    />
                    <RootStack.Screen
                        name={NAVIGATORS.EXPLANATION_MODAL_NAVIGATOR}
                        options={onboardingModalScreenOptions}
                        component={ExplanationModalNavigator}
                    />
                    <RootStack.Screen
                        name={NAVIGATORS.FEATURE_TRANING_MODAL_NAVIGATOR}
                        options={onboardingModalScreenOptions}
                        component={FeatureTrainingModalNavigator}
                        listeners={modalScreenListeners}
                    />
                    <RootStack.Screen
                        name={NAVIGATORS.WELCOME_VIDEO_MODAL_NAVIGATOR}
                        options={onboardingModalScreenOptions}
                        component={WelcomeVideoModalNavigator}
                    />
                    {isOnboardingCompleted === false && (
                        <RootStack.Screen
                            name={NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR}
                            options={onboardingScreenOptions}
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
                            presentation: 'transparentModal',
                        }}
                        listeners={modalScreenListeners}
                        getComponent={loadWorkspaceJoinUser}
                    />
                    <RootStack.Screen
                        name={SCREENS.TRANSACTION_RECEIPT}
                        options={{
                            headerShown: false,
                            presentation: 'transparentModal',
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
                <SearchRouterModal />
            </View>
            {didPusherInit && <ActiveGuidesEventListener />}
        </ComposeProviders>
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
    initialLastUpdateIDAppliedToClient: {
        key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    },
})(AuthScreensMemoized);
