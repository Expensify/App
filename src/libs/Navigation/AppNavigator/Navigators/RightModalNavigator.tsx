import type {NavigatorScreenParams} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import type {StackCardInterpolationProps} from '@react-navigation/stack';
import React, {useCallback, useContext, useMemo, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated, InteractionManager} from 'react-native';
import NoDropZone from '@components/DragAndDrop/NoDropZone';
import {animatedWideRHPWidth, expandedRHPProgress, innerRHPProgress, secondOverlayProgress, thirdOverlayProgress, WideRHPContext} from '@components/WideRHPContextProvider';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {abandonReviewDuplicateTransactions} from '@libs/actions/Transaction';
import {clearTwoFactorAuthData} from '@libs/actions/TwoFactorAuthActions';
import hideKeyboardOnSwipe from '@libs/Navigation/AppNavigator/hideKeyboardOnSwipe';
import * as ModalStackNavigators from '@libs/Navigation/AppNavigator/ModalStackNavigators';
import useModalCardStyleInterpolator from '@libs/Navigation/AppNavigator/useModalCardStyleInterpolator';
import useRHPScreenOptions from '@libs/Navigation/AppNavigator/useRHPScreenOptions';
import calculateReceiptPaneRHPWidth from '@libs/Navigation/helpers/calculateReceiptPaneRHPWidth';
import calculateSuperWideRHPWidth from '@libs/Navigation/helpers/calculateSuperWideRHPWidth';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList, RightModalNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import {NarrowPaneContextProvider} from './NarrowPaneContext';
import Overlay from './Overlay';

type RightModalNavigatorProps = PlatformStackScreenProps<AuthScreensParamList, typeof NAVIGATORS.RIGHT_MODAL_NAVIGATOR>;

const Stack = createPlatformStackNavigator<RightModalNavigatorParamList, string>();

const singleRHPWidth = variables.sideBarWidth;
const getWideRHPWidth = (windowWidth: number) => variables.sideBarWidth + calculateReceiptPaneRHPWidth(windowWidth);

function RightModalNavigator({navigation, route}: RightModalNavigatorProps) {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const isExecutingRef = useRef<boolean>(false);
    const screenOptions = useRHPScreenOptions();
    const {shouldRenderSecondaryOverlay, isWideRHPFocused, shouldRenderTertiaryOverlay, isWideRHPClosing, clearWideRHPKeys, syncWideRHPKeys, syncSuperWideRHPKeys} =
        useContext(WideRHPContext);
    const {windowWidth} = useWindowDimensions();
    const modalCardStyleInterpolator = useModalCardStyleInterpolator();
    const styles = useThemeStyles();

    const animatedWidth = expandedRHPProgress.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [singleRHPWidth, getWideRHPWidth(windowWidth), calculateSuperWideRHPWidth(windowWidth)],
    });

    const animatedWidthStyle = useMemo(() => {
        return {
            width: shouldUseNarrowLayout ? '100%' : animatedWidth,
        } as const;
    }, [animatedWidth, shouldUseNarrowLayout]);

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
                // eslint-disable-next-line @typescript-eslint/no-deprecated
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
        navigation.goBack();
        setTimeout(() => {
            isExecutingRef.current = false;
        }, CONST.ANIMATED_TRANSITION);
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
            syncWideRHPKeys();
            syncSuperWideRHPKeys();

            return () => clearWideRHPKeysAfterTabChanged();
        }, [syncWideRHPKeys, syncSuperWideRHPKeys, clearWideRHPKeysAfterTabChanged]),
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
                <Animated.View style={[styles.pAbsolute, styles.r0, styles.h100, styles.overflowHidden, animatedWidthStyle]}>
                    <Stack.Navigator
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
                                    // eslint-disable-next-line @typescript-eslint/no-deprecated
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
                            name={SCREENS.RIGHT_MODAL.SEARCH_REPORT}
                            component={ModalStackNavigators.SearchReportModalStackNavigator}
                            options={{
                                web: {
                                    cardStyleInterpolator: (props: StackCardInterpolationProps) =>
                                        // Add 1 to change range from [0, 1] to [1, 2]
                                        // Don't use outputMultiplier for the narrow layout
                                        modalCardStyleInterpolator({
                                            props,
                                            shouldAnimateSidePanel: true,

                                            // Adjust output range to match the wide RHP size
                                            outputRangeMultiplier: isSmallScreenWidth
                                                ? undefined
                                                : Animated.add(Animated.multiply(innerRHPProgress, variables.receiptPaneRHPMaxWidth / variables.sideBarWidth), 1),
                                        }),
                                },
                            }}
                        />
                        <Stack.Screen
                            name={SCREENS.RIGHT_MODAL.RESTRICTED_ACTION}
                            component={ModalStackNavigators.RestrictedActionModalStackNavigator}
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
                            component={ModalStackNavigators.MissingPersonalDetailsModalStackNavigator}
                        />
                        <Stack.Screen
                            name={SCREENS.RIGHT_MODAL.ADD_UNREPORTED_EXPENSE}
                            component={ModalStackNavigators.AddUnreportedExpenseModalStackNavigator}
                        />
                        <Stack.Screen
                            name={SCREENS.RIGHT_MODAL.SCHEDULE_CALL}
                            component={ModalStackNavigators.ScheduleCallModalStackNavigator}
                        />
                        <Stack.Screen
                            name={SCREENS.RIGHT_MODAL.DOMAIN}
                            component={ModalStackNavigators.WorkspacesDomainModalStackNavigator}
                        />
                    </Stack.Navigator>
                </Animated.View>
                {/* The third and second overlays are displayed here to cover RHP screens wider than the currently focused screen. */}
                {/* Clicking on these overlays redirects you to the RHP screen below them. */}
                {/* The width of these overlays is equal to the width of the screen minus the width of the currently focused RHP screen (positionRightValue) */}
                {shouldRenderSecondaryOverlay && !shouldUseNarrowLayout && !isWideRHPFocused && !isWideRHPClosing && (
                    <Overlay
                        progress={secondOverlayProgress}
                        positionRightValue={variables.sideBarWidth}
                        onPress={Navigation.dismissToFirstRHP}
                    />
                )}
                {shouldRenderSecondaryOverlay && !shouldUseNarrowLayout && !!isWideRHPFocused && (
                    <Overlay
                        progress={secondOverlayProgress}
                        positionRightValue={animatedWideRHPWidth}
                        onPress={Navigation.dismissToFirstRHP}
                    />
                )}
                {shouldRenderTertiaryOverlay && !shouldUseNarrowLayout && (
                    <Overlay
                        progress={thirdOverlayProgress}
                        positionRightValue={variables.sideBarWidth}
                        onPress={Navigation.dismissToSecondRHP}
                    />
                )}
            </NoDropZone>
        </NarrowPaneContextProvider>
    );
}

RightModalNavigator.displayName = 'RightModalNavigator';

export default RightModalNavigator;
