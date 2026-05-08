import {BaseNavigationContainer, NavigationIndependentTree} from '@react-navigation/core';
import {DarkTheme, DefaultTheme} from '@react-navigation/native';
import type {StackCardInterpolationProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {runOnJS, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {useMultifactorAuthentication, useMultifactorAuthenticationActions, useMultifactorAuthenticationState} from '@components/MultifactorAuthentication/Context';
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

    const resetState = useCallback(() => {
        clearPendingNavigation();
        setIsVisible(false);
        dispatch({type: 'RESET'});
    }, [dispatch]);

    useEffect(() => {
        if (isModalOpen) {
            setIsVisible(true);
            progress.value = withTiming(1, {duration: CONST.ANIMATED_TRANSITION});
        } else if (isVisible) {
            progress.value = withTiming(0, {duration: CONST.ANIMATED_TRANSITION}, (finished) => {
                if (!finished) {
                    return;
                }
                runOnJS(resetState)();
            });
        }
        // eslint-disable-next-line react-compiler/react-compiler -- shared value is stable
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only trigger on isModalOpen change
    }, [isModalOpen]);

    const backdropAnimatedStyle = useAnimatedStyle(() => ({
        opacity: progress.value * variables.overlayOpacity,
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
                                // RHP-style interpolator: uses fixed sideBarWidth instead of measured
                                // card width, which is 0 on the first push in a fresh navigator.
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
                        </Stack.Navigator>
                    </BaseNavigationContainer>
                </NavigationIndependentTree>
            </View>
        </View>
    );
}

MultifactorAuthenticationOverlay.displayName = 'MultifactorAuthenticationOverlay';

export default MultifactorAuthenticationOverlay;
