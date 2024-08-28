import type {AnimationObject} from 'lottie-react-native';
import LottieView from 'lottie-react-native';
import type {ForwardedRef} from 'react';
import React, {forwardRef, useEffect, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import useAppState from '@hooks/useAppState';
import useNetwork from '@hooks/useNetwork';
import useSplashScreen from '@hooks/useSplashScreen';
import useThemeStyles from '@hooks/useThemeStyles';
import type BaseLottieProps from './types';

function BaseLottie({source, webStyle, shouldLoadAfterInteractions, ...props}: BaseLottieProps, ref: ForwardedRef<LottieView>) {
    const appState = useAppState();
    const {isSplashHidden} = useSplashScreen();
    const styles = useThemeStyles();
    const [isError, setIsError] = React.useState(false);

    useNetwork({onReconnect: () => setIsError(false)});

    const [animationFile, setAnimationFile] = useState<string | AnimationObject | {uri: string}>();
    const [isInteractionComplete, setIsInteractionComplete] = useState(false);

    useEffect(() => {
        setAnimationFile(source.file);
    }, [setAnimationFile, source.file]);

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
    if (isError || appState.isBackground || !animationFile || !isSplashHidden || (!isInteractionComplete && shouldLoadAfterInteractions)) {
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

BaseLottie.displayName = 'Lottie';

export default forwardRef(BaseLottie);
