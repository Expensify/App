import {BaseNavigationContainer, NavigationIndependentTree} from '@react-navigation/core';
import type {StackCardInterpolationProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {DefaultCancelConfirmModal} from '@components/MultifactorAuthentication/components/Modals';
import {useMultifactorAuthenticationInternal} from '@components/MultifactorAuthentication/Context/MultifactorAuthenticationInternalApiContext';
import type {MultifactorAuthenticationModalNavigatorInternalParamList} from '@components/MultifactorAuthentication/mfaNavigation';
import {handleInitialScreenLayout, MFA_INITIAL_SCREEN, mfaNavigationRef} from '@components/MultifactorAuthentication/mfaNavigation';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelActions from '@hooks/useSidePanelActions';
import useSidePanelState from '@hooks/useSidePanelState';
import useTheme from '@hooks/useTheme';
import useThemePreference from '@hooks/useThemePreference';
import useThemeStyles from '@hooks/useThemeStyles';
import getNavigationBaseTheme from '@libs/Navigation/getNavigationBaseTheme';
import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import Presentation from '@libs/Navigation/PlatformStackNavigation/navigationOptions/presentation';
import useModalCardStyleInterpolator from '@navigation/AppNavigator/useModalCardStyleInterpolator';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

const Stack = createPlatformStackNavigator<MultifactorAuthenticationModalNavigatorInternalParamList>();

const loadValidateCodePage = () => require<ReactComponentModule>('../../../../pages/MultifactorAuthentication/ValidateCodePage').default;
const loadOutcomePage = () => require<ReactComponentModule>('../../../../pages/MultifactorAuthentication/OutcomePage').default;
const loadPromptPage = () => require<ReactComponentModule>('../../../../pages/MultifactorAuthentication/PromptPage').default;

// Placeholder rendered as the initial route. onLayout triggers the deferred
// push so the card-style interpolator has a measured width for the slide.
function TransparentScreen() {
    return (
        <View
            style={StyleSheet.absoluteFill}
            onLayout={handleInitialScreenLayout}
        />
    );
}

TransparentScreen.displayName = 'TransparentScreen';

/**
 * Closes the SidePanel on activation and latches `true` only after the close transition ends.
 * Prevents the Stack from mounting while the parent View width is still racing.
 */
function useAwaitSidePanelClose(shouldMount: boolean): boolean {
    const {shouldHideSidePanel, isSidePanelTransitionEnded} = useSidePanelState();
    const {closeSidePanel} = useSidePanelActions();
    const [isSidePanelClosed, setIsSidePanelClosed] = useState(false);

    useEffect(() => {
        if (!shouldMount) {
            return;
        }
        closeSidePanel();
        // closeSidePanel ref is unstable; excluding it prevents the effect from firing twice per activation.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldMount]);

    if (shouldMount && !isSidePanelClosed && shouldHideSidePanel && isSidePanelTransitionEnded) {
        setIsSidePanelClosed(true);
    } else if (!shouldMount && isSidePanelClosed) {
        setIsSidePanelClosed(false);
    }

    return isSidePanelClosed;
}

function MultifactorAuthenticationModalNavigator() {
    const {state, requestCancel, hideCancelConfirm, confirmCancel, notifyModalClosed} = useMultifactorAuthenticationInternal();
    // modalPhase mirrors the machine's top-level state: 'closing' keeps this navigator mounted after
    // the close request so the slide-out can play; 'closed' (machine idle) unmounts it.
    const {isCancelConfirmVisible, modalPhase, scenario} = state;
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const theme = useTheme();
    const themePreference = useThemePreference();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const backdropProgress = useSharedValue(0);
    const modalCardStyleInterpolator = useModalCardStyleInterpolator();
    const CancelConfirmModal = scenario?.modals.cancelConfirmation ?? DefaultCancelConfirmModal;

    const isStackReadyToMount = useAwaitSidePanelClose(modalPhase !== 'closed');

    const navigationThemeBase = getNavigationBaseTheme(themePreference);
    const navigationTheme = {
        ...navigationThemeBase,
        colors: {
            ...navigationThemeBase.colors,
            background: shouldUseNarrowLayout ? theme.appBG : 'transparent',
        },
    };

    useEffect(() => {
        if (modalPhase === 'open') {
            backdropProgress.set(withTiming(1, {duration: CONST.ANIMATED_TRANSITION}));
            return;
        }
        if (modalPhase !== 'closing') {
            return;
        }
        if (mfaNavigationRef.isReady() && mfaNavigationRef.canGoBack()) {
            mfaNavigationRef.goBack();
        }
        // Fade out in lockstep with the screen's slide-out - same duration and easing as the close
        // spec of Animations.SLIDE_FROM_RIGHT (Animated.timing defaults to inOut(ease)). The navigator
        // unmounts on transitionEnd, so any fade longer than the slide gets cut mid-animation.
        backdropProgress.set(withTiming(0, {duration: CONST.MODAL.ANIMATION_TIMING.RHP_DURATION_OUT_WEB, easing: Easing.inOut(Easing.ease)}));
        // MODAL_CLOSED re-enters idle, which flips modalPhase to 'closed' and unmounts this navigator.
        // If this callback is cancelled (unmount mid-close), the machine's closeFallback timer takes
        // over: it re-enters idle on its own, wiping the context and the mfaNavigation buffer.
        const handle = Navigation.runAfterUpcomingTransition(() => {
            notifyModalClosed();
        });
        return () => handle.cancel();
    }, [modalPhase, backdropProgress, notifyModalClosed]);

    const backdropAnimatedStyle = useAnimatedStyle(() => ({
        opacity: backdropProgress.get() * variables.overlayOpacity,
    }));

    if (modalPhase === 'closed') {
        return null;
    }

    return (
        <View
            style={[StyleSheet.absoluteFill, styles.mfaModalNavigatorRoot]}
            pointerEvents="box-none"
        >
            {!shouldUseNarrowLayout && (
                <Animated.View style={[StyleSheet.absoluteFill, styles.overlayBackground, backdropAnimatedStyle]}>
                    <PressableWithoutFeedback
                        sentryLabel={CONST.SENTRY_LABEL.MFA_OVERLAY.BACKDROP}
                        style={StyleSheet.absoluteFill}
                        onPress={requestCancel}
                        accessibilityLabel={translate('common.close')}
                        role={CONST.ROLE.BUTTON}
                        tabIndex={-1}
                    />
                </Animated.View>
            )}
            <View style={[styles.pAbsolute, styles.r0, styles.h100, styles.overflowHidden, shouldUseNarrowLayout ? styles.w100 : {width: variables.sideBarWidth}]}>
                {isStackReadyToMount && (
                    <NavigationIndependentTree>
                        <BaseNavigationContainer
                            ref={mfaNavigationRef}
                            theme={navigationTheme}
                        >
                            <Stack.Navigator
                                screenOptions={{
                                    headerShown: false,
                                    animationTypeForReplace: 'push',
                                    animation: Animations.SLIDE_FROM_RIGHT,
                                    gestureEnabled: false,
                                    native: {contentStyle: styles.navigationScreenCardStyle},
                                    web: {
                                        presentation: Presentation.TRANSPARENT_MODAL,
                                        cardOverlayEnabled: false,
                                        cardStyle: styles.navigationScreenCardStyle,

                                        /**
                                         * Always use the Expensify modal interpolator (not just on Safari like RHP does).
                                         * The MFA navigator pushes the real screen from MFA_INITIAL's onLayout callback,
                                         * so when push fires, the incoming screen's measured width can still be 0.
                                         * forHorizontalIOS interpolates translateX from layouts.screen.width — if width
                                         * is 0 at push start, the slide range collapses to 0→0 and the screen appears
                                         * via opacity only. modalCardStyleInterpolator uses a constant variables.sideBarWidth
                                         * on wide layout, so the slide range is stable regardless of layout timing.
                                         */
                                        cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props, enter: {kind: 'slide-from-width'}}),
                                    },
                                }}
                            >
                                <Stack.Screen
                                    name={MFA_INITIAL_SCREEN}
                                    component={TransparentScreen}
                                    options={{
                                        animation: Animations.NONE,
                                        native: {contentStyle: {backgroundColor: 'transparent'}},
                                        web: {cardStyle: {backgroundColor: 'transparent'}},
                                    }}
                                />
                                <Stack.Screen
                                    name={SCREENS.MULTIFACTOR_AUTHENTICATION.MAGIC_CODE}
                                    getComponent={loadValidateCodePage}
                                />
                                <Stack.Screen
                                    name={SCREENS.MULTIFACTOR_AUTHENTICATION.PROMPT}
                                    getComponent={loadPromptPage}
                                />
                                <Stack.Screen
                                    name={SCREENS.MULTIFACTOR_AUTHENTICATION.OUTCOME_SUCCESS}
                                    getComponent={loadOutcomePage}
                                />
                                <Stack.Screen
                                    name={SCREENS.MULTIFACTOR_AUTHENTICATION.OUTCOME_FAILURE}
                                    getComponent={loadOutcomePage}
                                />
                            </Stack.Navigator>
                        </BaseNavigationContainer>
                    </NavigationIndependentTree>
                )}
            </View>
            <CancelConfirmModal
                isVisible={isCancelConfirmVisible}
                onConfirm={confirmCancel}
                onCancel={hideCancelConfirm}
            />
        </View>
    );
}

MultifactorAuthenticationModalNavigator.displayName = 'MultifactorAuthenticationModalNavigator';

export default MultifactorAuthenticationModalNavigator;
