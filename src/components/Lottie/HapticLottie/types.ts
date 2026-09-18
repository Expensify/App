import type {LottieViewProps} from 'lottie-react-native';
import type {Pattern} from 'react-native-pulsar';

type HapticLottieProps = LottieViewProps & {
    /** Haptic pattern to play in sync with the animation */
    haptics: Pattern;

    /** Length of one pass of the animation, in milliseconds */
    hapticsDurationMs?: number;

    /** Whether the haptics should play at all. The animation is unaffected either way. */
    hapticsEnabled?: boolean;
};

export default HapticLottieProps;
