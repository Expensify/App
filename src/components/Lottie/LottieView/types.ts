import type {LottieViewProps as LottieViewNativeProps} from 'lottie-react-native';
import type {ForwardedRef} from 'react';

/** The playback controls <Lottie> and its consumers use, implemented on every platform */
type LottieViewRef = {
    play: () => void;
    pause: () => void;
};

type LottieViewProps = LottieViewNativeProps & {
    ref?: ForwardedRef<LottieViewRef | null>;
};

export type {LottieViewProps, LottieViewRef};
