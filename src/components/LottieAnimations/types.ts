import type {LottieViewProps} from 'lottie-react-native';
import type {ColorValue} from '@styles/utils/types';

type AnimationKey =
    | 'ExpensifyLounge'
    | 'FastMoney'
    | 'Fireworks'
    | 'Hands'
    | 'PreferencesDJ'
    | 'ReviewingBankInfo'
    | 'WorkspacePlanet'
    | 'SaveTheWorld'
    | 'Safe'
    | 'Magician'
    | 'Update'
    | 'Coin';

type DotLottieAnimation = {
    file: LottieViewProps['source'];
    w: number;
    h: number;
    backgroundColor?: ColorValue;
};

export type {AnimationKey};
export default DotLottieAnimation;
