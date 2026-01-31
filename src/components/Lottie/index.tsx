import {NavigationContainerRefContext, NavigationContext} from '@react-navigation/native';
import type {AnimationObject, LottieViewProps} from 'lottie-react-native';
import LottieView from 'lottie-react-native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import useAppState from '@hooks/useAppState';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import Accessibility from '@libs/Accessibility';
import {getBrowser, isMobile} from '@libs/Browser';
import isSideModalNavigator from '@libs/Navigation/helpers/isSideModalNavigator';
import CONST from '@src/CONST';
import {useSplashScreenState} from '@src/SplashScreenStateContext';

type Props = {
    source: DotLottieAnimation;
    shouldLoadAfterInteractions?: boolean;
} & Omit<LottieViewProps, 'source'>;

function Lottie({source, webStyle, shouldLoadAfterInteractions, ...props}: Props) {
    const animationRef = useRef<LottieView | null>(null);
    const appState = useAppState();
    const {splashScreenState} = useSplashScreenState();
    const styles = useThemeStyles();
    const [isError, setIsError] = React.useState(false);
    const isReduceMotionEnabled = Accessibility.useReducedMotion();

    useNetwork({onReconnect: () => setIsError(false)});

    const [animationFile, setAnimationFile] = useState<string | AnimationObject | {uri: string}>();
    const [isInteractionComplete, setIsInteractionComplete] = useState(false);

    useEffect(() => {
        setAnimationFile(source.file);
    }, [setAnimationFile, source.file]);

    useEffect(() => {
        if (!shouldLoadAfterInteractions) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const interactionTask = InteractionManager.runAfterInteractions(() => {
            setIsInteractionComplete(true);
        });

        return () => {
            interactionTask.cancel();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const aspectRatioStyle = styles.aspectRatioLottie(source);

    const browser = getBrowser();
    const [hasNavigatedAway, setHasNavigatedAway] = React.useState(false);
    const navigationContainerRef = useContext(NavigationContainerRefContext);
    const navigator = useContext(NavigationContext);

    useEffect(() => {
        if (!browser || !navigationContainerRef || !navigator) {
            return;
        }
        const unsubscribeNavigationFocus = navigator.addListener('focus', () => {
            setHasNavigatedAway(false);
            animationRef.current?.play();
        });
        return unsubscribeNavigationFocus;
    }, [browser, navigationContainerRef, navigator]);

    useEffect(() => {
        if (!browser || !navigationContainerRef || !navigator) {
            return;
        }
        const unsubscribeNavigationBlur = navigator.addListener('blur', () => {
            const state = navigationContainerRef.getRootState();
            const targetRouteName = state?.routes?.[state?.index ?? 0]?.name;
            if (!isSideModalNavigator(targetRouteName) || isMobile()) {
                setHasNavigatedAway(true);
            }
        });
        return unsubscribeNavigationBlur;
    }, [browser, navigationContainerRef, navigator]);

    // If user is being navigated away, let pause the animation to prevent memory leak.
    // see issue: https://github.com/Expensify/App/issues/36645
    useEffect(() => {
        if (!animationRef.current || !hasNavigatedAway) {
            return;
        }
        animationRef?.current?.pause();
    }, [hasNavigatedAway]);

    // If the page navigates to another screen, the image fails to load, app is in background state, animation file isn't ready, the splash screen isn't hidden yet,
    // or the user prefers reduced motion, we'll just render an empty view as the fallback to prevent
    // 1. heavy rendering, see issues: https://github.com/Expensify/App/issues/34696 and https://github.com/Expensify/App/issues/47273
    // 2. lag on react navigation transitions, see issue: https://github.com/Expensify/App/issues/44812
    // 3. animation playing for users who have reduced motion enabled (WCAG 2.2.2), see issue: https://github.com/Expensify/App/issues/77157
    if (
        isError ||
        appState.isBackground ||
        !animationFile ||
        hasNavigatedAway ||
        splashScreenState !== CONST.BOOT_SPLASH_STATE.HIDDEN ||
        (!isInteractionComplete && shouldLoadAfterInteractions) ||
        isReduceMotionEnabled
    ) {
        return (
            <View
                style={[aspectRatioStyle, props.style]}
                testID={CONST.LOTTIE_VIEW_TEST_ID}
            />
        );
    }

    return (
        <LottieView
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            source={animationFile}
            key={`${hasNavigatedAway}`}
            ref={(newRef) => {
                animationRef.current = newRef;
            }}
            style={[aspectRatioStyle, props.style]}
            webStyle={{...aspectRatioStyle, ...webStyle}}
            onAnimationFailure={() => setIsError(true)}
            testID={CONST.LOTTIE_VIEW_TEST_ID}
        />
    );
}

export default Lottie;
