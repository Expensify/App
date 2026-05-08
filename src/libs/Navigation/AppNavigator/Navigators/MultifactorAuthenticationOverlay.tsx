import {BaseNavigationContainer, NavigationIndependentTree} from '@react-navigation/core';
import {DarkTheme, DefaultTheme} from '@react-navigation/native';
import type {StackCardInterpolationProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {runOnJS, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {useMultifactorAuthentication, useMultifactorAuthenticationState} from '@components/MultifactorAuthentication/Context';
import {applyPendingNavigation, clearPendingNavigation, INITIAL_SCREEN, mfaNavigationRef} from '@components/MultifactorAuthentication/mfaNavigation';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemePreference from '@hooks/useThemePreference';
import useThemeStyles from '@hooks/useThemeStyles';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
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
const loadNotFoundPage = () => require<ReactComponentModule>('../../../../pages/ErrorPage/NotFoundPage').default;

// The placeholder INITIAL_SCREEN. Pushing the real screen from onLayout
// (rather than from BaseNavigationContainer.onReady) guarantees that React
// Navigation has measured the card width before the push — otherwise the
// forHorizontalIOS card-style interpolator interpolates translateX from a
// zero-width layout and the slide-in animation visually flattens to a fade.
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
    offscreen: {
        position: 'absolute',
        width: 1,
        height: 1,
        overflow: 'hidden',
        opacity: 0,
    },
});

function MultifactorAuthenticationOverlay() {
    const state = useMultifactorAuthenticationState();
    const {cancel} = useMultifactorAuthentication();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const theme = useTheme();
    const themePreference = useThemePreference();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const isFlowActive = !!state.scenario;
    const [isVisible, setIsVisible] = useState(false);
    const progress = useSharedValue(0);
    const modalCardStyleInterpolator = useModalCardStyleInterpolator();

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
        if (isFlowActive) {
            setIsVisible(true);
            progress.value = withTiming(1, {duration: CONST.ANIMATED_TRANSITION});
        } else if (isVisible) {
            progress.value = withTiming(0, {duration: CONST.ANIMATED_TRANSITION}, (finished) => {
                if (!finished) {
                    return;
                }
                runOnJS(clearPendingNavigation)();
                runOnJS(setIsVisible)(false);
            });
        }
        // eslint-disable-next-line react-compiler/react-compiler -- shared value is stable
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only trigger on isFlowActive change
    }, [isFlowActive]);

    const backdropAnimatedStyle = useAnimatedStyle(() => ({
        opacity: progress.value * variables.overlayOpacity,
    }));

    return (
        <View
            style={isVisible ? [StyleSheet.absoluteFill, overlayStyles.root] : overlayStyles.offscreen}
            pointerEvents={isVisible ? 'box-none' : 'none'}
        >
            {isVisible && !shouldUseNarrowLayout && (
                <Animated.View style={[StyleSheet.absoluteFill, styles.overlayBackground, backdropAnimatedStyle]}>
                    <PressableWithoutFeedback
                        style={StyleSheet.absoluteFill}
                        onPress={cancel}
                        accessibilityLabel={translate('common.close')}
                        role={CONST.ROLE.BUTTON}
                        tabIndex={-1}
                    />
                </Animated.View>
            )}
            <View style={[styles.pAbsolute, styles.r0, styles.h100, styles.overflowHidden, shouldUseNarrowLayout ? styles.w100 : {width: variables.sideBarWidth}]}>
                {isVisible && (
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
                                    // Use the Expensify modal interpolator (RHP-style): it hardcodes the slide
                                    // distance to variables.sideBarWidth on wide layout instead of relying on
                                    // the measured card layout width. The default forHorizontalIOS interpolator
                                    // reads layouts.screen.width, which is 0 at the moment of the first push
                                    // inside this freshly-mounted nested navigator — making the slide invisible.
                                    web: {
                                        cardStyle: styles.navigationScreenCardStyle,
                                        cardStyleInterpolator: (props: StackCardInterpolationProps) => modalCardStyleInterpolator({props}),
                                    },
                                }}
                            >
                                <Stack.Screen
                                    name={INITIAL_SCREEN}
                                    component={TransparentScreen}
                                    options={{animation: Animations.NONE}}
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
                                <Stack.Screen
                                    name={SCREENS.MULTIFACTOR_AUTHENTICATION.NOT_FOUND}
                                    getComponent={loadNotFoundPage}
                                />
                            </Stack.Navigator>
                        </BaseNavigationContainer>
                    </NavigationIndependentTree>
                )}
            </View>
        </View>
    );
}

MultifactorAuthenticationOverlay.displayName = 'MultifactorAuthenticationOverlay';

export default MultifactorAuthenticationOverlay;
