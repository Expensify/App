import {DialogLabelProvider, useDialogLabelData} from '@components/DialogLabelContext';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import {expandedRHPProgress, thirdOverlayProgress, useWideRHPActions, useWideRHPState} from '@components/WideRHPContextProvider';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelState from '@hooks/useSidePanelState';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {abandonReviewDuplicateTransactions} from '@libs/actions/Transaction';
import {clearTwoFactorAuthData} from '@libs/actions/TwoFactorAuthActions';
import hideKeyboardOnSwipe from '@libs/Navigation/AppNavigator/hideKeyboardOnSwipe';
import * as ModalStackNavigators from '@libs/Navigation/AppNavigator/ModalStackNavigators';
import useModalStackScreenOptions from '@libs/Navigation/AppNavigator/ModalStackNavigators/useModalStackScreenOptions';
import useRHPScreenOptions from '@libs/Navigation/AppNavigator/useRHPScreenOptions';
import calculateReceiptPaneRHPWidth from '@libs/Navigation/helpers/calculateReceiptPaneRHPWidth';
import calculateSuperWideRHPWidth from '@libs/Navigation/helpers/calculateSuperWideRHPWidth';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import createRightModalNavigator from '@navigation/AppNavigator/createRightModalNavigator';
import type {AuthScreensParamList, RightModalNavigatorParamList} from '@navigation/types';

import {PINContextProvider} from '@pages/MissingPersonalDetails/PINContext';
import SearchAdvancedFiltersProvider from '@pages/Search/SearchAdvancedFiltersProvider';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

import type {NavigatorScreenParams} from '@react-navigation/native';
import type {StyleProp, View, ViewStyle} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated, DeviceEventEmitter} from 'react-native';

import {NarrowPaneContextProvider} from './NarrowPaneContext';
import Overlay from './Overlay';

type RightModalNavigatorProps = PlatformStackScreenProps<AuthScreensParamList, typeof NAVIGATORS.RIGHT_MODAL_NAVIGATOR>;

const Stack = createRightModalNavigator<RightModalNavigatorParamList, typeof NAVIGATORS.RIGHT_MODAL_NAVIGATOR>();

const singleRHPWidth = variables.rhpWidth;
const getWideRHPWidth = (windowWidth: number) => variables.wideRHPRightPaneWidth + calculateReceiptPaneRHPWidth(windowWidth);

function MissingPersonalDetailsWithPINContext(props: Record<string, unknown>) {
    return (
        <PINContextProvider>
            <ModalStackNavigators.MissingPersonalDetailsModalStackNavigator {...props} />
        </PINContextProvider>
    );
}

function SearchAdvancedFiltersWithContext(props: Record<string, unknown>) {
    return (
        <SearchAdvancedFiltersProvider>
            <ModalStackNavigators.SearchAdvancedFiltersModalStackNavigator {...props} />
        </SearchAdvancedFiltersProvider>
    );
}

const loadRHPReportScreen = () => require<ReactComponentModule>('../../../../pages/inbox/RHPReportScreen').default;
const loadSearchMoneyRequestReportPage = () => require<ReactComponentModule>('../../../../pages/Search/SearchMoneyRequestReportPage').default;
const loadSearchSavePage = () => require<ReactComponentModule>('../../../../pages/Search/SearchSavePage').default;

type RightModalDialogFrameProps = {
    /** Whether the RHP container should carry dialog semantics (role=dialog + aria-modal) — true on wide layout. */
    hasDialogSemantics: boolean;

    /** Animated style applied to the RHP container. */
    style: React.ComponentProps<typeof Animated.View>['style'];

    /** Callback ref for the container node so the provider can observe node identity changes. */
    onContainerRef: (node: View | null) => void;

    /** RHP stack navigator rendered inside the dialog frame. */
    children: React.ReactNode;
};

/**
 * Applies dialog naming as React props on the RHP container.
 * Imperative setAttribute('aria-label') is invisible to JAWS's virtual buffer; declarative props are not.
 *
 * Wide RHPs always keep role=dialog + aria-modal (including untitled routes like SEARCH_REPORT).
 * aria-label is applied only once the visible title is registered so JAWS can announce a named dialog;
 * Header also announces "{title}, dialog" via a polite live region when the title is ready.
 */
function RightModalDialogFrame({hasDialogSemantics, style, onContainerRef, children}: RightModalDialogFrameProps) {
    const {dialogAriaLabel} = useDialogLabelData();
    const hasName = !!dialogAriaLabel;

    return (
        <Animated.View
            ref={onContainerRef}
            role={hasDialogSemantics ? CONST.ROLE.DIALOG : undefined}
            aria-modal={hasDialogSemantics || undefined}
            aria-label={hasDialogSemantics && hasName ? dialogAriaLabel : undefined}
            // Focusable so SRs / claimDialogFocus can land on the dialog when it has no nested controls.
            tabIndex={hasDialogSemantics ? -1 : undefined}
            style={style}
        >
            {children}
        </Animated.View>
    );
}

