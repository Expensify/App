import type {Animated} from 'react-native';
import type {ThemeColors} from '@styles/theme/types';

type AnimationConfigBase = {
    /**
     * The number of routes.
     */
    routesLength: number;

    /**
     * The index of the current tab.
     */
    tabIndex: number;

    /**
     * The indices of the affected tabs.
     */
    affectedTabs: number[];

    /**
     * The animated position interpolation.
     */
    position: Animated.AnimatedInterpolation<number> | undefined;

    /**
     * Whether the tab is active.
     */
    isActive: boolean;
};

type GetBackgroundColorConfig = AnimationConfigBase & {
    /**
     * The theme colors.
     */
    theme: ThemeColors;
};

type GetOpacityConfig = AnimationConfigBase & {
    /**
     * Whether we are calculating the opacity for the active tab.
     */
    active: boolean;
};

type BackgroundColor = Animated.AnimatedInterpolation<string> | string;

type Opacity = 1 | 0 | Animated.AnimatedInterpolation<number>;

export type {BackgroundColor, GetBackgroundColorConfig, Opacity, GetOpacityConfig};
