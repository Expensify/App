import type {AnimationObject, LottieViewProps} from 'lottie-react-native';
import LottieView from 'lottie-react-native';
import type {ForwardedRef} from 'react';
import React, {forwardRef, useEffect, useState} from 'react';
import {View} from 'react-native';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import useAppState from '@hooks/useAppState';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';

type Props = {
    source: DotLottieAnimation;
} & Omit<LottieViewProps, 'source'>;

function Lottie({source, webStyle, ...props}: Props, ref: ForwardedRef<LottieView>) {
    const appState = useAppState();
    const styles = useThemeStyles();
    const [isError, setIsError] = React.useState(false);

    useNetwork({onReconnect: () => setIsError(false)});

    const [animationFile, setAnimationFile] = useState<string | AnimationObject | {uri: string}>();

    useEffect(() => {
        setAnimationFile(source.file);
    }, [setAnimationFile, source.file]);

    const aspectRatioStyle = styles.aspectRatioLottie(source);

    // If the image fails to load or app is in background state, we'll just render an empty view
    // using the fallback in case of a Lottie error or appState.isBackground to prevent
    // memory leak, see issue: https://github.com/Expensify/App/issues/36645
    if (isError || appState.isBackground) {
        return <View style={[aspectRatioStyle, props.style]} />;
    }

    return animationFile ? (
        <LottieView
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            source={animationFile}
            ref={ref}
            style={[aspectRatioStyle, props.style]}
            webStyle={{...aspectRatioStyle, ...webStyle}}
            onAnimationFailure={() => setIsError(true)}
        />
    ) : null;
}

Lottie.displayName = 'Lottie';

export default forwardRef(Lottie);
