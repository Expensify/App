import {BaseNavigationContainer, NavigationIndependentTree} from '@react-navigation/core';
import {DarkTheme, DefaultTheme} from '@react-navigation/native';
import {CardStyleInterpolators} from '@react-navigation/stack';
import type {StackCardInterpolationProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {DefaultCancelConfirmModal} from '@components/MultifactorAuthentication/components/Modals';
import {useMultifactorAuthentication, useMultifactorAuthenticationActions, useMultifactorAuthenticationState} from '@components/MultifactorAuthentication/Context';
import type {MultifactorAuthenticationModalNavigatorInternalParamList} from '@components/MultifactorAuthentication/mfaNavigation';
import {handleInitialScreenLayout, INITIAL_SCREEN, mfaNavigationRef, resetMfaNavigation} from '@components/MultifactorAuthentication/mfaNavigation';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemePreference from '@hooks/useThemePreference';
import useThemeStyles from '@hooks/useThemeStyles';
import {isSafari} from '@libs/Browser';
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

function MultifactorAuthenticationModalNavigator() {
    const {isCancelConfirmVisible, isModalOpen, scenario} = useMultifactorAuthenticationState();
    const {requestCancel, hideCancelConfirm, confirmCancel} = useMultifactorAuthentication();
    const {dispatch} = useMultifactorAuthenticationActions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const theme = useTheme();
    const themePreference = useThemePreference();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [prevIsModalOpen, setPrevIsModalOpen] = useState(isModalOpen);
    const [isClosing, setIsClosing] = useState(false);
    const backdropProgress = useSharedValue(0);
    const modalCardStyleInterpolator = useModalCardStyleInterpolator();
    const CancelConfirmModal = scenario?.modals.cancelConfirmation ?? DefaultCancelConfirmModal;

    // Mirror isModalOpen transitions during render so the slide-out animation can
    // outlast isModalOpen=false. Cleared by the close-animation completion callback.
    if (prevIsModalOpen !== isModalOpen) {
        setPrevIsModalOpen(isModalOpen);
        setIsClosing(!isModalOpen);
    }

    const isVisible = isModalOpen || isClosing;

    const navigationThemeBase = themePreference === CONST.THEME.DARK ? DarkTheme : DefaultTheme;
    const navigationTheme = {
        ...navigationThemeBase,
        colors: {
            ...navigationThemeBase.colors,
            background: shouldUseNarrowLayout ? theme.appBG : 'transparent',
        },
    };

    useEffect(() => {
        if (isModalOpen) {
            backdropProgress.set(withTiming(1, {duration: CONST.ANIMATED_TRANSITION}));
            return;
        }
        if (!isClosing) {
            return;
        }
        // Pop the current screen so the Stack plays its slide-out animation,
        // and fade the backdrop simultaneously. Both run for ANIMATED_TRANSITION.
        if (mfaNavigationRef.isReady() && mfaNavigationRef.canGoBack()) {
            mfaNavigationRef.goBack();
        }
        backdropProgress.set(withTiming(0, {duration: CONST.ANIMATED_TRANSITION}));
        const cleanupTimer = setTimeout(() => {
            resetMfaNavigation();
            setIsClosing(false);
            dispatch({type: 'RESET'});
        }, CONST.ANIMATED_TRANSITION);
        return () => clearTimeout(cleanupTimer);
    }, [isModalOpen, isClosing, backdropProgress, dispatch]);

    const backdropAnimatedStyle = useAnimatedStyle(() => ({
        opacity: backdropProgress.get() * variables.overlayOpacity,
    }));

    if (!isVisible) {
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
                                    // forHorizontalIOS from @react-navigation misbehaves on Safari (same reason as RHP — see useRHPScreenOptions),
                                    // so we fall back to the Expensify modal interpolator there.
                                    cardStyleInterpolator: isSafari() ? (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props}) : CardStyleInterpolators.forHorizontalIOS,
                                },
                            }}
                        >
                            <Stack.Screen
                                name={INITIAL_SCREEN}
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
