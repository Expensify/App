import {NavigationContainerRefContext, NavigationContext} from '@react-navigation/native';
import type {AnimationObject, LottieViewProps} from 'lottie-react-native';
import LottieView from 'lottie-react-native';
import type {ForwardedRef} from 'react';
import React, {forwardRef, useContext, useEffect, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import useAppState from '@hooks/useAppState';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Browser from '@libs/Browser';
import isSideModalNavigator from '@libs/Navigation/isSideModalNavigator';
import CONST from '@src/CONST';
import {useSplashScreenStateContext} from '@src/SplashScreenStateContext';

type Props = {
    source: DotLottieAnimation;
    shouldLoadAfterInteractions?: boolean;
} & Omit<LottieViewProps, 'source'>;

function Lottie({source, webStyle, shouldLoadAfterInteractions, ...props}: Props, forwardedRef: ForwardedRef<LottieView>) {
    const animationRef = useRef<LottieView | null>(null);
    const appState = useAppState();
    const {splashScreenState} = useSplashScreenStateContext();
    const styles = useThemeStyles();
    const [isError, setIsError] = React.useState(false);

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

        const interactionTask = InteractionManager.runAfterInteractions(() => {
            setIsInteractionComplete(true);
        });

        return () => {
            interactionTask.cancel();
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    const aspectRatioStyle = styles.aspectRatioLottie(source);

    const browser = Browser.getBrowser();
    const [hasNavigatedAway, setHasNavigatedAway] = React.useState(false);
    const navigationContainerRef = useContext(NavigationContainerRefContext);
    const navigator = useContext(NavigationContext);

    useEffect(() => {
        if (!browser || !navigationContainerRef || !navigator) {
            return;
        }
        const unsubscribeNavigationFocus = navigator.addListener('focus', () => {
            setHasNavigatedAway(false);
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
            if (!isSideModalNavigator(targetRouteName)) {
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

    // If the page navigates to another screen, the image fails to load, app is in background state, animation file isn't ready, or the splash screen isn't hidden yet,
    // we'll just render an empty view as the fallback to prevent
    // 1. heavy rendering, see issues: https://github.com/Expensify/App/issues/34696 and https://github.com/Expensify/App/issues/47273
    // 2. lag on react navigation transitions, see issue: https://github.com/Expensify/App/issues/44812
    if (isError || appState.isBackground || !animationFile || splashScreenState !== CONST.BOOT_SPLASH_STATE.HIDDEN || (!isInteractionComplete && shouldLoadAfterInteractions)) {
        return <View style={[aspectRatioStyle, props.style]} />;
    }

    return (
        <LottieView
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            source={animationFile}
            ref={(ref) => {
                if (typeof forwardedRef === 'function') {
                    forwardedRef(ref);
                } else if (forwardedRef && 'current' in forwardedRef) {
                    // eslint-disable-next-line no-param-reassign
                    forwardedRef.current = ref;
                }
                animationRef.current = ref;
            }}
            style={[aspectRatioStyle, props.style]}
            webStyle={{...aspectRatioStyle, ...webStyle}}
            onAnimationFailure={() => setIsError(true)}
        />
    );
}

Lottie.displayName = 'Lottie';

export default forwardRef(Lottie);
