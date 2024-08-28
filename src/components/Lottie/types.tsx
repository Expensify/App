import type {LottieViewProps} from 'lottie-react-native';
import type DotLottieAnimation from '@components/LottieAnimations/types';

type BaseLottieProps = {
    source: DotLottieAnimation;

    shouldLoadAfterInteractions?: boolean;
} & Omit<LottieViewProps, 'source'>;

export default BaseLottieProps;