function RightModalNavigator({navigation, route}: RightModalNavigatorProps) {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const [containerNode, setContainerNode] = useState<View | null>(null);
    const [setContainerNodeFromRef] = useState(() => (node: View | null) => {
        setContainerNode(node);
    });
    const isExecutingRef = useRef<boolean>(false);
    const screenOptions = useRHPScreenOptions();
    const {superWideRHPRouteKeys, wideRHPRouteKeys, shouldRenderTertiaryOverlay, shouldRenderSecondaryOverlayForRHPOnWideRHP, shouldRenderSecondaryOverlayForRHPOnSuperWideRHP} =
        useWideRHPState();
    const {clearWideRHPKeys, syncRHPKeys} = useWideRHPActions();
    const {windowWidth} = useWindowDimensions();
    const modalStackScreenOptions = useModalStackScreenOptions();
    const styles = useThemeStyles();
    const {sidePanelOffset} = useSidePanelState();

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

    // When the Concierge/Help Side Panel is open on a wide (extra large) layout, it shifts the whole RHP
    // left by its width via paddingRight (see useModalCardStyleInterpolator + SidePanelContextProvider).
    // The super wide RHP already spans almost the full window, so without shrinking it by the same amount
    // its left edge would be pushed off-screen once the Side Panel opens. Subtract the Side Panel offset
    // from the super wide width only (progress === 2) so the sheet's left edge stays put while the Side
    // Panel animates open/closed. See https://github.com/Expensify/App/issues/99035
    const superWideRHPSidePanelOffset = Animated.multiply(expandedRHPProgress.interpolate({inputRange: [0, 1, 2], outputRange: [0, 0, 1], extrapolate: 'clamp'}), sidePanelOffset.current);

    const animatedWidth = Animated.subtract(
        expandedRHPProgress.interpolate({
            inputRange: [0, 1, 2],
            outputRange: [singleRHPWidth, getWideRHPWidth(windowWidth), calculateSuperWideRHPWidth(windowWidth)],
        }),
        superWideRHPSidePanelOffset,
    );

    // Narrow/native are full-bleed. When the RHP is part of the expense-report flow (a report or expense is visible, or
    // a skinny RHP is opened over one), the frame is a horizontally centered modal with the dark dimming scrim — the
    // report, expense, and skinny each become a centered card. Everything else is a right-anchored floating card.
    const useFullBleedFrame = shouldUseNarrowLayout;
    const useCenteredReportModal =
        !useFullBleedFrame &&
        (superWideRHPRouteKeys.length > 0 || wideRHPRouteKeys.length > 0 || shouldRenderSecondaryOverlayForRHPOnWideRHP || shouldRenderSecondaryOverlayForRHPOnSuperWideRHP);

    const animatedWidthStyle = useMemo(() => {
        return {
            width: shouldUseNarrowLayout ? '100%' : animatedWidth,
        } as const;
    }, [animatedWidth, shouldUseNarrowLayout]);

    const overlayPositionLeft = useMemo(() => -1 * calculateSuperWideRHPWidth(windowWidth), [windowWidth]);

    // Narrow/native use a full-bleed frame. The centered report flow uses an invisible frame sized to the widest RHP
    // card and horizontally centered; each RHP card (report / expense / skinny) draws its own centered, bordered modal
    // inside it, and the viewport margins stay outside the frame so the primary dismiss overlay catches click-outside.
    // Everything else is a right-anchored floating card whose frame carries the border, radius, and shadow.
    let frameCardStyle: StyleProp<ViewStyle> = styles.RHPFloatingCard;
    if (useFullBleedFrame) {
        frameCardStyle = [styles.r0, styles.h100];
    } else if (useCenteredReportModal) {
        frameCardStyle = styles.RHPCenteredFrame;
    }

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
                TransitionTracker.runAfterTransitions({callback: () => abandonReviewDuplicateTransactions()});
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
                {!shouldUseNarrowLayout && (
                    <Overlay
                        positionLeftValue={overlayPositionLeft}
                        onPress={handleOverlayPress}
                    />
                )}
                {/* This one is to limit the outer Animated.View and allow the background to be pressable */}
                {/* Without it, the transparent half of the narrow format RHP card would cover the pressable part of the overlay */}
                <DialogLabelProvider
                    containerNode={containerNode}
                    hasDialogSemantics={!isSmallScreenWidth}
                >
                    <RightModalDialogFrame
                        hasDialogSemantics={!isSmallScreenWidth}
                        onContainerRef={setContainerNodeFromRef}
                        style={[
                            styles.pAbsolute,
                            // The docked frame must not clip — its cards draw their own border/shadow that overflows the
                            // frame edges. Narrow/native full-bleed and the right-anchored floating card still clip.
                            !useCenteredReportModal && styles.overflowHidden,
                            // Floating card for every RHP on wide layout (skinny, wide, super-wide). Narrow/native full-bleed.
                            frameCardStyle,
                            animatedWidthStyle,
                        ]}
                    >
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
                                        TransitionTracker.runAfterTransitions({callback: () => clearTwoFactorAuthData(true), waitForUpcomingTransition: true});
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
                                name={SCREENS.RIGHT_MODAL.AVATAR_CROP}
                                component={ModalStackNavigators.AvatarCropModalStackNavigator}
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
                                component={SearchAdvancedFiltersWithContext}
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
                                name={SCREENS.RIGHT_MODAL.AGENT_REPORT}
                                getComponent={loadRHPReportScreen}
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
                    </RightModalDialogFrame>
                </DialogLabelProvider>
                {/* The tertiary overlay covers RHP screens wider than the currently focused screen. Clicking it dismisses to */}
                {/* the RHP screen below. Its width equals the screen width minus the focused RHP width (positionRightValue). */}
                {/* Secondary (report/expense/skinny) dismiss is handled by WideRHPOverlayWrapper, which renders behind the */}
                {/* centered card instead of on top of it, so the card stays fully interactive. */}
                {!shouldUseNarrowLayout && shouldRenderTertiaryOverlay && (
                    <Overlay
                        progress={thirdOverlayProgress}
                        positionRightValue={Animated.add(sidePanelOffset.current, variables.rhpWidth)}
                        onPress={Navigation.dismissToPreviousRHP}
                        // No dimming scrim behind a stacked RHP; keep click-to-dismiss.
                        transparent
                    />
                )}
            </NoDropZone>
        </NarrowPaneContextProvider>
    );
}

export default RightModalNavigator;
