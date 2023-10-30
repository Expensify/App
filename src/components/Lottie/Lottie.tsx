import LottieView, {LottieViewProps} from 'lottie-react-native';
import React, {forwardRef} from 'react';
import styles from '@styles/styles';

type Props = {
  animation: DotLottieAnimation;
} & LottieViewProps;

function Lottie({source, animation, ...props}: Props, ref: ForwardedRef<LottieView>) {
  let finalSource = source;
  let style: ViewStyle = {aspectRatio: animation.w / animation.h, width: '100%'};

  if (animation) {
    finalSource = animation.file;
  } else {
    style = styles.aspectRatioLottie(source);
  }

  return <LottieView
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        source={finalSource}
        ref={ref}
        style={[props.style, style]}
        webStyle={style as CSSProperties}
    />
}

Lottie.displayName = 'Lottie';

export default forwardRef(Lottie);
