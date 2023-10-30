import LottieView, {LottieViewProps} from 'lottie-react-native';
import React, {CSSProperties, ForwardedRef, forwardRef} from 'react';
import {View, ViewStyle} from 'react-native';
import DotLottieAnimation from '@components/LottieAnimations/types';
import useNetwork from '@hooks/useNetwork';
import styles from '@styles/styles';

type Props = {
    animation: DotLottieAnimation;
} & LottieViewProps;

function Lottie({animation, ...props}: Props, ref: ForwardedRef<LottieView>) {
    const [isError, setIsError] = React.useState(false);

    useNetwork({onReconnect: () => setIsError(false)});

    const style: ViewStyle = styles.aspectRatioLottie(animation);

    // If the image fails to load, we'll just render an empty view
    if (isError) {
        return <View style={style} />;
    }

    return (
        <LottieView
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            source={animation.file}
            ref={ref}
            style={[props.style, style]}
            webStyle={style as CSSProperties}
            onAnimationFailure={() => setIsError(true)}
        />
    );
}

Lottie.displayName = 'Lottie';

export default forwardRef(Lottie);
