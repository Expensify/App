import LottieView, {LottieViewProps} from 'lottie-react-native';
import React, {forwardRef} from 'react';
import {View} from 'react-native';
import styles from '@styles/styles';

const Lottie = forwardRef<LottieView, LottieViewProps>((props: LottieViewProps, ref) => {
    const aspectRatioStyle = styles.aspectRatioLottie(props.source);

    return (
        <View style={[aspectRatioStyle, styles.w100]}>
            <LottieView
                // eslint-disable-next-line
                {...props}
                ref={ref}
                style={[aspectRatioStyle, props.style]}
                webStyle={{...aspectRatioStyle, ...props.webStyle}}
            />
        </View>
    );
});

export default Lottie;
