import {useNavigation} from '@react-navigation/native';
import type {AnimationObject, LottieViewProps} from 'lottie-react-native';
import LottieView from 'lottie-react-native';
import type {ForwardedRef} from 'react';
import React, {forwardRef, useEffect, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import useAppState from '@hooks/useAppState';
import useNetwork from '@hooks/useNetwork';
import useSplashScreen from '@hooks/useSplashScreen';
import useThemeStyles from '@hooks/useThemeStyles';
import NAVIGATORS from '@src/NAVIGATORS';

type Props = {
    source: DotLottieAnimation;
} & Omit<LottieViewProps, 'source'>;

function Lottie({source, webStyle, ...props}: Props, ref: ForwardedRef<LottieView>) {
    const appState = useAppState();
    const {isSplashHidden} = useSplashScreen();
    const styles = useThemeStyles();
    const [isError, setIsError] = React.useState(false);
    const [isHidden, setIsHidden] = React.useState(false);
    const navigation = useNavigation();

    useNetwork({onReconnect: () => setIsError(false)});

    const [animationFile, setAnimationFile] = useState<string | AnimationObject | {uri: string}>();
    const [isInteractionComplete, setIsInteractionComplete] = useState(false);

    useEffect(() => {
        setAnimationFile(source.file);
    }, [setAnimationFile, source.file]);

    useEffect(() => {
        const unsubscribeNavigationFocus = navigation.addListener('focus', () => {
            setIsHidden(false);
        });
        return unsubscribeNavigationFocus;
    }, [navigation]);

    // Prevent the animation from running in the background after navigating to other pages.
    // See https://github.com/Expensify/App/issues/47273
    useEffect(() => {
        const unsubscribeNavigationBlur = navigation.addListener('blur', () => {
            const state = navigation.getState();
            const targetRouteName = state?.routes?.[state?.index ?? 0]?.name;
            if (targetRouteName !== NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
                setIsHidden(true);
            }
        });
        return unsubscribeNavigationBlur;
    }, [navigation]);

    useEffect(() => {
        const interactionTask = InteractionManager.runAfterInteractions(() => {
            setIsInteractionComplete(true);
        });

        return () => {
            interactionTask.cancel();
        };
    }, []);

    const aspectRatioStyle = styles.aspectRatioLottie(source);

    // If the image fails to load, app is in background state, animation file isn't ready, or the splash screen isn't hidden yet,
    // we'll just render an empty view as the fallback to prevent
    // 1. memory leak, see issue: https://github.com/Expensify/App/issues/36645
    // 2. heavy rendering, see issue: https://github.com/Expensify/App/issues/34696
    // 3. lag on react navigation transitions, see issue: https://github.com/Expensify/App/issues/44812
    if (isError || isHidden || appState.isBackground || !animationFile || !isSplashHidden || !isInteractionComplete) {
        return <View style={[aspectRatioStyle, props.style]} />;
    }

    return (
        <LottieView
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            source={animationFile}
            ref={ref}
            style={[aspectRatioStyle, props.style]}
            webStyle={{...aspectRatioStyle, ...webStyle}}
            onAnimationFailure={() => setIsError(true)}
        />
    );
}

Lottie.displayName = 'Lottie';

export default forwardRef(Lottie);
