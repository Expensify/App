import LottieView, {LottieViewProps} from 'lottie-react-native';
import React, {CSSProperties, ForwardedRef, forwardRef} from 'react';
import {ViewStyle, Text} from 'react-native';
import DotLottieAnimation from '@components/LottieAnimations/types';
import styles from '@styles/styles';
import useNetwork from '@hooks/useNetwork';

type Props = {
    animation: DotLottieAnimation;
} & LottieViewProps;

function Lottie({animation, ...props}: Props, ref: ForwardedRef<LottieView>) {
    const [isError, setIsError] = React.useState(false);

    const source = animation.file;
    const style: ViewStyle = styles.aspectRatioLottie(animation);

    useNetwork({onReconnect: () => {
      console.log('reconnected, load image again');
      setIsError(false);
    }});

    if (isError) {
        return <Text>Animation not loaded. You are offline!</Text>;
    }

    return (
        <LottieView
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            source={source}
            ref={ref}
            style={[props.style, style]}
            webStyle={style as CSSProperties}
            onAnimationFailure={(error) => {
              console.log('animation failure', error);
              setIsError(true);
            }}
        />
    );
}

Lottie.displayName = 'Lottie';

export default forwardRef(Lottie);
