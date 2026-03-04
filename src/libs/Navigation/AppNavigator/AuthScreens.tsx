import type {RouteProp} from '@react-navigation/native';
import {useNavigationState} from '@react-navigation/native';
import type {StackCardInterpolationProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import ComposeProviders from '@components/ComposeProviders';
import OpenConfirmNavigateExpensifyClassicModal from '@components/ConfirmNavigateExpensifyClassicModal';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import DelegateNoAccessModalProvider from '@components/DelegateNoAccessModalProvider';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import GPSInProgressModal from '@components/GPSInProgressModal';
import GPSTripStateChecker from '@components/GPSTripStateChecker';
import LockedAccountModalProvider from '@components/LockedAccountModalProvider';
import OpenAppFailureModal from '@components/OpenAppFailureModal';
import OptionsListContextProvider from '@components/OptionListContextProvider';
import PriorityModeController from '@components/PriorityModeController';
import {SearchContextProvider} from '@components/Search/SearchContext';
import SearchRouterModal from '@components/Search/SearchRouter/SearchRouterModal';
import SupportalPermissionDeniedModalProvider from '@components/SupportalPermissionDeniedModalProvider';
import useOnboardingFlowRouter from '@hooks/useOnboardingFlow';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {SidebarOrderedReportsContextProvider} from '@hooks/useSidebarOrderedReports';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import setFullscreenVisibility from '@libs/actions/setFullscreenVisibility';
import {READ_COMMANDS} from '@libs/API/types';
import HttpUtils from '@libs/HttpUtils';
import NavBarManager from '@libs/NavBarManager';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import Navigation, {getDeepestFocusedScreenName, isTwoFactorSetupScreen} from '@libs/Navigation/Navigation';
import Animations, {InternalPlatformAnimations} from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import {getSearchParamFromUrl} from '@libs/Url';
import ConnectionCompletePage from '@pages/ConnectionCompletePage';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import RequireTwoFactorAuthenticationPage from '@pages/RequireTwoFactorAuthenticationPage';
import WorkspacesListPage from '@pages/workspace/WorkspacesListPage';
import * as Modal from '@userActions/Modal';
import CONST from '@src/CONST';
import '@src/libs/subscribeToFullReconnect';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';
import attachmentModalScreenOptions from './attachmentModalScreenOptions';
import AuthScreensInitHandler from './AuthScreensInitHandler';
import createRootStackNavigator from './createRootStackNavigator';
import {screensWithEnteringAnimation, workspaceOrDomainSplitsWithoutEnteringAnimation} from './createRootStackNavigator/GetStateForActionHandlers';
import defaultScreenOptions from './defaultScreenOptions';
import KeyboardShortcutsHandler from './KeyboardShortcutsHandler';
import {ShareModalStackNavigator} from './ModalStackNavigators';
import ExplanationModalNavigator from './Navigators/ExplanationModalNavigator';
import FeatureTrainingModalNavigator from './Navigators/FeatureTrainingModalNavigator';
import MigratedUserWelcomeModalNavigator from './Navigators/MigratedUserWelcomeModalNavigator';
import OnboardingModalNavigator from './Navigators/OnboardingModalNavigator';
import RightModalNavigator from './Navigators/RightModalNavigator';
import TestDriveModalNavigator from './Navigators/TestDriveModalNavigator';
import TestToolsModalNavigator from './Navigators/TestToolsModalNavigator';
import TestDriveDemoNavigator from './TestDriveDemoNavigator';
import ThreeDSAuthHandler from './ThreeDSAuthHandler';
import useModalCardStyleInterpolator from './useModalCardStyleInterpolator';
import useRootNavigatorScreenOptions from './useRootNavigatorScreenOptions';
import UserStatusHandler from './UserStatusHandler';

const loadAttachmentModalScreen = () => require<ReactComponentModule>('../../../pages/media/AttachmentModalScreen').default;
const loadValidateLoginPage = () => require<ReactComponentModule>('../../../pages/ValidateLoginPage').default;
const loadLogOutPreviousUserPage = () => require<ReactComponentModule>('../../../pages/LogOutPreviousUserPage').default;
const loadConciergePage = () => require<ReactComponentModule>('../../../pages/ConciergePage').default;
const loadTrackExpensePage = () => require<ReactComponentModule>('../../../pages/TrackExpensePage').default;
const loadSubmitExpensePage = () => require<ReactComponentModule>('../../../pages/SubmitExpensePage').default;
const loadHomePage = () => require<ReactComponentModule>('../../../pages/home/HomePage').default;
const loadWorkspaceJoinUser = () => require<ReactComponentModule>('@pages/workspace/WorkspaceJoinUserPage').default;

const loadReportSplitNavigator = () => require<ReactComponentModule>('./Navigators/ReportsSplitNavigator').default;
const loadSettingsSplitNavigator = () => require<ReactComponentModule>('./Navigators/SettingsSplitNavigator').default;
const loadWorkspaceSplitNavigator = () => require<ReactComponentModule>('./Navigators/WorkspaceSplitNavigator').default;
const loadDomainSplitNavigator = () => require<ReactComponentModule>('./Navigators/DomainSplitNavigator').default;
const loadSearchNavigator = () => require<ReactComponentModule>('./Navigators/SearchFullscreenNavigator').default;

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
    const modalCardStyleInterpolator = useModalCardStyleInterpolator();
    const currentUrl = getCurrentUrl();
    const delegatorEmail = getSearchParamFromUrl(currentUrl, 'delegatorEmail');
    const {isOnboardingCompleted, shouldShowRequire2FAPage} = useOnboardingFlowRouter();

    // Check if the user is currently on a 2FA setup screen
    // We can't rely on useRoute in this component because we're not a child of a Navigator, so we must sift through nav state by hand
    const isIn2FASetupFlow = useNavigationState((state) => {
        const focusedScreenName = getDeepestFocusedScreenName(state);
        return isTwoFactorSetupScreen(focusedScreenName);
    });

    // State to track whether the delegator's authentication is completed before displaying data
    const [isDelegatorFromOldDotIsReady, setIsDelegatorFromOldDotIsReady] = useState(false);

    useEffect(() => {
        NavBarManager.setButtonStyle(theme.navigationBarButtonsStyle);

        return () => {
            NavBarManager.setButtonStyle(CONST.NAVIGATION_BAR_BUTTONS_STYLE.LIGHT);
        };
    }, [theme]);

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

    if (delegatorEmail && !isDelegatorFromOldDotIsReady) {
        return (
            <>
                <AuthScreensInitHandler onDelegatorReady={() => setIsDelegatorFromOldDotIsReady(true)} />
                <KeyboardShortcutsHandler shouldShowRequire2FAPage={shouldShowRequire2FAPage} />
                <ThreeDSAuthHandler />
                <UserStatusHandler />
                <FullScreenLoadingIndicator />
            </>
        );
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
            <AuthScreensInitHandler onDelegatorReady={() => setIsDelegatorFromOldDotIsReady(true)} />
            <KeyboardShortcutsHandler shouldShowRequire2FAPage={shouldShowRequire2FAPage} />
            <ThreeDSAuthHandler />
            <UserStatusHandler />
            <RootStack.Navigator
                persistentScreens={[
                    NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                    NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
                    NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
                    NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR,
                    NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
                    NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
                    SCREENS.WORKSPACES_LIST,
                    SCREENS.HOME,
                    SCREENS.SEARCH.ROOT,
                ]}
            >
                {/* SCREENS.HOME has to be the first navigator in auth screens. */}
                <RootStack.Screen
                    name={SCREENS.HOME}
                    options={rootNavigatorScreenOptions.fullScreenTabPage}
                    getComponent={loadHomePage}
                />
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
                    options={rootNavigatorScreenOptions.fullScreenTabPage}
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
            <GPSTripStateChecker />
            <GPSInProgressModal />
            <OpenAppFailureModal />
            <PriorityModeController />
            <OpenConfirmNavigateExpensifyClassicModal />
        </ComposeProviders>
    );
}

export default AuthScreens;
