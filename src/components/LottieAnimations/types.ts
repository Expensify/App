import type {ColorValue} from '@styles/utils/types';

import type {LottieViewProps} from 'lottie-react-native';

type DotLottieAnimation = {
    file: LottieViewProps['source'];
    w: number;
    h: number;
    backgroundColor?: ColorValue;
};

export default DotLottieAnimation;
