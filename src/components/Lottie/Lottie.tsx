import React, {ForwardedRef, forwardRef} from 'react';
import LottieView, {LottieViewProps} from 'lottie-react-native';
import styles from '../../styles/styles';

function Lottie(props: LottieViewProps, ref: ForwardedRef<LottieView>) {
  return <LottieView
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
        style={[styles.aspectRatioLottie(props.source), props.style]}
    />
}

Lottie.displayName = 'Lottie';

export default forwardRef(Lottie);
