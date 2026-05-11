import {BaseNavigationContainer, NavigationIndependentTree} from '@react-navigation/core';
import {DarkTheme, DefaultTheme} from '@react-navigation/native';
import {CardStyleInterpolators} from '@react-navigation/stack';
import type {StackCardInterpolationProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {useMultifactorAuthentication, useMultifactorAuthenticationActions, useMultifactorAuthenticationState} from '@components/MultifactorAuthentication/Context';
import {applyPendingNavigation, clearPendingNavigation, INITIAL_SCREEN, mfaNavigationRef} from '@components/MultifactorAuthentication/mfaNavigation';
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
import type {MultifactorAuthenticationOverlayParamList} from '@navigation/types';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

type InternalParamList = MultifactorAuthenticationOverlayParamList & Record<typeof INITIAL_SCREEN, undefined>;

const Stack = createPlatformStackNavigator<InternalParamList>();

const loadValidateCodePage = () => require<ReactComponentModule>('../../../../pages/MultifactorAuthentication/ValidateCodePage').default;
const loadOutcomePage = () => require<ReactComponentModule>('../../../../pages/MultifactorAuthentication/OutcomePage').default;
const loadPromptPage = () => require<ReactComponentModule>('../../../../pages/MultifactorAuthentication/PromptPage').default;

// Placeholder rendered as the initial route. onLayout triggers the deferred
// push so the card-style interpolator has a measured width for the slide.
function TransparentScreen() {
    const handleLayout = useCallback(() => {
        applyPendingNavigation();
    }, []);
    return (
        <View
            style={StyleSheet.absoluteFill}
            onLayout={handleLayout}
        />
    );
}

const overlayStyles = StyleSheet.create({
    root: {
        zIndex: 1000,
    },
});

function MultifactorAuthenticationOverlay() {
    const state = useMultifactorAuthenticationState();
    const {cancel} = useMultifactorAuthentication();
    const {dispatch} = useMultifactorAuthenticationActions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const theme = useTheme();
    const themePreference = useThemePreference();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const {isModalOpen} = state;
    const [prevIsModalOpen, setPrevIsModalOpen] = useState(isModalOpen);
    const [isClosing, setIsClosing] = useState(false);
    const progress = useSharedValue(0);
    const modalCardStyleInterpolator = useModalCardStyleInterpolator();

    // Mirror isModalOpen transitions during render so the slide-out animation can
    // outlast isModalOpen=false. Cleared by the close-animation completion callback.
    if (prevIsModalOpen !== isModalOpen) {
        setPrevIsModalOpen(isModalOpen);
        setIsClosing(!isModalOpen);
    }

    const isVisible = isModalOpen || isClosing;

    const navigationTheme = useMemo(() => {
        const base = themePreference === CONST.THEME.DARK ? DarkTheme : DefaultTheme;
        return {
            ...base,
            colors: {
                ...base.colors,
                background: shouldUseNarrowLayout ? theme.appBG : 'transparent',
            },
        };
    }, [shouldUseNarrowLayout, theme.appBG, themePreference]);

    useEffect(() => {
        if (isModalOpen) {
            progress.set(withTiming(1, {duration: CONST.ANIMATED_TRANSITION}));
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
        progress.set(withTiming(0, {duration: CONST.ANIMATED_TRANSITION}));
        const cleanupTimer = setTimeout(() => {
            clearPendingNavigation();
            setIsClosing(false);
            dispatch({type: 'RESET'});
        }, CONST.ANIMATED_TRANSITION);
        return () => clearTimeout(cleanupTimer);
    }, [isModalOpen, isClosing, progress, dispatch]);

    const backdropAnimatedStyle = useAnimatedStyle(() => ({
        opacity: progress.get() * variables.overlayOpacity,
    }));

    if (!isVisible) {
        return null;
    }

    return (
        <View
            style={[StyleSheet.absoluteFill, overlayStyles.root]}
            pointerEvents="box-none"
        >
            {!shouldUseNarrowLayout && (
                <Animated.View style={[StyleSheet.absoluteFill, styles.overlayBackground, backdropAnimatedStyle]}>
                    <PressableWithoutFeedback
                        sentryLabel={CONST.SENTRY_LABEL.MFA_OVERLAY.BACKDROP}
                        style={StyleSheet.absoluteFill}
                        onPress={cancel}
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
        </View>
    );
}

MultifactorAuthenticationOverlay.displayName = 'MultifactorAuthenticationOverlay';

export default MultifactorAuthenticationOverlay;
