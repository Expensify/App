import type DotLottieAnimation from '@components/LottieAnimations/types';
import type {LottieViewProps} from 'lottie-react-native';

type BaseLottieProps = {
    source: DotLottieAnimation;

    shouldLoadAfterInteractions?: boolean;
} & Omit<LottieViewProps, 'source'>;

export default BaseLottieProps;