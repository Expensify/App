import LottieView, {LottieViewProps} from 'lottie-react-native';
import React, {forwardRef} from 'react';
import styles from '@styles/styles';

const Lottie = forwardRef<LottieView, LottieViewProps>((props: LottieViewProps, ref) => (
    <LottieView
        // eslint-disable-next-line
        {...props}
        ref={ref}
        style={[styles.aspectRatioLottie(props.source), props.style]}
    />
));

export default Lottie;
