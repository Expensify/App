import type {NavigatorScreenParams} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated, DeviceEventEmitter, InteractionManager} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {DialogLabelProvider} from '@components/DialogLabelContext';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import {animatedWideRHPWidth, expandedRHPProgress, secondOverlayWideRHPProgress, useWideRHPActions, useWideRHPState} from '@components/WideRHPContextProvider';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelState from '@hooks/useSidePanelState';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {abandonReviewDuplicateTransactions} from '@libs/actions/Transaction';
import {clearTwoFactorAuthData} from '@libs/actions/TwoFactorAuthActions';
import hideKeyboardOnSwipe from '@libs/Navigation/AppNavigator/hideKeyboardOnSwipe';
import * as ModalStackNavigators from '@libs/Navigation/AppNavigator/ModalStackNavigators';
import useModalStackScreenOptions from '@libs/Navigation/AppNavigator/ModalStackNavigators/useModalStackScreenOptions';
import useCenteredRHPModalStyle from '@libs/Navigation/AppNavigator/useCenteredRHPModalStyle';
import useIsCenteredRHPModal from '@libs/Navigation/AppNavigator/useIsCenteredRHPModal';
import useRHPScreenOptions from '@libs/Navigation/AppNavigator/useRHPScreenOptions';
import calculateReceiptPaneRHPWidth from '@libs/Navigation/helpers/calculateReceiptPaneRHPWidth';
import calculateSuperWideRHPWidth from '@libs/Navigation/helpers/calculateSuperWideRHPWidth';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import createRightModalNavigator from '@navigation/AppNavigator/createRightModalNavigator';
import type {AuthScreensParamList, RightModalNavigatorParamList} from '@navigation/types';
import {PINContextProvider} from '@pages/MissingPersonalDetails/PINContext';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';
import {NarrowPaneContextProvider} from './NarrowPaneContext';
import Overlay from './Overlay';

type RightModalNavigatorProps = PlatformStackScreenProps<AuthScreensParamList, typeof NAVIGATORS.RIGHT_MODAL_NAVIGATOR>;

const Stack = createRightModalNavigator<RightModalNavigatorParamList, typeof NAVIGATORS.RIGHT_MODAL_NAVIGATOR>();

const singleRHPWidth = variables.sideBarWidth;
const getWideRHPWidth = (windowWidth: number) => variables.sideBarWidth + calculateReceiptPaneRHPWidth(windowWidth);

function MissingPersonalDetailsWithPINContext(props: Record<string, unknown>) {
    return (
        <PINContextProvider>
            <ModalStackNavigators.MissingPersonalDetailsModalStackNavigator {...props} />
        </PINContextProvider>
    );
}

function SecondaryOverlay() {
    const {shouldRenderSecondaryOverlayForWideRHP} = useWideRHPState();
    const {sidePanelOffset} = useSidePanelState();

    if (shouldRenderSecondaryOverlayForWideRHP) {
        return (
            <Overlay
                progress={secondOverlayWideRHPProgress}
                positionRightValue={Animated.add(sidePanelOffset.current, animatedWideRHPWidth)}
                onPress={() => Navigation.closeRHPFlow()}
            />
        );
    }

    // PoC: a small RHP floating above a wide/super-wide pane is now a centered modal whose dim + dismiss is handled by the
    // in-card backdrop (see ModalStackNavigators), so the docked secondary overlays for those cases are no longer rendered here.
    return null;
}

const loadRHPReportScreen = () => require<ReactComponentModule>('../../../../pages/inbox/RHPReportScreen').default;
const loadSearchMoneyRequestReportPage = () => require<ReactComponentModule>('../../../../pages/Search/SearchMoneyRequestReportPage').default;
const loadSearchSavePage = () => require<ReactComponentModule>('../../../../pages/Search/SearchSavePage').default;

