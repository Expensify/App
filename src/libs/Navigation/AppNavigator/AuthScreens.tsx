import type {RouteProp} from '@react-navigation/native';
import type {StackCardInterpolationProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import ComposeProviders from '@components/ComposeProviders';
import OpenConfirmNavigateExpensifyClassicModal from '@components/ConfirmNavigateExpensifyClassicModal';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import DelegateNoAccessModalProvider from '@components/DelegateNoAccessModalProvider';
import GPSInProgressModal from '@components/GPSInProgressModal';
import GPSTripStateChecker from '@components/GPSTripStateChecker';
import {KeyboardDismissibleFlatListContextProvider} from '@components/KeyboardDismissibleFlatList/KeyboardDismissibleFlatListContext';
import KYCWallContextProvider from '@components/KYCWall/KYCWallContext';
import LockedAccountModalProvider from '@components/LockedAccountModalProvider';
import OpenAppFailureModal from '@components/OpenAppFailureModal';
import OptionsListContextProvider from '@components/OptionListContextProvider';
import PriorityModeController from '@components/PriorityModeController';
import {ProductTrainingContextProvider} from '@components/ProductTrainingContext';
import {SearchContextProvider} from '@components/Search/SearchContext';
import {SearchRouterContextProvider} from '@components/Search/SearchRouter/SearchRouterContext';
import SearchRouterModal from '@components/Search/SearchRouter/SearchRouterModal';
import SupportalPermissionDeniedModal from '@components/SupportalPermissionDeniedModal';
import FullScreenContextProvider from '@components/VideoPlayerContexts/FullScreenContextProvider';
import {PlaybackContextProvider} from '@components/VideoPlayerContexts/PlaybackContext';
import {VideoPopoverMenuContextProvider} from '@components/VideoPlayerContexts/VideoPopoverMenuContext';
import {VolumeContextProvider} from '@components/VideoPlayerContexts/VolumeContext';
import WideRHPContextProvider from '@components/WideRHPContextProvider';
import useOnboardingFlowRouter from '@hooks/useOnboardingFlow';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {SidebarOrderedReportsContextProvider} from '@hooks/useSidebarOrderedReports';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import setFullscreenVisibility from '@libs/actions/setFullscreenVisibility';
import {READ_COMMANDS} from '@libs/API/types';
import HttpUtils from '@libs/HttpUtils';
import NavBarManager from '@libs/NavBarManager';
import Navigation from '@libs/Navigation/Navigation';
import Animations, {InternalPlatformAnimations} from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import ConnectionCompletePage from '@pages/ConnectionCompletePage';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import {AttachmentModalContextProvider} from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import RequireTwoFactorAuthenticationOverlay from '@pages/RequireTwoFactorAuthenticationOverlay';
import ExpensifyCardContextProvider from '@pages/settings/Wallet/ExpensifyCardPage/ExpensifyCardContextProvider';
import TravelCVVContextProvider from '@pages/settings/Wallet/TravelCVVPage/TravelCVVContextProvider';
import * as Modal from '@userActions/Modal';
import CONST from '@src/CONST';
import '@src/libs/subscribeToFullReconnect';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';
import attachmentModalScreenOptions from './attachmentModalScreenOptions';
import AuthScreensInitHandler from './AuthScreensInitHandler';
import createRootStackNavigator from './createRootStackNavigator';
import {screensWithEnteringAnimation} from './createRootStackNavigator/GetStateForActionHandlers';
import defaultScreenOptions from './defaultScreenOptions';
import DelegatorConnectGuard from './DelegatorConnectGate';
import hideKeyboardOnSwipe from './hideKeyboardOnSwipe';
import KeyboardShortcutsHandler from './KeyboardShortcutsHandler';
import {ShareModalStackNavigator} from './ModalStackNavigators';
import ExplanationModalNavigator from './Navigators/ExplanationModalNavigator';
import FeatureTrainingModalNavigator from './Navigators/FeatureTrainingModalNavigator';
import MigratedUserWelcomeModalNavigator from './Navigators/MigratedUserWelcomeModalNavigator';
import OnboardingModalNavigator from './Navigators/OnboardingModalNavigator';
import TestDriveModalNavigator from './Navigators/TestDriveModalNavigator';
import TestToolsModalNavigator from './Navigators/TestToolsModalNavigator';
import TestDriveDemoNavigator from './TestDriveDemoNavigator';
import ThreeDSAuthHandler from './ThreeDSAuthHandler';
import useModalCardStyleInterpolator from './useModalCardStyleInterpolator';
import useRootNavigatorScreenOptions from './useRootNavigatorScreenOptions';
import UserStatusHandler from './UserStatusHandler';

const loadTabNavigator = () => require<ReactComponentModule>('./Navigators/TabNavigator').default;

const loadAttachmentModalScreen = () => require<ReactComponentModule>('../../../pages/media/AttachmentModalScreen').default;
const loadValidateLoginPage = () => require<ReactComponentModule>('../../../pages/ValidateLoginPage').default;
const loadLogOutPreviousUserPage = () => require<ReactComponentModule>('../../../pages/LogOutPreviousUserPage').default;
const loadConciergePage = () => require<ReactComponentModule>('../../../pages/ConciergePage').default;
const loadTrackExpensePage = () => require<ReactComponentModule>('../../../pages/TrackExpensePage').default;
const loadSubmitExpensePage = () => require<ReactComponentModule>('../../../pages/SubmitExpensePage').default;
const loadWorkspaceJoinUser = () => require<ReactComponentModule>('@pages/workspace/WorkspaceJoinUserPage').default;

const loadSearchRouterPage = () => require<ReactComponentModule>('../../../components/Search/SearchRouter/SearchRouterPage').default;
const loadRightModalNavigator = () => require<ReactComponentModule>('./Navigators/RightModalNavigator').default;

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
    const {isOnboardingCompleted} = useOnboardingFlowRouter();

    useEffect(() => {
        NavBarManager.setButtonStyle(theme.navigationBarButtonsStyle);

        return () => {
            NavBarManager.setButtonStyle(CONST.NAVIGATION_BAR_BUTTONS_STYLE.LIGHT);
        };
    }, [theme]);

    // Dynamic options for TAB_NAVIGATOR: supports entering animation for pushed instances
    const getTabNavigatorOptions = ({route}: {route: RouteProp<AuthScreensParamList>}) => {
        if (!shouldUseNarrowLayout) {
            return rootNavigatorScreenOptions.fullScreenTabPage;
        }

        const animationEnabled = screensWithEnteringAnimation.has(route.key);
        return {
            ...rootNavigatorScreenOptions.fullScreenTabPage,
            animation: animationEnabled ? Animations.SLIDE_FROM_RIGHT : Animations.NONE,
            gestureEnabled: animationEnabled,
            web: {
                ...rootNavigatorScreenOptions.fullScreenTabPage.web,
                cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props, isFullScreenModal: true, animationEnabled}),
            },
        };
    };

    return (
        <>
            <AuthScreensInitHandler />
            <ThreeDSAuthHandler />
            <UserStatusHandler />
            <SupportalPermissionDeniedModal />
            <DelegatorConnectGuard>
                <ComposeProviders
                    components={[
                        AttachmentModalContextProvider,
                        PlaybackContextProvider,
                        VolumeContextProvider,
                        VideoPopoverMenuContextProvider,
                        FullScreenContextProvider,
                        SearchRouterContextProvider,
                        ProductTrainingContextProvider,
                        ExpensifyCardContextProvider,
                        TravelCVVContextProvider,
                        KYCWallContextProvider,
                        WideRHPContextProvider,
                        KeyboardDismissibleFlatListContextProvider,
                        CurrencyListContextProvider,
                        OptionsListContextProvider,
                        SidebarOrderedReportsContextProvider,
                        SearchContextProvider,
                        LockedAccountModalProvider,
                        DelegateNoAccessModalProvider,
                    ]}
                >
                    <KeyboardShortcutsHandler />
                    <RootStack.Navigator persistentScreens={[NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.RIGHT_MODAL_NAVIGATOR]}>
                        {/* TAB_NAVIGATOR (containing Home and Workspaces) has to be the first navigator in auth screens. */}
                        <RootStack.Screen
                            name={NAVIGATORS.TAB_NAVIGATOR}
                            options={getTabNavigatorOptions}
                            getComponent={loadTabNavigator}
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
                            name={SCREENS.MONEY_REQUEST.ODOMETER_PREVIEW}
                            options={attachmentModalScreenOptions}
                            getComponent={loadAttachmentModalScreen}
                            listeners={modalScreenListeners}
                        />
                        <RootStack.Screen
                            name={SCREENS.SEARCH_ROUTER.ROOT}
                            options={{
                                ...hideKeyboardOnSwipe,
                                animation: Animations.SLIDE_FROM_RIGHT,
                                headerShown: false,
                            }}
                            getComponent={loadSearchRouterPage}
                            listeners={modalScreenListenersWithCancelSearch}
                        />
                        <RootStack.Screen
                            name={SCREENS.NOT_FOUND}
                            options={rootNavigatorScreenOptions.fullScreen}
                            component={NotFoundPage}
                        />
                        <RootStack.Screen
                            name={NAVIGATORS.RIGHT_MODAL_NAVIGATOR}
                            options={rootNavigatorScreenOptions.rightModalNavigator}
                            getComponent={loadRightModalNavigator}
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
                    <RequireTwoFactorAuthenticationOverlay />
                    <SearchRouterModal />
                    <GPSTripStateChecker />
                    <GPSInProgressModal />
                    <OpenAppFailureModal />
                    <PriorityModeController />
                    <OpenConfirmNavigateExpensifyClassicModal />
                </ComposeProviders>
            </DelegatorConnectGuard>
        </>
    );
}

export default AuthScreens;
