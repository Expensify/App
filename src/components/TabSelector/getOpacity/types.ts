import type {Animated} from 'react-native';

type GetOpacityConfig = {
    routesLength: number;
    tabIndex: number;
    active: boolean;
    affectedTabs: number[];
    position?: Animated.AnimatedInterpolation<number>;
    isActive?: boolean;
};

type GetOpacity = (args: GetOpacityConfig) => 1 | 0 | Animated.AnimatedInterpolation<number> | undefined;

export default GetOpacity;
