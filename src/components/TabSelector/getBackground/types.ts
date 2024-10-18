import type {Animated} from 'react-native';
import type {ThemeColors} from '@styles/theme/types';

/**
 * Configuration for the getBackgroundColor function.
 */
type GetBackgroudColorConfig = {
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
     * The theme colors.
     */
    theme: ThemeColors;

    /**
     * The animated position interpolation.
     */
    position: Animated.AnimatedInterpolation<number>;

    /**
     * Whether the tab is active.
     */
    isActive: boolean;
};

/**
 * Function to get the background color.
 * @param args - The configuration for the background color.
 * @returns The interpolated background color or a string.
 */
type GetBackgroudColor = (args: GetBackgroudColorConfig) => Animated.AnimatedInterpolation<string> | string;

export default GetBackgroudColor;