function RightModalNavigator({navigation, route}: RightModalNavigatorProps) {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const containerRef = useRef(null);
    const isExecutingRef = useRef<boolean>(false);
    const screenOptions = useRHPScreenOptions();
    const {superWideRHPRouteKeys, wideRHPRouteKeys, shouldRenderSecondaryOverlayForRHPOnWideRHP, shouldRenderSecondaryOverlayForRHPOnSuperWideRHP} = useWideRHPState();
    const {clearWideRHPKeys, syncRHPKeys} = useWideRHPActions();
    const {windowWidth} = useWindowDimensions();
    const modalStackScreenOptions = useModalStackScreenOptions();
    const styles = useThemeStyles();

    // When a fullscreen route is pre-inserted under the RHP, disable the slide-out animation
    // so the dismiss reveals the destination instantly. If the pre-insert is later cleaned up
    // (user backs out without submitting), restore the default animation for that session.
    useEffect(() => {
        const disableSub = DeviceEventEmitter.addListener(CONST.MODAL_EVENTS.DISABLE_RHP_ANIMATION, () => {
            navigation.setOptions({animation: Animations.NONE});
        });
        const restoreSub = DeviceEventEmitter.addListener(CONST.MODAL_EVENTS.RESTORE_RHP_ANIMATION, () => {
            navigation.setOptions({animation: Animations.SLIDE_FROM_RIGHT});
        });
        return () => {
            disableSub.remove();
            restoreSub.remove();
        };
    }, [navigation]);

    // Animation should be disabled when we open the wide rhp from the narrow one.
    // When the wide rhp page is opened as first one, it will be animated with the entire RightModalNavigator.
    const animationEnabledOnSearchReport = superWideRHPRouteKeys.length > 0 || wideRHPRouteKeys.length > 0 || isSmallScreenWidth;

    const animatedWidth = expandedRHPProgress.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [singleRHPWidth, getWideRHPWidth(windowWidth), calculateSuperWideRHPWidth(windowWidth)],
    });

    const animatedWidthStyle = useMemo(() => {
        return {
            width: shouldUseNarrowLayout ? '100%' : animatedWidth,
        } as const;
    }, [animatedWidth, shouldUseNarrowLayout]);

    // PoC: render "small" RHPs (everything except the wide/super-wide expense & report panes) as a centered modal on wide layout.
    const isCenteredModal = useIsCenteredRHPModal();
    const centeredModalStyle = useCenteredRHPModalStyle();

    // PoC: true only while a small RHP is the focused centered modal floating above a wide/super-wide pane. In that state the
    // container must span the full viewport (so the centered card isn't clipped and the wide pane card keeps its right:0
    // position) and pass through touches on the empty area to that card's own dim overlay (see useRHPScreenOptions), which also
    // handles dismiss - so we suppress the top-level background overlay to avoid double-dimming. When the wide pane itself is the
    // focused top card (no centered modal above it) this is false, so we keep the legacy right-docked container and its
    // background overlay still dismisses the wide pane.
    const isFocusedCenteredModalOverWidePane = !isSmallScreenWidth && (shouldRenderSecondaryOverlayForRHPOnWideRHP || shouldRenderSecondaryOverlayForRHPOnSuperWideRHP);

    // A wide/super-wide pane is somewhere in the stack (focused or below). Used to tell a wide pane apart from a standalone
    // small RHP, since both are "centered modal" on wide layout per useIsCenteredRHPModal.
    const hasWidePane = superWideRHPRouteKeys.length > 0 || wideRHPRouteKeys.length > 0;

    let containerLayoutStyle: StyleProp<ViewStyle> = [styles.r0, styles.h100, animatedWidthStyle];
    if (isFocusedCenteredModalOverWidePane) {
        // Small RHP floating above a wide/super-wide pane: full-viewport container so the centered card isn't clipped.
        containerLayoutStyle = [styles.t0, styles.l0, styles.r0, styles.b0];
    } else if (isCenteredModal && !hasWidePane) {
        // Standalone small RHP (no wide pane in the stack): the container itself is the centered box. A wide pane that is the
        // focused top card keeps the default right-docked container above.
        containerLayoutStyle = centeredModalStyle;
    }

    const overlayPositionLeft = useMemo(() => -1 * calculateSuperWideRHPWidth(windowWidth), [windowWidth]);

    const screenListeners = useMemo(
        () => ({
            blur: () => {
                const rhpParams = navigation.getState().routes.find((innerRoute) => innerRoute.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR)?.params as
                    | NavigatorScreenParams<RightModalNavigatorParamList>
                    | undefined;

                if (rhpParams?.screen === SCREENS.RIGHT_MODAL.TRANSACTION_DUPLICATE || route.params?.screen !== SCREENS.RIGHT_MODAL.TRANSACTION_DUPLICATE) {
                    return;
                }
                // Delay clearing review duplicate data till the RHP is completely closed
                // to avoid not found showing briefly in confirmation page when RHP is closing
                InteractionManager.runAfterInteractions(() => {
                    abandonReviewDuplicateTransactions();
                });
            },
        }),
        [navigation, route.params?.screen],
    );

    const handleOverlayPress = useCallback(() => {
        if (isExecutingRef.current) {
            return;
        }
        isExecutingRef.current = true;
        const currentState = navigationRef.getRootState();

        // There is a brief moment when the RHP is not in the state anymore but the overlay is still visible (closing RHP animation)
        // We need to block overlay press function in such case because it would go back from the currently active full screen.
        // Without this, the bug described in https://github.com/Expensify/App/issues/78440 would occur.
        if (currentState.routes.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
            navigation.goBack();
            setTimeout(() => {
                isExecutingRef.current = false;
            }, CONST.ANIMATED_TRANSITION);
        } else {
            isExecutingRef.current = false;
        }
    }, [navigation]);

    const clearWideRHPKeysAfterTabChanged = useCallback(() => {
        const isRhpOpened = navigationRef?.getRootState()?.routes?.some((rootStateRoute) => rootStateRoute.key === route.key);
        const isFullScreenTopmostRoute = isFullScreenName(navigationRef.getRootState()?.routes?.at(-1)?.name);
        const hasTabChanged = isRhpOpened && isFullScreenTopmostRoute;
        if (!hasTabChanged) {
            return;
        }
        clearWideRHPKeys();
    }, [clearWideRHPKeys, route.key]);

    useFocusEffect(
        useCallback(() => {
            // When we open a second RightModalNavigator while the previous one is covered by a fullscreen navigator, we need to synchronize the keys.
            syncRHPKeys();

            // Super wide and wide route keys have to be cleared when the RightModalNavigator is not closed and a new navigator is opened above it.
            return () => clearWideRHPKeysAfterTabChanged();
        }, [syncRHPKeys, clearWideRHPKeysAfterTabChanged]),
    );

    return (
        <NarrowPaneContextProvider>
            <NoDropZone>
                {/* PoC: the primary overlay is the original RHP dim, kept mounted on wide layout even while a centered modal is open
                    above a wide pane. The centered modal adds its own second full-screen dim on top (see ModalStackNavigators index);
                    keeping this one mounted underneath means closing the modal only fades that second dim away, so the underlying RHP
                    dim never blinks (previously it was suppressed during the modal and re-appeared late on close, causing the blink). */}
                {!shouldUseNarrowLayout && (
                    <Overlay
                        positionLeftValue={overlayPositionLeft}
                        onPress={handleOverlayPress}
                    />
                )}
                {/* This one is to limit the outer Animated.View and allow the background to be pressable */}
                {/* Without it, the transparent half of the narrow format RHP card would cover the pressable part of the overlay */}
                <Animated.View
                    ref={containerRef}
                    role={isSmallScreenWidth ? undefined : CONST.ROLE.DIALOG}
                    aria-modal={isSmallScreenWidth ? undefined : true}
                    pointerEvents={isFocusedCenteredModalOverWidePane ? 'box-none' : undefined}
                    style={[styles.pAbsolute, styles.overflowHidden, containerLayoutStyle]}
                >
                    <DialogLabelProvider containerRef={containerRef}>
                        <Stack.Navigator
                            parentRoute={route}
                            screenOptions={screenOptions}
                            screenListeners={screenListeners}
                            id={NAVIGATORS.RIGHT_MODAL_NAVIGATOR}
                        >
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.SETTINGS}
                                component={ModalStackNavigators.SettingsModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.TWO_FACTOR_AUTH}
                                component={ModalStackNavigators.TwoFactorAuthenticatorStackNavigator}
                                listeners={{
                                    beforeRemove: () => {
                                        InteractionManager.runAfterInteractions(() => clearTwoFactorAuthData(true));
                                    },
                                }}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.NEW_CHAT}
                                component={ModalStackNavigators.NewChatModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.PROFILE}
                                component={ModalStackNavigators.ProfileModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.DEBUG}
                                component={ModalStackNavigators.DebugModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.NEW_REPORT_WORKSPACE_SELECTION}
                                component={ModalStackNavigators.NewReportWorkspaceSelectionModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.REPORT_DETAILS}
                                component={ModalStackNavigators.ReportDetailsModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.REPORT_CARD_ACTIVATE}
                                component={ModalStackNavigators.ReportCardActivateStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.REPORT_CHANGE_WORKSPACE}
                                component={ModalStackNavigators.ReportChangeWorkspaceModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.REPORT_CHANGE_APPROVER}
                                component={ModalStackNavigators.ReportChangeApproverModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.REPORT_SETTINGS}
                                component={ModalStackNavigators.ReportSettingsModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.REPORT_DESCRIPTION}
                                component={ModalStackNavigators.ReportDescriptionModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.CHRONOS_SCHEDULE_OOO}
                                component={ModalStackNavigators.ChronosScheduleOOOModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.REPORT_VERIFY_ACCOUNT}
                                component={ModalStackNavigators.ReportVerifyAccountModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.SETTINGS_CATEGORIES}
                                component={ModalStackNavigators.CategoriesModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.SETTINGS_TAGS}
                                component={ModalStackNavigators.TagsModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.EXPENSIFY_CARD}
                                component={ModalStackNavigators.ExpensifyCardModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.DOMAIN_CARD}
                                component={ModalStackNavigators.DomainCardModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.PARTICIPANTS}
                                component={ModalStackNavigators.ReportParticipantsModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.ROOM_MEMBERS}
                                component={ModalStackNavigators.RoomMembersModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.MONEY_REQUEST}
                                component={ModalStackNavigators.MoneyRequestModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.WORKSPACE_CONFIRMATION}
                                component={ModalStackNavigators.WorkspaceConfirmationModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.WORKSPACE_DUPLICATE}
                                component={ModalStackNavigators.WorkspaceDuplicateModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.POLICY_COPY_SETTINGS}
                                component={ModalStackNavigators.PolicyCopySettingsModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.NEW_TASK}
                                component={ModalStackNavigators.NewTaskModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.TEACHERS_UNITE}
                                component={ModalStackNavigators.NewTeachersUniteNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.TASK_DETAILS}
                                component={ModalStackNavigators.TaskModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.ENABLE_PAYMENTS}
                                component={ModalStackNavigators.EnablePaymentsStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.SPLIT_DETAILS}
                                component={ModalStackNavigators.SplitDetailsModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.ADD_PERSONAL_BANK_ACCOUNT}
                                component={ModalStackNavigators.AddPersonalBankAccountModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.WALLET_STATEMENT}
                                component={ModalStackNavigators.WalletStatementStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.FLAG_COMMENT}
                                component={ModalStackNavigators.FlagCommentStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.EDIT_REQUEST}
                                component={ModalStackNavigators.EditRequestStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.SIGN_IN}
                                component={ModalStackNavigators.SignInModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.REFERRAL}
                                component={ModalStackNavigators.ReferralModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.PRIVATE_NOTES}
                                component={ModalStackNavigators.PrivateNotesModalStackNavigator}
                                options={hideKeyboardOnSwipe}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.TRANSACTION_DUPLICATE}
                                component={ModalStackNavigators.TransactionDuplicateStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.MERGE_TRANSACTION}
                                component={ModalStackNavigators.MergeTransactionStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.TRAVEL}
                                component={ModalStackNavigators.TravelModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.SEARCH_REPORT_ACTIONS}
                                component={ModalStackNavigators.SearchReportActionsModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.RESTRICTED_ACTION}
                                component={ModalStackNavigators.RestrictedActionModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.SEARCH_SAVE}
                                getComponent={loadSearchSavePage}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.SEARCH_ADVANCED_FILTERS}
                                component={ModalStackNavigators.SearchAdvancedFiltersModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.SEARCH_SAVED_SEARCH}
                                component={ModalStackNavigators.SearchSavedSearchModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.MISSING_PERSONAL_DETAILS}
                                component={MissingPersonalDetailsWithPINContext}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.ADD_EXISTING_EXPENSE}
                                component={ModalStackNavigators.AddExistingExpenseModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.SCHEDULE_CALL}
                                component={ModalStackNavigators.ScheduleCallModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.SEARCH_REPORT}
                                getComponent={loadRHPReportScreen}
                                options={(props) => {
                                    const options = modalStackScreenOptions(props);
                                    return {...options, animation: animationEnabledOnSearchReport ? Animations.SLIDE_FROM_RIGHT : Animations.NONE};
                                }}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.EXPENSE_REPORT}
                                getComponent={loadSearchMoneyRequestReportPage}
                                options={(props) => {
                                    const options = modalStackScreenOptions(props);
                                    return {...options, animation: isSmallScreenWidth ? Animations.SLIDE_FROM_RIGHT : Animations.NONE};
                                }}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT}
                                getComponent={loadSearchMoneyRequestReportPage}
                                options={(props) => {
                                    const options = modalStackScreenOptions(props);
                                    return {...options, animation: isSmallScreenWidth ? Animations.SLIDE_FROM_RIGHT : Animations.NONE};
                                }}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.DOMAIN}
                                component={ModalStackNavigators.WorkspacesDomainModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.SEARCH_COLUMNS}
                                component={ModalStackNavigators.SearchColumnsModalStackNavigator}
                            />
                            <Stack.Screen
                                name={SCREENS.RIGHT_MODAL.MULTIFACTOR_AUTHENTICATION}
                                component={ModalStackNavigators.MultifactorAuthenticationStackNavigator}
                            />
                        </Stack.Navigator>
                    </DialogLabelProvider>
                </Animated.View>
                {/* The third and second overlays are displayed here to cover RHP screens wider than the currently focused screen. */}
                {/* Clicking on these overlays redirects you to the RHP screen below them. */}
                {/* The width of these overlays is equal to the width of the screen minus the width of the currently focused RHP screen (positionRightValue) */}
                {!shouldUseNarrowLayout && <SecondaryOverlay />}
            </NoDropZone>
        </NarrowPaneContextProvider>
    );
}

export default RightModalNavigator;
