import LottieView, {LottieViewProps} from 'lottie-react-native';
import React, {ForwardedRef, forwardRef} from 'react';
import {View} from 'react-native';
import DotLottieAnimation from '@components/LottieAnimations/types';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@styles/useThemeStyles';

type Props = {
    source: DotLottieAnimation;
} & Omit<LottieViewProps, 'source'>;

function Lottie({source, webStyle, ...props}: Props, ref: ForwardedRef<LottieView>) {
    const styles = useThemeStyles();
    const [isError, setIsError] = React.useState(false);

    useNetwork({onReconnect: () => setIsError(false)});

    const aspectRatioStyle = styles.aspectRatioLottie(source);

    // If the image fails to load, we'll just render an empty view
    if (isError) {
        return <View style={aspectRatioStyle} />;
    }

    return (
        <LottieView
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            source={source.file}
            ref={ref}
            style={[aspectRatioStyle, props.style]}
            webStyle={{...aspectRatioStyle, ...webStyle}}
            onAnimationFailure={() => setIsError(true)}
        />
    );
}

Lottie.displayName = 'Lottie';

export default forwardRef(Lottie);
