import LottieView, {LottieViewProps} from 'lottie-react-native';
import React, {forwardRef} from 'react';
import useThemeStyles from '@styles/useThemeStyles';

const Lottie = forwardRef<LottieView, LottieViewProps>((props: LottieViewProps, ref) => {
    const styles = useThemeStyles();
    return (
        <LottieView
            // eslint-disable-next-line
            {...props}
            ref={ref}
            style={[styles.aspectRatioLottie(props.source), props.style]}
        />
    );
});

export default Lottie;
