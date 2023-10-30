import LottieView, {LottieViewProps} from 'lottie-react-native';
import React, {CSSProperties, ForwardedRef, forwardRef} from 'react';
import {ViewStyle} from 'react-native';
import DotLottieAnimation from '@components/LottieAnimations/types';
import styles from '@styles/styles';

type Props = {
    animation: DotLottieAnimation;
} & LottieViewProps;

function Lottie({animation, ...props}: Props, ref: ForwardedRef<LottieView>) {
    const source = animation.file;
    const style: ViewStyle = styles.aspectRatioLottie(animation);

    return (
        <LottieView
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            source={source}
            ref={ref}
            style={[props.style, style]}
            webStyle={style as CSSProperties}
        />
    );
}

Lottie.displayName = 'Lottie';

export default forwardRef(Lottie);
