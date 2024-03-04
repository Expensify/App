import type {LottieViewProps} from 'lottie-react-native';
import type {ColorValue} from '@styles/utils/types';

type DotLottieAnimation = {
    file: LottieViewProps['source'];
    w: number;
    h: number;
    backgroundColor?: ColorValue;
};

export default DotLottieAnimation;
