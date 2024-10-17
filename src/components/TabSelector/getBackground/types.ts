import type {Animated} from 'react-native';
import type {ThemeColors} from '@styles/theme/types';

type GetBackgroudColorConfig = {
    routesLength: number;
    tabIndex: number;
    affectedTabs: number[];
    theme: ThemeColors;
    position?: Animated.AnimatedInterpolation<number>;
    isActive?: boolean;
};

type GetBackgroudColor = (args: GetBackgroudColorConfig) => Animated.AnimatedInterpolation<string> | string;

export default GetBackgroudColor;
